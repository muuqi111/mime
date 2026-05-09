import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { TrackedILogo } from './TrackedILogo.jsx'

const stageMeta = {
  idle: { eyebrow: 'Initializing · 01 of 02', headline: 'Allow your camera' },
  requesting: { eyebrow: 'Requesting access · 01 of 02', headline: 'Asking the browser…' },
  granted: { eyebrow: 'Granted · listening for input', headline: 'Looking for your hand' },
  wave: { eyebrow: 'Detecting · 02 of 02', headline: 'Wave hello to begin' },
  reveal: { eyebrow: 'Ready', headline: 'Welcome.' },
  denied: { eyebrow: 'Permission denied', headline: 'Camera was blocked' },
  error: { eyebrow: 'Error', headline: 'Couldn’t start the camera' },
}

function subline(stage, waveProgress, errorMessage) {
  if (stage === 'idle')
    return 'Mime never records or sends video, tracking runs entirely on your device.'
  if (stage === 'requesting') return 'Confirm the prompt at the top of your browser window.'
  if (stage === 'granted') return 'Frame yourself in the camera and raise an open hand.'
  if (stage === 'wave') {
    if (waveProgress < 0.45) return 'Move your hand slowly side to side, keep it inside the rings.'
    if (waveProgress < 0.85) return 'Got it. Mapping landmarks…'
    return 'Locked on. Calibrating motion model…'
  }
  if (stage === 'reveal') return 'Tracking is live. Drop into the playground.'
  if (stage === 'denied')
    return 'Allow camera access in your browser settings, or continue with the mouse.'
  if (stage === 'error') return errorMessage || 'Something went wrong starting the camera.'
  return ''
}

