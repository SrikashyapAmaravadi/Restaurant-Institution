import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import prisma from '../config/db.js';
import {
  authenticateToken,
  requireRole,
  recordAuditLog
} from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { sendOtpSchema, verifyOtpSchema, loginSchema } from '../validators/index.js';
import { sendOtpEmail } from '../services/email.service.js';
import { resolveInstitutionalEmail } from '../services/institution-access.js';
import { generateNumericOtp, hashOtp, otpMatches, randomPasswordHashSource } from '../lib/otp.js';
import {
  generateAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken
} from '../lib/tokens.js';
import { setAuthCookies, clearAuthCookies, getRefreshTokenFromRequest } from '../lib/cookies.js';
import { isProduction } from '../config/env.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this network. Please try again in 15 minutes.'
  }
});

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  safeUser.homePath = safeUser.homePath || (
    safeUser.role === 'SUPER_ADMIN' ? '/management/superadmin' :
    safeUser.role === 'RESTAURANT_ADMIN' || safeUser.role === 'RESTAURANT_STAFF' ? '/management/admin' :
    '/dashboard'
  );
  return safeUser;
}

async function completeLogin(req, res, user, method) {
  const accessToken = generateAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);
  setAuthCookies(res, { accessToken, refreshToken });

  await recordAuditLog(req, {
    action: `USER_LOGGED_IN_${method}`,
    entityType: 'User',
    entityId: user.id,
    details: { email: user.email, method }
  });

  return res.json({
    success: true,
    message: 'Signed in',
    data: {
      user: publicUser(user),
      token: accessToken
    }
  });
}

const DEV_FIXED_OTP = '123456';

