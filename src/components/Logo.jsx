// CareerAI brand mark — inline SVG so it renders crisp at any size,
// adapts to any theme, and needs no network requests.

export default function Logo({ size = 40, withWordmark = false, subtitle, className = '' }) {
  return (
    <div className={'flex items-center gap-3 ' + className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CareerAI logo"
      >
        <defs>
          <linearGradient id="ciq-g" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="ciq-bolt" x1="18" y1="10" x2="34" y2="40">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e9d5ff" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="13" fill="url(#ciq-g)" />
        {/* rising bar chart */}
        <rect x="12" y="27" width="4.5" height="9" rx="2.25" fill="white" opacity="0.45" />
        <rect x="19" y="22" width="4.5" height="14" rx="2.25" fill="white" opacity="0.65" />
        <rect x="26" y="17" width="4.5" height="19" rx="2.25" fill="white" opacity="0.85" />
        {/* spark / bolt */}
        <path
          d="M36.5 8.5l-6.2 8.1c-.5.7-.05 1.6.8 1.6h3.1l-2.6 6.9c-.3.9.8 1.5 1.4.8l6.2-8.1c.5-.7.05-1.6-.8-1.6H35l2.9-6.9c.35-.85-.75-1.55-1.4-.8z"
          fill="url(#ciq-bolt)"
        />
      </svg>
      {withWordmark && (
        <div className="leading-tight">
          <p className="text-heading font-bold text-lg tracking-tight">
            Career<span className="text-accent-light">AI</span>
          </p>
          {subtitle && (
            <p className="text-[10px] tracking-widest text-gray-500 uppercase">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
