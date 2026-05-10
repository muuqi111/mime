import { useEffect, useMemo, useRef, useState } from 'react'
import { useGesture } from '../../context/GestureContext.jsx'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { ExerciseStats } from './ExerciseStats.jsx'

const TARGET_COUNT = 8
const TARGET_RADIUS_RANGE = [22, 36]
const PADDING = 24

function seededRandom(seed) {
  return function next() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

function generateTargets(width, height, seed) {
  if (width <= 0 || height <= 0) return []
  const rand = seededRandom(seed)
  const targets = []
  let attempts = 0
  while (targets.length < TARGET_COUNT && attempts < 400) {
    attempts += 1
    const radius = TARGET_RADIUS_RANGE[0] + rand() * (TARGET_RADIUS_RANGE[1] - TARGET_RADIUS_RANGE[0])
    const x = PADDING + radius + rand() * Math.max(1, width - 2 * (PADDING + radius))
    const y = PADDING + radius + rand() * Math.max(1, height - 2 * (PADDING + radius))
    const collides = targets.some((other) => Math.hypot(other.x - x, other.y - y) < other.radius + radius + 6)
    if (collides) continue
    targets.push({ id: targets.length, x, y, radius })
  }
  return targets
}

function formatMs(ms) {
  if (ms == null) return '—'
  const seconds = ms / 1000
  if (seconds < 10) return seconds.toFixed(2) + 's'
  return seconds.toFixed(1) + 's'
}

export function ExerciseClickTargets({ accent }) {
  const { pointerRef, pinching } = useGesture()
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000) + 1)
  const [hits, setHits] = useState(new Set())
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(0)
  const [bestMs, setBestMs] = useLocalStorage('mime.ex.click-targets.best', null)
  const wasPinchingRef = useRef(false)

  const targets = useMemo(() => generateTargets(size.width, size.height, seed), [size, seed])
  const remaining = targets.filter((t) => !hits.has(t.id))
  const cleared = remaining.length === 0 && targets.length > 0

  useEffect(() => {
    const node = containerRef.current
    if (!node) return undefined
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!startedAt || cleared) return undefined
    let raf
    const tick = () => {
      setNow(performance.now())
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [startedAt, cleared])

  useEffect(() => {
    if (!cleared || !startedAt) return undefined
    const finalMs = performance.now() - startedAt
    if (bestMs == null || finalMs < bestMs) setBestMs(finalMs)
    const timer = setTimeout(() => {
      setHits(new Set())
      setStartedAt(null)
      setNow(0)
      setSeed(Math.floor(Math.random() * 100000) + 1)
    }, 1400)
    return () => clearTimeout(timer)
  }, [cleared, startedAt, bestMs, setBestMs])

  useEffect(() => {
    if (pinching && !wasPinchingRef.current) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const lx = pointerRef.current.x - rect.left
        const ly = pointerRef.current.y - rect.top
        const hit = remaining.find((t) => Math.hypot(t.x - lx, t.y - ly) <= t.radius)
        if (hit) {
          setHits((prev) => {
            const next = new Set(prev)
            next.add(hit.id)
            return next
          })
          if (!startedAt) setStartedAt(performance.now())
        }
      }
    }
    wasPinchingRef.current = pinching
  }, [pinching, pointerRef, remaining, startedAt])

  const reset = () => {
    setHits(new Set())
    setStartedAt(null)
    setNow(0)
    setSeed(Math.floor(Math.random() * 100000) + 1)
  }

  const elapsed = startedAt ? (cleared ? performance.now() - startedAt : now - startedAt) : 0

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-[12px] border border-white/[0.06] bg-white/[0.015]"
      >
        {targets.map((target) => {
          const cleared = hits.has(target.id)
          return (
            <div
              key={target.id}
              className="absolute rounded-full transition-transform duration-200"
              style={{
                left: target.x - target.radius,
                top: target.y - target.radius,
                width: target.radius * 2,
                height: target.radius * 2,
                background: cleared
                  ? 'transparent'
                  : `radial-gradient(circle, color-mix(in oklab, ${accent} 38%, transparent) 0%, color-mix(in oklab, ${accent} 6%, transparent) 70%)`,
                border: cleared
                  ? `1.5px solid color-mix(in oklab, ${accent} 18%, transparent)`
                  : `1.5px solid ${accent}`,
                boxShadow: cleared ? 'none' : `0 0 18px -4px ${accent}`,
                opacity: cleared ? 0.25 : 1,
                transform: cleared ? 'scale(0.6)' : 'scale(1)',
              }}
            />
          )
        })}

        {!startedAt && !cleared && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="mono rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-ink-dim backdrop-blur-sm">
              Pinch a target to start
            </div>
          </div>
        )}

        {cleared && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="mono rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.16em] backdrop-blur-sm"
              style={{
                color: accent,
                borderColor: `color-mix(in oklab, ${accent} 40%, transparent)`,
                background: `color-mix(in oklab, ${accent} 14%, transparent)`,
              }}
            >
              Cleared in {formatMs(elapsed)} · resetting…
            </div>
          </div>
        )}
      </div>

      <ExerciseStats
        accent={accent}
        onReset={reset}
        items={[
          { label: 'Targets', value: `${hits.size} / ${targets.length}` },
          { label: 'Time', value: formatMs(elapsed), accent: !!startedAt },
          { label: 'Best', value: formatMs(bestMs) },
        ]}
      />
    </div>
  )
}