async function handleSendOtp(req, res) {
  try {
    const resolved = await resolveInstitutionalEmail(req.body.email);
    if (resolved.error) {
      return res.status(400).json({ success: false, error: resolved.error });
    }

    const { email: emailLower } = resolved;
    // Generate a real random 6-digit OTP code for email delivery
    const code = generateNumericOtp();
    const codeHash = hashOtp(emailLower, code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingReq = await prisma.verificationRequest.findFirst({
      where: { email: emailLower },
      orderBy: { createdAt: 'desc' }
    });

    if (existingReq) {
      await prisma.verificationRequest.update({
        where: { id: existingReq.id },
        data: {
          codeHash,
          verificationCode: null,
          expiresAt,
          status: 'CODE_SENT',
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.verificationRequest.create({
        data: {
          email: emailLower,
          name: emailLower.split('@')[0],
          role: 'Student',
          idProof: 'INSTITUTIONAL_OTP',
          codeHash,
          verificationCode: null,
          expiresAt,
          status: 'CODE_SENT'
        }
      });
    }

    // Attempt email dispatch if production OR if RESEND_API_KEY is configured
    if (isProduction || process.env.RESEND_API_KEY) {
      try {
        await sendOtpEmail({ to: emailLower, otp: code });
      } catch (emailErr) {
        if (isProduction) throw emailErr;
        console.warn(`[DEV_EMAIL_WARNING] Could not dispatch live email to ${emailLower}:`, emailErr.message);
      }
    } else {
      console.log(`[DEV_OTP] ${emailLower} → ${code}`);
    }

    const payload = {
      success: true,
      message: isProduction
        ? `A 6-digit one-time passkey has been sent to ${emailLower}.`
        : `Dev mode — OTP auto-filled below.`,
      expiresIn: 600
    };

    // Always echo OTP in dev so the client can auto-fill it
    if (!isProduction) {
      payload.devOtp = code;
    }

    res.json(payload);
  } catch (err) {
    console.error('[AUTH_SEND_OTP_ERROR]', err);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
}

router.post('/send-otp', authLimiter, validate(sendOtpSchema), handleSendOtp);
router.post('/resend-code', authLimiter, validate(sendOtpSchema), handleSendOtp);

router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), async (req, res) => {
  try {
    const resolved = await resolveInstitutionalEmail(req.body.email);
    if (resolved.error) {
      return res.status(400).json({ success: false, error: resolved.error });
    }

    const { email: emailLower, institution } = resolved;
    const otpStr = String(req.body.otp).trim();

    const dbReq = await prisma.verificationRequest.findFirst({
      where: { email: emailLower, status: 'CODE_SENT' },
      orderBy: { updatedAt: 'desc' }
    });

    if (!dbReq?.codeHash) {
      return res.status(400).json({
        success: false,
        error: 'No active OTP request found for this email. Please request a new OTP.'
      });
    }

    if (dbReq.expiresAt && dbReq.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'Your OTP has expired. Please request a new code.' });
    }

    const isDevFallback = !isProduction && otpStr === DEV_FIXED_OTP;
    if (!isDevFallback && !otpMatches(emailLower, otpStr, dbReq.codeHash)) {
      return res.status(400).json({ success: false, error: 'Invalid verification code. Please check the code sent to your email.' });
    }

    await prisma.verificationRequest.update({
      where: { id: dbReq.id },
      data: { status: 'VERIFIED', codeHash: null, verificationCode: null }
    });

    const prefix = emailLower.split('@')[0];
    const isRollNumber = /^[a-z]{1,3}\d{2}[a-z]{2,5}\d{2,5}$/i.test(prefix) || /^bu\d+/i.test(prefix);
    const rollNumber = isRollNumber ? prefix.toUpperCase() : null;

    let user = await prisma.user.findUnique({ where: { email: emailLower } });
    const passwordHash = bcrypt.hashSync(randomPasswordHashSource(), 12);

    if (!user) {
      let cleanName = req.body.name?.trim();
      if (!cleanName) {
        cleanName = isRollNumber
          ? `Student ${rollNumber}`
          : prefix.split(/[._-]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      }

      user = await prisma.user.create({
        data: {
          name: cleanName,
          email: emailLower,
          passwordHash,
          role: 'STUDENT',
          roleLabel: `Member (${institution.name})`,
          department: institution.name,
          rollNumber,
          institution: institution.name,
          institutionId: institution.id,
          verified: true,
          homePath: '/dashboard',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=1E3A8A&color=fff`
        }
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'success',
          title: 'Institutional email verified',
          body: `Welcome. Your ${institution.name} membership is verified.`,
          read: false
        }
      }).catch(() => {});
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          verified: true,
          institutionId: user.institutionId || institution.id,
          institution: user.institution || institution.name,
          ...(rollNumber && !user.rollNumber ? { rollNumber } : {})
        }
      });
    }

    return completeLogin(req, res, user, 'OTP');
  } catch (err) {
    console.error('[AUTH_VERIFY_OTP_ERROR]', err);
    res.status(500).json({ success: false, error: 'OTP verification failed' });
  }
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }
    if (String(password).length < 10) {
      return res.status(400).json({ success: false, error: 'Password must be at least 10 characters' });
    }

    const resolved = await resolveInstitutionalEmail(email);
    if (resolved.error) {
      return res.status(400).json({ success: false, error: resolved.error });
    }

    const { email: emailLower, institution } = resolved;
    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists' });
    }

    const user = await prisma.user.create({
      data: {
        name: String(name).trim().slice(0, 80),
        email: emailLower,
        passwordHash: bcrypt.hashSync(password, 12),
        role: 'STUDENT',
        roleLabel: `Member (${institution.name})`,
        department: institution.name,
        institution: institution.name,
        institutionId: institution.id,
        verified: false,
        homePath: '/dashboard'
      }
    });

    await prisma.verificationRequest.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: 'STUDENT',
        idProof: 'REGISTRATION',
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Account created. Verify with the one-time passkey sent after OTP request.',
      data: { user: publicUser(user) }
    });
  } catch (err) {
    console.error('[AUTH_REGISTER_ERROR]', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const resolved = await resolveInstitutionalEmail(email);
    const emailLower = resolved.email || String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    return completeLogin(req, res, user, 'PASSWORD');
  } catch (err) {
    console.error('[AUTH_LOGIN_ERROR]', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.post('/google', authLimiter, async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const { idToken } = req.body || {};
    if (!clientId) {
      return res.status(503).json({
        success: false,
        error: 'Google SSO is not configured. Use institutional OTP sign-in.'
      });
    }
    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Google ID token is required' });
    }

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    const payload = await googleRes.json();
    if (!googleRes.ok || payload.aud !== clientId || (payload.email_verified !== 'true' && payload.email_verified !== true)) {
      return res.status(401).json({ success: false, error: 'Google token verification failed' });
    }

    const resolved = await resolveInstitutionalEmail(payload.email);
    if (resolved.error) {
      return res.status(400).json({ success: false, error: resolved.error });
    }

    const { email: emailLower, institution } = resolved;
    let user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: payload.name || emailLower.split('@')[0],
          email: emailLower,
          passwordHash: bcrypt.hashSync(randomPasswordHashSource(), 12),
          role: 'STUDENT',
          roleLabel: `Member (${institution.name})`,
          department: institution.name,
          institution: institution.name,
          institutionId: institution.id,
          verified: true,
          homePath: '/dashboard',
          avatar: payload.picture || null
        }
      });
    } else if (!user.verified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { verified: true, institutionId: user.institutionId || institution.id }
      });
    }

    return completeLogin(req, res, user, 'GOOGLE');
  } catch (err) {
    console.error('[AUTH_GOOGLE_ERROR]', err);
    res.status(500).json({ success: false, error: 'Google SSO authentication failed' });
  }
});

router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const raw = getRefreshTokenFromRequest(req);
    const rotated = await rotateRefreshToken(raw);
    if (!rotated) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, error: 'Refresh token is invalid or expired' });
    }
    setAuthCookies(res, {
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken
    });
    res.json({
      success: true,
      data: {
        user: publicUser(rotated.user),
        token: rotated.accessToken
      }
    });
  } catch (err) {
    console.error('[AUTH_REFRESH_ERROR]', err);
    res.status(500).json({ success: false, error: 'Could not refresh session' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await revokeRefreshToken(getRefreshTokenFromRequest(req));
  } catch {
    // ignore
  }
  clearAuthCookies(res);
  res.json({ success: true, message: 'Signed out' });
});

router.get('/me', authenticateToken, async (req, res) => {
  res.json({ success: true, data: publicUser(req.user) });
});

router.post('/verify-code', authLimiter, async (req, res) => {
  try {
    const { code, email } = req.body;
    if (!code || String(code).trim().length !== 6 || !email) {
      return res.status(400).json({
        success: false,
        error: 'Email and a valid 6-digit passkey are required'
      });
    }

    const resolved = await resolveInstitutionalEmail(email);
    if (resolved.error) {
      return res.status(400).json({ success: false, error: resolved.error });
    }

    const emailLower = resolved.email;
    const matchedRequest = await prisma.verificationRequest.findFirst({
      where: { email: emailLower, status: 'CODE_SENT' },
      orderBy: { updatedAt: 'desc' }
    });

    if (!matchedRequest?.codeHash || !otpMatches(emailLower, code, matchedRequest.codeHash)) {
      return res.status(400).json({ success: false, error: 'Invalid verification code.' });
    }

    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { verified: true }
    });
    await prisma.verificationRequest.update({
      where: { id: matchedRequest.id },
      data: { status: 'VERIFIED', codeHash: null, verificationCode: null }
    });

    res.json({
      success: true,
      message: 'Account verified successfully!',
      data: publicUser(updated)
    });
  } catch (err) {
    console.error('[AUTH_VERIFY_ERROR]', err);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});


router.post('/switch-role', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  if (isProduction) {
    return res.status(403).json({ success: false, error: 'Endpoint disabled in production environment' });
  }
  return res.status(403).json({
    success: false,
    error: 'Role impersonation is disabled. Sign in with the target account.'
  });
});

export default router;
