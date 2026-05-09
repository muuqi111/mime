export function HandInfo({ accent, pinching }) {
  return (
    <div className="glass flex flex-col gap-2.5 px-4 py-3.5">
      <Row label="Hand">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <span className="mono text-[11px] tracking-[0.06em]">RIGHT</span>
        </span>
      </Row>
      <Row label="Gesture">
        <span className="mono text-[11px] tracking-[0.06em]" style={{ color: accent }}>
          {pinching ? 'PINCH · CLICK' : 'POINT'}
        </span>
      </Row>
      <Row label="Conf · FPS">
        <span className="mono text-[11px] tracking-[0.06em]">0.94 · 60</span>
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