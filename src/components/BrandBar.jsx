import { useEffect, useState } from 'react'
import { TrackedILogo } from './TrackedILogo.jsx'

const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })

function useNow() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let intervalId
    const timeoutId = setTimeout(() => {
      setNow(new Date())
      intervalId = setInterval(() => setNow(new Date()), 60_000)
    }, 60_000 - (Date.now() % 60_000))
    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  return now
}

export function BrandBar({ accent }) {
  const now = useNow()

  return (
    <div className="flex min-w-0 items-center justify-between px-1.5">
      <div className="flex min-w-0 items-center gap-3.5">
        <TrackedILogo accent={accent} size={22} />
        <div className="h-[18px] w-px bg-white/10" />
        <div className="eyebrow">{dayFormatter.format(now)} · {timeFormatter.format(now)}</div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.08em]"
          style={{
            color: accent,
            borderColor: `color-mix(in oklab, ${accent} 35%, transparent)`,
            background: `color-mix(in oklab, ${accent} 12%, transparent)`,
          }}
        >
          <span
            className="h-1.5 w-1.5 animate-live-blink rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          Tracking active
        </div>
      </div>
    </div>
  )
}