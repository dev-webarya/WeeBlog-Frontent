export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'bg-transparent border border-border-primary text-text-secondary hover:bg-bg-hover font-semibold py-3 px-6 rounded-lg transition-all',
        danger: 'bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 transition-all shadow-sm',
        success: 'bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-all shadow-sm',
    };

    return (
        <button
            className={`disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className = '', hover = false }) => {
    return (
        <div className={`card ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}>
            {children}
        </div>
    );
};

export const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
            <input className={`input-clean w-full ${error ? 'border-red-400 focus:ring-red-500' : ''} ${className}`} {...props} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export const TextArea = ({ label, error, className = '', rows = 4, ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
            <textarea className={`input-clean w-full ${error ? 'border-red-400 focus:ring-red-500' : ''} ${className}`} rows={rows} {...props} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export const Badge = ({ children, variant = 'info', className = '' }) => {
    const variants = {
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
    };
    return <span className={`badge ${variants[variant]} ${className}`}>{children}</span>;
};

const TAG_COLORS = [
    { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', text: '#6366f1' },  // indigo
    { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)', text: '#a855f7' },  // purple
    { bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.25)', text: '#ec4899' },  // pink
    { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#ef4444' },  // red
    { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#d97706' },  // amber
    { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', text: '#10b981' },  // emerald
    { bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)', text: '#14b8a6' },  // teal
    { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.25)', text: '#06b6d4' },  // cyan
    { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', text: '#3b82f6' },  // blue
    { bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.25)', text: '#f472b6' },  // rose
];

const hashTag = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % TAG_COLORS.length;
};

export const TagBadge = ({ tag }) => {
    const color = TAG_COLORS[hashTag(tag)];
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 10px',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                border: `1px solid ${color.border}`,
                backgroundColor: color.bg,
                color: color.text,
                transition: 'all 0.2s ease',
            }}
        >
            {tag}
        </span>
    );
};

export const Spinner = ({ size = 'md', label }) => {
    const sizeConfig = {
        sm: { ring: 24, dot: 4, orbit: 3, stroke: 2.5 },
        md: { ring: 40, dot: 6, orbit: 4, stroke: 3 },
        lg: { ring: 56, dot: 8, orbit: 5, stroke: 3.5 },
    };
    const cfg = sizeConfig[size] || sizeConfig.md;
    const viewBox = cfg.ring + cfg.orbit * 2 + 4;
    const center = viewBox / 2;
    const radius = cfg.ring / 2;

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
            <div className="relative" style={{ width: viewBox, height: viewBox }}>
                <svg width={viewBox} height={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`} className="spinner-svg">
                    {/* Track ring */}
                    <circle cx={center} cy={center} r={radius}
                        fill="none" stroke="var(--color-border-primary, #e5e7eb)" strokeWidth={cfg.stroke} opacity="0.4" />
                    {/* Gradient spinning arc */}
                    <defs>
                        <linearGradient id="spinner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="50%" stopColor="#764ba2" />
                            <stop offset="100%" stopColor="#f093fb" />
                        </linearGradient>
                    </defs>
                    <circle cx={center} cy={center} r={radius}
                        fill="none" stroke="url(#spinner-grad)" strokeWidth={cfg.stroke}
                        strokeLinecap="round"
                        strokeDasharray={`${radius * Math.PI * 0.75} ${radius * Math.PI * 1.25}`}
                        className="spinner-arc" />
                </svg>
                {/* Orbiting dots */}
                <div className="spinner-orbit" style={{ width: viewBox, height: viewBox, position: 'absolute', top: 0, left: 0 }}>
                    <div className="spinner-dot" style={{
                        width: cfg.dot, height: cfg.dot,
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: (center - radius - cfg.dot / 2),
                        left: center - cfg.dot / 2,
                        boxShadow: '0 0 8px rgba(102,126,234,0.6)',
                    }} />
                </div>
                {/* Pulsing center dot */}
                <div className="spinner-pulse" style={{
                    width: cfg.dot * 1.5, height: cfg.dot * 1.5,
                    background: 'linear-gradient(135deg, #764ba2, #f093fb)',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: center - cfg.dot * 0.75,
                    left: center - cfg.dot * 0.75,
                }} />
            </div>
            {label && <span className="text-sm text-text-tertiary animate-pulse font-medium tracking-wide">{label}</span>}
        </div>
    );
};

export const Pagination = ({ page, totalPages, onPageChange, pageSize, onPageSizeChange, pageSizeOptions = [5, 10, 20, 50] }) => {
    if (totalPages < 1 && page === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 px-1">
            {/* Rows per page selector */}
            {onPageSizeChange && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span>Rows per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(0);
                        }}
                        className="bg-bg-card border border-border-primary rounded-lg px-2 py-1.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-text-primary transition-all cursor-pointer"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Page navigation */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    className="px-3 py-2 rounded-lg border border-border-primary text-sm font-medium text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Prev
                </button>

                {/* Page numbers — show smart ellipsis for many pages */}
                <div className="hidden sm:flex gap-1.5">
                    {(() => {
                        const pages = [];
                        for (let i = 0; i < totalPages; i++) {
                            if (totalPages <= 7 || i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => onPageChange(i)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${i === page
                                            ? 'bg-text-primary text-bg-primary shadow-sm'
                                            : 'border border-border-primary text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            } else if (pages.length > 0 && pages[pages.length - 1]?.key !== 'ellipsis-' + (i < page ? 'start' : 'end')) {
                                pages.push(
                                    <span key={'ellipsis-' + (i < page ? 'start' : 'end')} className="flex items-center justify-center w-9 h-9 text-text-tertiary">…</span>
                                );
                            }
                        }
                        return pages;
                    })()}
                </div>

                {/* Mobile: simple text */}
                <span className="sm:hidden text-sm text-text-secondary font-medium px-2">
                    Page {page + 1} of {totalPages || 1}
                </span>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 rounded-lg border border-border-primary text-sm font-medium text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
};
