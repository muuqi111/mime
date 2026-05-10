import { RotateCcw } from 'lucide-react'

export function ExerciseStats({ items, accent, onReset }) {
  return (
    <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-white/5 pt-3.5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1.5">
        {items.map((item) => (
          <Stat key={item.label} {...item} accent={accent} />
        ))}
      </div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mono inline-flex flex-none items-center gap-1.5 rounded-[8px] border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-ink hover:bg-white/[0.08]"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}
    </div>
  )
}

function Stat({ label, value, accent: forceAccent, hint, accent }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="mono text-[10px] uppercase tracking-[0.12em] text-ink-dim">{label}</span>
      <span
        className="mono text-[12px] tabular-nums"
        style={{ color: forceAccent ? accent : undefined }}
      >
        {value}
      </span>
      {hint && <span className="mono text-[10px] text-ink-sub">{hint}</span>}
    </div>
  )
}