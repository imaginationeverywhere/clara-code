import { cn } from '@/lib/utils'

interface UsageBarProps {
  label: string
  used: number
  cap: number
  className?: string
}

export function UsageBar({ label, used, cap, className }: UsageBarProps) {
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm text-white/60">
        <span>{label}</span>
        <span>
          {used} / {cap}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-clara-blue transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
