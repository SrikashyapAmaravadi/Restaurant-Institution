import prisma from '../config/db.js';

function normalizeDomain(domain) {
  return String(domain || '')
    .trim()
    .replace(/^@/, '')
    .toLowerCase();
}

export function emailLocalAndHost(email) {
  const emailLower = String(email || '').trim().toLowerCase();
  const at = emailLower.lastIndexOf('@');
  if (at === -1) return { local: emailLower, host: '' };
  return { local: emailLower.slice(0, at), host: emailLower.slice(at + 1) };
}

export async function findInstitutionForEmail(email) {
  const { host } = emailLocalAndHost(email);
  if (!host) return null;
  const institutions = await prisma.institution.findMany({
    where: { status: { in: ['ACTIVE', 'PILOT'] } }
  });
  return (
    institutions.find((institution) => normalizeDomain(institution.domain) === host) || null
  );
}

export async function resolveInstitutionalEmail(rawEmail) {
  let emailLower = String(rawEmail || '').trim().toLowerCase();
  if (!emailLower) return { error: 'Email is required' };

  if (!emailLower.includes('@')) {
    const primary = await prisma.institution.findFirst({
      where: { isPrimary: true, status: { in: ['ACTIVE', 'PILOT'] } }
    });
    if (!primary) {
      return { error: 'No primary institution is configured for roll-number login' };
    }
    emailLower = `${emailLower}@${normalizeDomain(primary.domain)}`;
  }

  const institution = await findInstitutionForEmail(emailLower);
  if (!institution) {
    return {
      error:
        'Access is limited to approved university or enterprise domains. Personal email addresses are not eligible.'
    };
  }

  return { email: emailLower, institution };
}
