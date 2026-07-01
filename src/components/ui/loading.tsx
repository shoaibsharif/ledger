import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import clsx from "clsx"


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
    <HugeiconsIcon icon={Loading03Icon} className={clsx("animate-spin", className)} />
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
