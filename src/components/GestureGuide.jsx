import { Sparkles } from 'lucide-react'
import { gestures } from '../constants/gestures.js'

export function GestureGuide({ accent, activeId }) {
  return (
    <div className="glass flex min-h-0 flex-col gap-3 px-3.5 py-4">
      <div className="flex items-center justify-between px-1.5">
        <div className="eyebrow">Gestures</div>
        <div className="mono text-[10px] text-ink-sub">{gestures.length} / {gestures.length}</div>
      </div>
      <div className="h-px bg-white/5" />
      <div className="scrollbar-none flex min-h-0 flex-1 flex-col gap-1 overflow-auto">
        {gestures.map(({ id, name, description, shortcut, Glyph }) => {
          const active = id === activeId
          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-white/5"
              style={
                active
                  ? {
                      background: `color-mix(in oklab, ${accent} 12%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 35%, transparent)`,
                    }
                  : undefined
              }
            >
              <div
                className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] border"
                style={
                  active
                    ? {
                        background: `color-mix(in oklab, ${accent} 18%, transparent)`,
                        borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`,
                        color: accent,
                      }
                    : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }
                }
              >
                <Glyph size={26} />
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="text-[13px] font-medium tracking-tight">{name}</div>
                <div className="mono mt-0.5 text-[10px] text-ink-dim tracking-wide">{description}</div>
              </div>
              <div className="mono ml-auto rounded border border-white/10 bg-white/[0.02] px-1.5 py-0.5 text-[10px] text-ink-sub">
                {shortcut}
              </div>
            </div>
          )
        })}
      </div>
      <div className="h-px bg-white/5" />
      <div className="flex items-center gap-2.5 px-2 pt-1 text-[11.5px] text-ink-dim">
        <Sparkles size={14} style={{ color: accent }} />
        Try them on the canvas →
      </div>
    </div>
  )
}