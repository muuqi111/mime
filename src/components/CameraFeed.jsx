import { CameraOff, Loader2, Pause } from 'lucide-react'

export function CameraFeed({ accent, pinching, canvasRef, status, mirror = true, paused = false }) {
  const live = status === 'active'

  return (
    <div
      className="relative w-full overflow-hidden rounded-[14px] border border-white/10 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_12px_30px_rgba(0,0,0,0.5)]"
      style={{
        aspectRatio: '16 / 10',
        background: 'linear-gradient(135deg, #0c1118 0%, #161c26 100%)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 90% at 35% 40%, rgba(120,140,170,0.18), transparent 65%),' +
            'radial-gradient(40% 50% at 70% 70%, rgba(220,200,180,0.12), transparent 65%),' +
            'linear-gradient(170deg, #1a2230 0%, #0a1018 100%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-1/3 w-px bg-white/[0.04]" />
        <div className="absolute inset-y-0 right-1/3 w-px bg-white/[0.04]" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-white/[0.04]" />
        <div className="absolute inset-x-0 bottom-1/3 h-px bg-white/[0.04]" />
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          transform: mirror ? 'scaleX(-1)' : 'scaleX(1)',
          objectFit: 'cover',
          opacity: live ? 1 : 0,
          transition: 'opacity .35s ease',
        }}
      />

      {!live && <FeedPlaceholder status={status} accent={accent} />}

      {live && paused && (
        <div className="absolute inset-0 z-[6] flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-[2px]">
          <Pause size={28} style={{ color: accent }} />
          <span className="mono text-[11px] uppercase tracking-[0.16em]" style={{ color: accent }}>
            Tracking paused
          </span>
        </div>
      )}

      <div className="mono absolute left-3 top-3 z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-white/85">
        <span
          className={`h-[7px] w-[7px] rounded-full ${
            live && !paused
              ? 'animate-live-blink bg-red-500 shadow-[0_0_8px_#ef4444]'
              : live && paused
              ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]'
              : 'bg-white/20'
          }`}
        />
        <span>
          {live && paused
            ? 'Paused'
            : live
            ? 'Live · Tracking'
            : status === 'requesting'
            ? 'Connecting…'
            : 'Standby'}
        </span>
      </div>
      <div className="mono absolute right-3 top-3 z-10 text-[10px] tracking-wide text-white/65">
        21 PT · 60 FPS
      </div>

      <CornerMark className="left-2 top-2" style={{ borderRight: 0, borderBottom: 0 }} accent={accent} />
      <CornerMark className="right-2 top-2" style={{ borderLeft: 0, borderBottom: 0 }} accent={accent} />
      <CornerMark className="bottom-2 left-2" style={{ borderRight: 0, borderTop: 0 }} accent={accent} />
      <CornerMark className="bottom-2 right-2" style={{ borderLeft: 0, borderTop: 0 }} accent={accent} />

      <div className="mono absolute inset-x-3 bottom-2.5 z-10 flex items-center justify-between text-[10px] tracking-wide text-white/55">
        <span>Right hand · 0.94</span>
        <span>⌃ {pinching ? 'PINCH' : 'POINT'}</span>
      </div>
    </div>
  )
}

function FeedPlaceholder({ status, accent }) {
  if (status === 'requesting') {
    return (
      <div className="absolute inset-0 z-[5] flex items-center justify-center text-ink-dim">
        <Loader2 size={22} className="animate-spin" style={{ color: accent }} />
      </div>
    )
  }
  if (status === 'denied' || status === 'error') {
    return (
      <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-1.5 text-center">
        <CameraOff size={20} className="text-ink-dim" />
        <span className="mono text-[10px] uppercase tracking-[0.1em] text-ink-dim">No camera</span>
      </div>
    )
  }
  return (
    <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-1.5 text-center">
      <CameraOff size={20} className="text-ink-dim" />
      <span className="mono text-[10px] uppercase tracking-[0.1em] text-ink-dim">Standby</span>
    </div>
  )
}

function CornerMark({ className, style, accent }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-[14px] w-[14px] ${className}`}
      style={{ borderColor: accent, borderWidth: 1.5, borderStyle: 'solid', ...style }}
    />
  )
}