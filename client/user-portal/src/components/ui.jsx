import { Star, ArrowRight, CheckCircle2, Clock, XCircle, MinusCircle, AlertCircle } from 'lucide-react';

// Modern Badge component
export function Badge({ children, variant = 'muted', icon: Icon, className = '' }) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error:   'bg-red-50 text-red-700 border-red-200',
    info:    'bg-sky-50 text-sky-700 border-sky-200',
    primary: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    muted:   'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-transparent text-slate-600 border-slate-200',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight border transition-colors ${variants[variant] || variants.muted} ${className}`}
    >
      {Icon && <Icon size={12} className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

// Stars component using Lucide icons
export function Stars({ rating = 0, size = 14 }) {
  const full = Math.floor(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < full ? 'fill-current text-amber-500' : 'text-slate-200'}
        />
      ))}
    </span>
  );
}

// RatingDisplay
export function RatingDisplay({ rating, count, size = 'sm' }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
        <Star size={11} className="fill-current text-emerald-600" />
        <span>{rating}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-500 font-medium">({count})</span>
      )}
    </div>
  );
}

// Section header
export function SectionHeader({ title, subtitle, linkLabel, onLink }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {linkLabel && (
        <button
          onClick={onLink}
          className="text-xs sm:text-sm font-semibold text-emerald-700 flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer shrink-0 pb-0.5"
        >
          {linkLabel} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

// Modern Button with tactile feel and responsive touch sizing
export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizes = {
    xs: 'px-2.5 py-1 text-xs rounded-md min-h-[30px]',
    sm: 'px-3 py-1.5 text-xs sm:text-sm rounded-lg min-h-[36px]',
    md: 'px-4 py-2.5 text-sm rounded-xl min-h-[42px]',
    lg: 'px-5 py-3 text-base rounded-xl min-h-[48px]',
  };

  const variants = {
    primary:
      'bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 active:bg-emerald-900 border border-transparent shadow-emerald-900/10',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/80',
    accent:
      'bg-amber-600 text-white shadow-sm hover:bg-amber-700 active:bg-amber-800 border border-transparent',
    outline:
      'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 border border-transparent',
    danger:
      'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 border border-transparent',
    subtlePrimary:
      'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200/80',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Modern Input
export function Input({ label, icon, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          className={`w-full ${icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/15 disabled:bg-slate-50 disabled:text-slate-400 ${
            error ? 'border-red-500 focus:border-red-600 focus:ring-red-500/15' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

// Modern Card
export function Card({ children, className = '', onClick, elevated = false, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-2xl ${
        elevated ? 'shadow-md' : 'shadow-xs'
      } ${
        onClick
          ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all duration-200'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Avatar
export function Avatar({ initials, src, alt, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover border border-slate-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full flex items-center justify-center font-bold shrink-0 select-none ${className}`}
    >
      {initials}
    </div>
  );
}

// Status badge mapping with Lucide icons
export function StatusBadge({ status, className = '' }) {
  const config = {
    CONFIRMED: { variant: 'info', label: 'Confirmed', icon: CheckCircle2 },
    PENDING:   { variant: 'warning', label: 'Pending', icon: Clock },
    COMPLETED: { variant: 'success', label: 'Completed', icon: CheckCircle2 },
    CANCELLED: { variant: 'error', label: 'Cancelled', icon: XCircle },
    NO_SHOW:   { variant: 'muted', label: 'No Show', icon: MinusCircle },
    REJECTED:  { variant: 'error', label: 'Rejected', icon: AlertCircle },
    SEATED:    { variant: 'success', label: 'Seated', icon: CheckCircle2 },
  };
  const item = config[status] || { variant: 'muted', label: status, icon: Clock };
  return <Badge variant={item.variant} icon={item.icon} className={className}>{item.label}</Badge>;
}

// Skeleton loader
export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />
  );
}
