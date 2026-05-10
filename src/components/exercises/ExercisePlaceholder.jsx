import { Sparkles } from 'lucide-react'

export function ExercisePlaceholder({ accent, label = 'Coming soon' }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex flex-1 items-center justify-center rounded-[12px] border border-dashed border-white/10 bg-white/[0.015]">
        <div className="flex flex-col items-center gap-2 text-center">
          <Sparkles size={20} style={{ color: accent }} />
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">{label}</div>
          <div className="text-[12px] text-ink-sub">More drills land here next.</div>
        </div>
      </div>
    </div>
  )
}