export function LoadingScreen({
  accent,
  onDone,
  onRequestCamera,
  trackingStatus,
  trackingError,
}) {
  const [stage, setStage] = useState('idle')
  const [waveProgress, setWaveProgress] = useState(0)

  useEffect(() => {
    if (trackingStatus === 'active' && (stage === 'requesting' || stage === 'idle')) {
      setStage('granted')
    } else if (trackingStatus === 'denied') {
      setStage('denied')
    } else if (trackingStatus === 'error') {
      setStage('error')
    }
  }, [trackingStatus, stage])

  useEffect(() => {
    if (stage === 'granted') {
      const timer = setTimeout(() => setStage('wave'), 700)
      return () => clearTimeout(timer)
    }
    if (stage === 'wave') {
      const start = performance.now()
      const duration = 2200
      let raf
      const tick = () => {
        const progress = Math.min(1, (performance.now() - start) / duration)
        setWaveProgress(progress)
        if (progress < 1) raf = requestAnimationFrame(tick)
        else setStage('reveal')
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }
    if (stage === 'reveal') {
      const timer = setTimeout(() => onDone?.(), 1100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [stage, onDone])

  const handleAllow = () => {
    setStage('requesting')
    onRequestCamera?.()
  }

  const handleSkip = () => onDone?.()

  const handleRetry = () => {
    setStage('idle')
  }

  const cameraStatus = stage === 'idle' ? 'pending' : stage === 'requesting' ? 'active' : 'done'
  const detectStatus =
    stage === 'wave' ? 'active' : stage === 'reveal' ? 'done' : 'pending'
  const readyStatus = stage === 'reveal' ? 'active' : 'pending'

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden text-ink"
      style={{
        '--accent': accent,
        background: `radial-gradient(900px 600px at 50% 50%, color-mix(in oklab, ${accent} 8%, transparent), transparent 60%), #06080c`,
      }}
    >
      <BackgroundGrid />
      <Vignette />

      <RingStack stage={stage} accent={accent} waveProgress={waveProgress} />
      <MeshField stage={stage} accent={accent} waveProgress={waveProgress} />

      <div className="absolute left-1/2 top-[80px] flex -translate-x-1/2 items-center gap-2.5">
        <Step index={1} label="Camera" status={cameraStatus} accent={accent} />
        <span className="h-px w-8 bg-white/10" />
        <Step index={2} label="Detect" status={detectStatus} accent={accent} />
        <span className="h-px w-8 bg-white/10" />
        <Step index={3} label="Ready" status={readyStatus} accent={accent} />
      </div>

      <div
        className={`absolute left-1/2 top-[12%] -translate-x-1/2 transition-all duration-500 ${
          stage === 'reveal' ? 'translate-y-0 opacity-100' : '-translate-y-1.5 opacity-0'
        }`}
      >
        <TrackedILogo accent={accent} size={32} />
      </div>

      <div className="absolute bottom-[22%] left-1/2 flex max-w-[80vw] -translate-x-1/2 flex-col items-center gap-2.5 text-center">
        <div
          className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]"
          style={{ color: `color-mix(in oklab, ${accent} 80%, white)` }}
        >
          <span
            className="h-1.5 w-1.5 animate-live-blink rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <span>{stageMeta[stage].eyebrow}</span>
        </div>
        <div
          key={stage}
          className="animate-fade-up text-4xl font-semibold leading-tight tracking-tight md:text-5xl"
        >
          {stageMeta[stage].headline}
        </div>
        <div className="max-w-[480px] text-[13.5px] leading-relaxed text-ink-dim">
          {subline(stage, waveProgress, trackingError)}
        </div>

        {stage === 'idle' && (
          <button
            type="button"
            onClick={handleAllow}
            className="mt-2 inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13.5px] font-semibold transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 95%, white), ${accent})`,
              color: '#06121a',
              boxShadow: `0 0 24px -4px ${accent}, 0 1px 0 rgba(255,255,255,0.5) inset, 0 6px 16px rgba(0,0,0,0.35)`,
            }}
          >
            <span className="h-2 w-2 rounded-full bg-[#06121a]" />
            Allow camera access
          </button>
        )}

        {(stage === 'denied' || stage === 'error') && (
          <div className="mt-3 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-[10px] px-4 py-2 text-[13px] font-semibold"
              style={{
                background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 95%, white), ${accent})`,
                color: '#06121a',
                boxShadow: `0 0 18px -4px ${accent}, 0 1px 0 rgba(255,255,255,0.5) inset`,
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-[10px] border border-white/15 bg-white/[0.04] px-4 py-2 text-[13px] text-ink hover:bg-white/[0.08]"
            >
              Continue with mouse
            </button>
          </div>
        )}
      </div>

      <div className="mono absolute bottom-5 left-6 flex gap-2.5 text-[10px] tracking-[0.06em] text-white/40">
        <span>Mime · 2026</span>
        <span>·</span>
        <span>Designed by muuqi</span>
        <span>·</span>
        <span>
          {stage === 'wave'
            ? `DETECT ${(waveProgress * 100).toFixed(0)}%`
            : stage === 'reveal'
            ? 'HANDOFF'
            : stage === 'denied' || stage === 'error'
            ? 'BLOCKED'
            : 'STBY'}
        </span>
      </div>
    </div>
  )
}

function BackgroundGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 100%)',
      }}
    />
  )
}

function Vignette() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(0,0,0,0.5), transparent 60%), radial-gradient(ellipse 100% 100% at 50% 0%, rgba(0,0,0,0.5), transparent 60%)',
      }}
    />
  )
}

function RingStack({ stage, accent, waveProgress }) {
  const scanActive = stage === 'wave' || stage === 'reveal' || stage === 'granted'
  const arcVisible = stage === 'wave' || stage === 'reveal'
  const dashOffset = 226.2 * (1 - waveProgress)

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px]"
      style={{ transform: 'translate(-50%, -56%)' }}
    >
      <div
        className="absolute inset-0 m-auto animate-spin-slow rounded-full border border-dashed opacity-70"
        style={{ borderColor: `color-mix(in oklab, ${accent} 50%, transparent)` }}
      />
      <div
        className="absolute inset-0 m-auto h-[220px] w-[220px] rounded-full border-[1.5px]"
        style={{
          borderColor: accent,
          boxShadow: `0 0 24px color-mix(in oklab, ${accent} 40%, transparent), inset 0 0 12px color-mix(in oklab, ${accent} 12%, transparent)`,
          animation: stage === 'requesting' ? 'corePulse 0.8s ease-in-out infinite' : undefined,
        }}
      />
      <div
        className="absolute inset-0 m-auto h-[84px] w-[84px] animate-core-pulse rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, color-mix(in oklab, ${accent} 60%, transparent) 30%, transparent 70%)`,
          filter: 'blur(0.5px)',
        }}
      />

      <div
        className={`absolute left-1/2 top-1/2 h-[1.5px] w-[220px] -translate-x-1/2 transition-opacity duration-500 ${
          scanActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(to right, transparent 0%, color-mix(in oklab, ${accent} 20%, transparent) 30%, ${accent} 50%, color-mix(in oklab, ${accent} 20%, transparent) 70%, transparent 100%)`,
          boxShadow: `0 0 14px ${accent}`,
          animation: scanActive ? 'scanLine 2.6s ease-in-out infinite' : undefined,
        }}
      />

      <PulseRing accent={accent} delay="0s" />
      <PulseRing accent={accent} delay="1.2s" />
      <PulseRing accent={accent} delay="2.4s" />

      <svg
        viewBox="0 0 100 100"
        width="280"
        height="280"
        className="absolute inset-0 m-auto"
      >
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke={accent}
          strokeWidth="1.4"
          strokeDasharray="226.2"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{
            filter: `drop-shadow(0 0 6px ${accent})`,
            opacity: arcVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />
      </svg>

      <Crosshair accent={accent} />
    </div>
  )
}

