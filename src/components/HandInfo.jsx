import { gestureLabel, handLabel } from '../utils/gestureLabels.js'

export function HandInfo({ accent, activeGesture = null, handsDetected = null, live = false }) {
  const hand = handLabel(handsDetected, '—')
  const gesture = gestureLabel(activeGesture, live ? 'IDLE' : '—')
  const detected = handsDetected && (handsDetected.left || handsDetected.right)

  return (
    <div className="glass flex flex-col gap-2.5 px-4 py-3.5">
      <Row label="Hand">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: detected ? accent : 'rgba(255,255,255,0.2)',
              boxShadow: detected ? `0 0 8px ${accent}` : undefined,
            }}
          />
          <span className="mono text-[11px] tracking-[0.06em]">{hand}</span>
        </span>
      </Row>
      <Row label="Gesture">
        <span
          className="mono text-[11px] tracking-[0.06em]"
          style={{ color: activeGesture ? accent : undefined }}
        >
          {gesture}
        </span>
      </Row>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span className="eyebrow">{label}</span>
      {children}
    </div>
  )
}