import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  ChefHat,
  ConciergeBell,
  Shield,
  UtensilsCrossed,
  Building2,
  Loader2
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [program, setProgram] = useState('B.Tech CSE');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isBennettEmail = email.trim().toLowerCase().endsWith('@bennett.edu.in');

  const roleOptions = [
    { key: 'STUDENT', label: 'Student / Faculty', icon: GraduationCap },
    { key: 'RESTAURANT_ADMIN', label: 'Restaurant Owner', icon: ChefHat },
    { key: 'RESTAURANT_STAFF', label: 'Host Desk Staff', icon: ConciergeBell },
    { key: 'SUPER_ADMIN', label: 'Super Admin', icon: Shield },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === 'STUDENT' && !isBennettEmail) {
      setErrorMsg('Student & Faculty accounts require an official @bennett.edu.in institutional email.');
      return;
    }

    setSubmitted(true);
    setErrorMsg('');

    try {
      const newUser = await signup({
        name: fullName,
        email,
        role,
        department: program,
        password
      });

      if (role === 'STUDENT') {
        navigate('/pending-approval', { state: { email, department: program, homePath: newUser?.homePath } });
      } else {
        navigate('/verify', { state: { email, homePath: newUser?.homePath } });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      setSubmitted(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        padding: '40px 20px'
      }}
    >
      <div
        className="card anim-scale-in"
        style={{
          width: '100%',
          maxWidth: 540,
          padding: '36px 36px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--primary) 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px var(--primary-glow)'
            }}
          >
            <GraduationCap size={28} />
          </div>
          <h2 className="font-display" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>
            Create an Institutional Account
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--t3)' }}>
            Select your RBAC role to configure your personalized dining portal.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '11px 14px',
              borderRadius: 'var(--r-sm)',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: 13,
              marginBottom: 18
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Role Selection */}
          <div>
            <label className="form-label">Select Your Role (RBAC)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {roleOptions.map(r => {
                const Icon = r.icon;
                const isSelected = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--r-xs)',
                      background: isSelected ? 'var(--primary-subtle)' : '#F8FAFC',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      color: isSelected ? 'var(--primary)' : 'var(--t2)',
                      fontSize: 12,
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: isSelected ? '0 2px 8px var(--primary-glow)' : 'none',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <Icon size={16} style={{ color: isSelected ? 'var(--primary)' : 'var(--t3)' }} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="form-label">Full Name</label>
            <div className="form-input-wrap">
              <User size={16} className="form-input-icon" style={{ color: 'var(--primary)' }} />
              <input
                className="form-input"
                required
                placeholder="e.g. Aryan Mehta"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>
                {role === 'STUDENT' ? 'Bennett Institutional Email' : 'Work Email Address'}
              </label>
              {role === 'STUDENT' && email && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isBennettEmail ? '#059669' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {isBennettEmail ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {isBennettEmail ? 'Domain Validated' : 'Requires @bennett.edu.in'}
                </span>
              )}
            </div>
            <div className="form-input-wrap">
              <Mail size={16} className="form-input-icon" style={{ color: 'var(--primary)' }} />
              <input
                className="form-input"
                type="email"
                required
                placeholder={role === 'STUDENT' ? 'name@bennett.edu.in' : 'name@restaurant.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ borderColor: role === 'STUDENT' && email && !isBennettEmail ? '#DC2626' : undefined }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Department / Program</label>
            <div className="form-input-wrap">
              <Building2 size={16} className="form-input-icon" style={{ color: 'var(--t3)' }} />
              <input
                className="form-input"
                value={program}
                onChange={e => setProgram(e.target.value)}
                placeholder={role === 'STUDENT' ? 'B.Tech CSE' : 'The Spice Garden'}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Create Password</label>
            <div className="form-input-wrap">
              <Lock size={16} className="form-input-icon" style={{ color: 'var(--accent)' }} />
              <input
                className="form-input"
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              padding: 12,
              borderRadius: 'var(--r-xs)',
              background: '#F8FAFC',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: 11.5,
              color: 'var(--t3)'
            }}
          >
            <ShieldCheck size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
            <span>
              Your account will be provisioned with Role-Based Access Control policies for <strong>{role}</strong>.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-fw cursor-pointer"
            disabled={submitted || (role === 'STUDENT' && email && !isBennettEmail)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {submitted ? (
              <><Loader2 size={16} className="animate-spin" /> Provisioning RBAC Profile...</>
            ) : (
              <><span>Sign Up & Continue</span> <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--t3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
