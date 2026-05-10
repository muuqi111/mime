import { useEffect, useRef, useState } from 'react'
import { useGesture } from '../../context/GestureContext.jsx'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { ExerciseStats } from './ExerciseStats.jsx'

const SHAPES = [
  { id: 'circle', label: 'Circle', color: '#22d3ee' },
  { id: 'square', label: 'Square', color: '#a855f7' },
  { id: 'triangle', label: 'Triangle', color: '#f59e0b' },
]

const SHAPE_SIZE = 60
const ZONE_SIZE = 92

function makeInitialPositions(width, height) {
  const usable = Math.max(width - 80, 200)
  const step = usable / (SHAPES.length + 1)
  const top = Math.max(40, Math.min(80, height * 0.18))
  return SHAPES.reduce((acc, shape, index) => {
    acc[shape.id] = { x: 40 + step * (index + 1), y: top }
    return acc
  }, {})
}

function makeZonePositions(width, height) {
  const usable = Math.max(width - 80, 200)
  const step = usable / (SHAPES.length + 1)
  const bottom = Math.max(height - 140, 200)
  return SHAPES.reduce((acc, shape, index) => {
    acc[shape.id] = { x: 40 + step * (index + 1), y: bottom }
    return acc
  }, {})
}

export function ExerciseDragDrop({ accent }) {
  const { pointerRef, grabbing, trackingActive } = useGesture()
  const containerRef = useRef(null)
  const shapeNodes = useRef({})
  const positions = useRef({})
  const zones = useRef({})
  const pickup = useRef(null)
  const draggingIdRef = useRef(null)
  const wasGrabbingRef = useRef(false)

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [draggingId, setDraggingId] = useState(null)
  const [placed, setPlaced] = useState(new Set())
  const [misses, setMisses] = useState(0)
  const [bestMisses, setBestMisses] = useLocalStorage('mime.ex.drag-drop.best-misses', null)

  const allPlaced = placed.size === SHAPES.length

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
    if (size.width === 0 || size.height === 0) return
    positions.current = makeInitialPositions(size.width, size.height)
    zones.current = makeZonePositions(size.width, size.height)
    applyPositions()
  }, [size])

  const applyPositions = () => {
    Object.entries(positions.current).forEach(([id, pos]) => {
      const node = shapeNodes.current[id]
      if (node) {
        node.style.transform = `translate3d(${pos.x - SHAPE_SIZE / 2}px, ${pos.y - SHAPE_SIZE / 2}px, 0)`
      }
    })
  }

  const reset = () => {
    if (size.width === 0) return
    positions.current = makeInitialPositions(size.width, size.height)
    applyPositions()
    setPlaced(new Set())
    setMisses(0)
    setDraggingId(null)
    draggingIdRef.current = null
    pickup.current = null
  }

  useEffect(() => {
    if (!allPlaced) return
    if (bestMisses == null || misses < bestMisses) setBestMisses(misses)
  }, [allPlaced, misses, bestMisses, setBestMisses])

  useEffect(() => {
    if (grabbing && !wasGrabbingRef.current) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const lx = pointerRef.current.x - rect.left
        const ly = pointerRef.current.y - rect.top
        const candidate = SHAPES.find((shape) => {
          if (placed.has(shape.id)) return false
          const pos = positions.current[shape.id]
          if (!pos) return false
          return Math.abs(pos.x - lx) <= SHAPE_SIZE / 2 && Math.abs(pos.y - ly) <= SHAPE_SIZE / 2
        })
        if (candidate) {
          draggingIdRef.current = candidate.id
          setDraggingId(candidate.id)
          const pos = positions.current[candidate.id]
          pickup.current = { dx: lx - pos.x, dy: ly - pos.y }
        }
      }
    }
    if (!grabbing && wasGrabbingRef.current && draggingIdRef.current) {
      const id = draggingIdRef.current
      const pos = positions.current[id]
      const zone = zones.current[id]
      const distance = Math.hypot(pos.x - zone.x, pos.y - zone.y)
      if (distance <= ZONE_SIZE / 2) {
        positions.current[id] = { x: zone.x, y: zone.y }
        applyPositions()
        setPlaced((prev) => {
          const next = new Set(prev)
          next.add(id)
          return next
        })
      } else {
        setMisses((prev) => prev + 1)
      }
      draggingIdRef.current = null
      setDraggingId(null)
      pickup.current = null
    }
    wasGrabbingRef.current = grabbing
  }, [grabbing, placed, pointerRef])

  useEffect(() => {
    if (!draggingId) return undefined
    let raf
    const tick = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect && pickup.current) {
        const lx = pointerRef.current.x - rect.left - pickup.current.dx
        const ly = pointerRef.current.y - rect.top - pickup.current.dy
        const clampedX = Math.max(SHAPE_SIZE / 2, Math.min(rect.width - SHAPE_SIZE / 2, lx))
        const clampedY = Math.max(SHAPE_SIZE / 2, Math.min(rect.height - SHAPE_SIZE / 2, ly))
        positions.current[draggingId] = { x: clampedX, y: clampedY }
        applyPositions()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [draggingId, pointerRef])

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-[12px] border border-white/[0.06] bg-white/[0.015]"
      >
        {SHAPES.map((shape) => {
          const zonePos = zones.current[shape.id]
          if (!zonePos) return null
          const isPlaced = placed.has(shape.id)
          return (
            <div
              key={`zone-${shape.id}`}
              className="absolute flex items-center justify-center rounded-[14px] border-[1.5px] border-dashed transition-colors"
              style={{
                left: zonePos.x - ZONE_SIZE / 2,
                top: zonePos.y - ZONE_SIZE / 2,
                width: ZONE_SIZE,
                height: ZONE_SIZE,
                borderColor: isPlaced
                  ? `color-mix(in oklab, ${shape.color} 70%, transparent)`
                  : `color-mix(in oklab, ${shape.color} 35%, transparent)`,
                background: isPlaced
                  ? `color-mix(in oklab, ${shape.color} 10%, transparent)`
                  : 'transparent',
              }}
            >
              <span
                className="mono text-[9px] uppercase tracking-[0.14em]"
                style={{ color: `color-mix(in oklab, ${shape.color} 80%, white)` }}
              >
                {shape.label}
              </span>
            </div>
          )
        })}

        {SHAPES.map((shape) => {
          const isDragging = shape.id === draggingId
          const isPlaced = placed.has(shape.id)
          return (
            <div
              key={shape.id}
              ref={(node) => {
                shapeNodes.current[shape.id] = node
              }}
              className="absolute flex items-center justify-center transition-shadow"
              style={{
                width: SHAPE_SIZE,
                height: SHAPE_SIZE,
                cursor: 'none',
                opacity: isPlaced ? 0.6 : 1,
                filter: isDragging ? `drop-shadow(0 8px 18px ${shape.color}80)` : undefined,
                zIndex: isDragging ? 10 : 1,
              }}
            >
              <ShapeIcon kind={shape.id} color={shape.color} />
            </div>
          )
        })}

        {!trackingActive && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3">
            <div className="mono rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-dim">
              Mouse fallback · hold to grab, release to drop
            </div>
          </div>
        )}

        {allPlaced && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="mono rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.16em] backdrop-blur-sm"
              style={{
                color: accent,
                borderColor: `color-mix(in oklab, ${accent} 40%, transparent)`,
                background: `color-mix(in oklab, ${accent} 14%, transparent)`,
              }}
            >
              All placed · {misses} miss{misses === 1 ? '' : 'es'}
            </div>
          </div>
        )}
      </div>

      <ExerciseStats
        accent={accent}
        onReset={reset}
        items={[
          { label: 'Placed', value: `${placed.size} / ${SHAPES.length}` },
          { label: 'Misses', value: misses, accent: misses > 0 },
          { label: 'Best (misses)', value: bestMisses ?? '—' },
        ]}
      />
    </div>
  )
}

function ShapeIcon({ kind, color }) {
  if (kind === 'circle') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="22" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" />
        <circle cx="30" cy="30" r="6" fill={color} />
      </svg>
    )
  }
  if (kind === 'square') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 60 60">
        <rect x="10" y="10" width="40" height="40" rx="6" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" />
        <rect x="24" y="24" width="12" height="12" rx="2" fill={color} />
      </svg>
    )
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 60">
      <polygon points="30,8 54,52 6,52" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="30,28 38,46 22,46" fill={color} />
    </svg>
  )
}