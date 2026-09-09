import { Star, ArrowRight, CheckCircle2, Clock, XCircle, MinusCircle, AlertCircle } from 'lucide-react';

// Badge component
export function Badge({ children, variant = 'muted', icon: Icon }) {
  const variants = {
    success: 'bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[rgba(16,185,129,0.25)]',
    warning: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border border-[rgba(245,158,11,0.25)]',
    error:   'bg-[rgba(239,68,68,0.12)] text-[#EF4444] border border-[rgba(239,68,68,0.25)]',
    info:    'bg-[rgba(74,144,155,0.12)] text-[#4A909B] border border-[rgba(74,144,155,0.25)]',
    primary: 'bg-[var(--primary-subtle)] text-[var(--primary)] border border-[rgba(200,109,81,0.25)]',
    muted:   'bg-[rgba(255,255,255,0.05)] text-[var(--t3)] border border-[var(--border)]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${variants[variant] || variants.muted}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

// Stars component using Lucide icons
export function Stars({ rating = 0, size = 13 }) {
  const full = Math.floor(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--accent)]">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < full ? 'fill-current text-[var(--accent)]' : 'text-[rgba(255,255,255,0.2)]'}
        />
      ))}
    </span>
  );
}

// RatingDisplay
export function RatingDisplay({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <Stars rating={rating} />
      <span className="font-bold text-sm text-[var(--t1)]">{rating}</span>
      {count !== undefined && <span className="text-xs text-[var(--t3)]">({count})</span>}
    </div>
  );
}

// Section header
export function SectionHeader({ title, linkLabel, onLink }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="font-display text-2xl font-semibold text-[var(--t1)]">{title}</h2>
      {linkLabel && (
        <button
          onClick={onLink}
          className="text-sm font-semibold text-[var(--primary)] flex items-center gap-1 hover:text-[var(--primary-light)] transition-colors cursor-pointer"
        >
          {linkLabel} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

// Button
export function Btn({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--r-sm)] transition-all duration-200 cursor-pointer border border-transparent';
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-7 py-4 text-base',
  };
  const variants = {
    primary: 'bg-[var(--primary)] text-white shadow-[0_4px_12px_var(--primary-glow)] hover:bg-[var(--primary-dark)] hover:-translate-y-px active:translate-y-0',
    accent:  'bg-[var(--accent)] text-white shadow-[0_4px_12px_var(--accent-glow)] hover:bg-[var(--accent-dark)] hover:-translate-y-px active:translate-y-0',
    outline: 'bg-transparent text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary-subtle)]',
    ghost:   'bg-transparent text-[var(--t2)] hover:bg-[rgba(255,255,255,0.05)]',
    danger:  'bg-transparent text-[var(--error)] border-[var(--error)] hover:bg-[var(--error-subtle)]',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Input
export function Input({ label, icon, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-bold uppercase tracking-widest text-[var(--t3)] mb-2">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--t4)] text-sm">{icon}</span>}
        <input
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-[var(--bg-surface)] border-[1.5px] border-[var(--border)] rounded-[var(--r-sm)] text-sm text-[var(--t1)] placeholder-[var(--t4)] outline-none transition-all focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-subtle)]`}
          {...props}
        />
      </div>
    </div>
  );
}

// Card
export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--r)] shadow-[var(--shadow-sm)] ${onClick ? 'cursor-pointer hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Avatar
export function Avatar({ initials, size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-16 h-16 text-2xl' };
  const colors = {
    primary: 'bg-[var(--primary-subtle)] text-[var(--primary)]',
    accent:  'bg-[var(--accent-subtle)] text-[var(--accent)]',
    info:    'bg-[rgba(74,144,155,0.15)] text-[#4A909B]',
  };
  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-full flex items-center justify-center font-display font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// Status badge mapping with Lucide icons
export function StatusBadge({ status }) {
  const config = {
    CONFIRMED: { variant: 'info', label: 'Confirmed', icon: CheckCircle2 },
    PENDING:   { variant: 'warning', label: 'Pending', icon: Clock },
    COMPLETED: { variant: 'success', label: 'Completed', icon: CheckCircle2 },
    CANCELLED: { variant: 'error', label: 'Cancelled', icon: XCircle },
    NO_SHOW:   { variant: 'muted', label: 'No Show', icon: MinusCircle },
    REJECTED:  { variant: 'error', label: 'Rejected', icon: AlertCircle },
  };
  const item = config[status] || { variant: 'muted', label: status, icon: Clock };
  return <Badge variant={item.variant} icon={item.icon}>{item.label}</Badge>;
}
