export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ledger Logo"
    >
      <rect x="0" y="0" width="100" height="100" className="fill-paper" />
      {/* Heavy structural L shape */}
      <path 
        d="M20 20 V80 H80" 
        stroke="var(--color-ink)" 
        strokeWidth="12" 
        strokeLinecap="square"
      />
      {/* International Orange Accent - The 'Record' or 'Spark' */}
      <rect x="50" y="50" width="30" height="30" fill="var(--color-orange)" />
      {/* Stylized grid/archive lines */}
      <line x1="30" y1="40" x2="60" y2="40" stroke="var(--color-ink)" strokeWidth="4" />
      <line x1="30" y1="55" x2="45" y2="55" stroke="var(--color-ink)" strokeWidth="4" />
    </svg>
  );
}
