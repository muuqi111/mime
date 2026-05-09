import { useEffect, useRef } from 'react'

export function AuraCursor({ pointerRef, pinching, accent }) {
  const elementRef = useRef(null)

  useEffect(() => {
    let frameId
    const tick = () => {
      const node = elementRef.current
      const pointer = pointerRef.current
      if (node) {
        node.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`
        node.style.opacity = pointer.visible ? '1' : '0'
      }
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [pointerRef])

  return (
    <div
      ref={elementRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[300] h-[60px] w-[60px] transition-opacity duration-150"
      style={{ '--accent': accent }}
    >
      <div
        className="absolute inset-2 animate-spin-slow rounded-full border border-dashed"
        style={{ borderColor: `color-mix(in oklab, ${accent} 60%, transparent)` }}
      />
      <div
        className="absolute inset-4 rounded-full border-[1.5px]"
        style={{
          borderColor: accent,
          boxShadow: `0 0 12px color-mix(in oklab, ${accent} 80%, transparent), inset 0 0 8px color-mix(in oklab, ${accent} 30%, transparent)`,
        }}
      />
      <div
        className="absolute inset-[22px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, color-mix(in oklab, ${accent} 60%, transparent) 35%, transparent 70%)`,
          filter: 'blur(0.5px)',
        }}
      />
      {pinching && (
        <div
          className="absolute inset-0 animate-aura-pulse rounded-full border-[1.5px] opacity-0"
          style={{ borderColor: accent }}
        />
      )}
    </div>
  )
}