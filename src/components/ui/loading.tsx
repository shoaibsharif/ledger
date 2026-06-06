

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center min-h-[200px] ${className || ''}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-ink rounded-full animate-pulse" />
        <div className="w-3 h-3 bg-ink rounded-full animate-pulse delay-75" />
        <div className="w-3 h-3 bg-ink rounded-full animate-pulse delay-150" />
      </div>
    </div>
  )
}

export function LoadingIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className || ''}`}
    />
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-ink rounded-full animate-pulse" />
          <div className="w-4 h-4 bg-ink rounded-full animate-pulse delay-75" />
          <div className="w-4 h-4 bg-ink rounded-full animate-pulse delay-150" />
        </div>
        <p className="font-mono text-xs uppercase tracking-wider opacity-60">
          Loading...
        </p>
      </div>
    </div>
  )
}