function PulseRing({ accent, delay }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 h-[220px] w-[220px] animate-ring-pulse rounded-full border-[1.5px] opacity-0"
      style={{ borderColor: accent, animationDelay: delay }}
    />
  )
}

function Crosshair({ accent }) {
  return (
    <div className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2">
      <span
        className="absolute -left-[9px] -top-[0.5px] h-px w-[18px]"
        style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
      />
      <span
        className="absolute -left-[0.5px] -top-[9px] h-[18px] w-px"
        style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
      />
    </div>
  )
}

function Step({ index, label, status, accent }) {
  const palette =
    status === 'active'
      ? {
          text: accent,
          border: accent,
          bg: `color-mix(in oklab, ${accent} 15%, transparent)`,
          dot: accent,
        }
      : status === 'done'
      ? {
          text: '#e8edf3',
          border: `color-mix(in oklab, ${accent} 50%, transparent)`,
          bg: `color-mix(in oklab, ${accent} 30%, transparent)`,
          dot: '#e8edf3',
        }
      : { text: '#5b6373', border: 'rgba(255,255,255,0.12)', bg: 'rgba(255,255,255,0.02)', dot: '#5b6373' }

  return (
    <div
      className="mono flex items-center gap-2 text-[10.5px] uppercase tracking-[0.08em] transition-colors duration-300"
      style={{ color: palette.text }}
    >
      <div
        className="flex h-[22px] w-[22px] items-center justify-center rounded-full border transition-all"
        style={{
          borderColor: palette.border,
          background: palette.bg,
          color: palette.dot,
          boxShadow:
            status === 'active'
              ? `0 0 12px color-mix(in oklab, ${accent} 50%, transparent)`
              : undefined,
        }}
      >
        {status === 'done' ? (
          <Check size={11} strokeWidth={2.5} />
        ) : (
          <span className="text-[9px]">{String(index).padStart(2, '0')}</span>
        )}
      </div>
      <span>{label}</span>
    </div>
  )
}

function MeshField({ stage, accent, waveProgress }) {
  const points = useMemo(() => {
    const arr = []
    const seed = (n) => {
      const value = Math.sin(n * 9301 + 49297) * 233280
      return value - Math.floor(value)
    }
    for (let i = 0; i < 80; i += 1) {
      arr.push({
        x: seed(i * 2 + 1),
        y: seed(i * 2 + 2),
        radius: seed(i * 2 + 3) * 1.5 + 0.4,
        flicker: seed(i * 2 + 5) * 0.6 + 0.4,
      })
    }
    return arr
  }, [])

  const showLinks = stage === 'wave' || stage === 'reveal'

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 56"
      preserveAspectRatio="none"
    >
      {showLinks &&
        points.flatMap((point, index) =>
          points.slice(index + 1).map((other, otherIndex) => {
            const dx = (point.x - other.x) * 100
            const dy = (point.y - other.y) * 56
            const distance = Math.hypot(dx, dy)
            if (distance > 12) return null
            const opacity = (1 - distance / 12) * waveProgress * 0.5
            return (
              <line
                key={`${index}-${otherIndex}`}
                x1={point.x * 100}
                y1={point.y * 56}
                x2={other.x * 100}
                y2={other.y * 56}
                stroke={accent}
                strokeWidth="0.08"
                opacity={opacity}
              />
            )
          }),
        )}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x * 100}
          cy={point.y * 56}
          r={point.radius * 0.18}
          fill={accent}
          opacity={0.12 + (showLinks ? 0.4 * waveProgress * point.flicker : 0.05)}
        >
          <animate
            attributeName="opacity"
            values={`${0.05};${0.18 * point.flicker};${0.05}`}
            dur={`${3 + point.flicker * 2.5}s`}
            repeatCount="indefinite"
            begin={`${index * 0.03}s`}
          />
        </circle>
      ))}
    </svg>
  )
}