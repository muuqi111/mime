export function ContentCard({ card, hovered, accent, onPointerEnter, onPointerLeave }) {
  return (
    <div
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="relative flex flex-col gap-2.5 rounded-[14px] border p-3.5 transition-all duration-200"
      style={
        hovered
          ? {
              background: 'rgba(255,255,255,0.05)',
              borderColor: `color-mix(in oklab, ${accent} 50%, transparent)`,
              boxShadow: `0 0 0 1px color-mix(in oklab, ${accent} 30%, transparent), 0 18px 40px -10px color-mix(in oklab, ${accent} 30%, transparent)`,
              transform: 'translateY(-1px)',
            }
          : {
              background: 'rgba(255,255,255,0.025)',
              borderColor: 'rgba(255,255,255,0.07)',
            }
      }
    >
      <div
        className="relative overflow-hidden rounded-lg border border-white/5"
        style={{ aspectRatio: '16 / 10' }}
      >
        <CardThumb kind={card.kind} accent={accent} />
        <span className="mono absolute bottom-2 left-2.5 text-[9px] uppercase tracking-[0.08em] text-white/35">
          {card.tag} · 01
        </span>
      </div>
      <div>
        <div className="text-[14px] font-medium">{card.title}</div>
        <div className="mono mt-1 text-[10.5px] tracking-wide text-ink-dim">{card.meta}</div>
      </div>
    </div>
  )
}

function CardThumb({ kind, accent }) {
  if (kind === 'photo') {
    return (
      <svg viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id="thumbSky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3a4a6e" />
            <stop offset="100%" stopColor="#1a2030" />
          </linearGradient>
        </defs>
        <rect width="200" height="125" fill="url(#thumbSky)" />
        <path d="M0 90 Q 50 70 100 85 T 200 80 V 125 H 0 Z" fill="#0e1724" />
        <path d="M0 100 Q 60 92 130 98 T 200 95 V 125 H 0 Z" fill="#070b13" />
        <circle cx="160" cy="32" r="14" fill="#f6c98c" opacity="0.7" />
      </svg>
    )
  }
  if (kind === 'song') {
    const bars = Array.from({ length: 28 })
    return (
      <svg viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="200" height="125" fill="#13182a" />
        {bars.map((_, index) => {
          const height = 8 + Math.abs(Math.sin(index * 0.7) * 36) + (index % 4 === 0 ? 14 : 0)
          return (
            <rect
              key={index}
              x={8 + index * 6.6}
              y={(125 - height) / 2}
              width="3"
              height={height}
              rx="1.5"
              fill={accent}
              opacity={0.7 - (index % 5) * 0.06}
            />
          )
        })}
      </svg>
    )
  }
  if (kind === 'article') {
    return (
      <svg viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="200" height="125" fill="#1a1f2c" />
        <rect x="20" y="22" width="120" height="6" rx="2" fill="rgba(255,255,255,0.5)" />
        <rect x="20" y="38" width="160" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
        <rect x="20" y="46" width="160" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
        <rect x="20" y="54" width="100" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
        <rect x="20" y="68" width="160" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
        <rect x="20" y="76" width="140" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
      </svg>
    )
  }
  if (kind === 'video') {
    return (
      <svg viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <radialGradient id="thumbVideo" cx="0.5" cy="0.5" r="0.8">
            <stop offset="0%" stopColor="#3a2a1a" />
            <stop offset="100%" stopColor="#0a0808" />
          </radialGradient>
        </defs>
        <rect width="200" height="125" fill="url(#thumbVideo)" />
        <circle cx="100" cy="62" r="20" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <path d="M94 54 L 112 62 L 94 70 Z" fill="rgba(255,255,255,0.85)" />
        <rect x="10" y="105" width="180" height="2" rx="1" fill="rgba(255,255,255,0.1)" />
        <rect x="10" y="105" width="64" height="2" rx="1" fill={accent} />
      </svg>
    )
  }
  if (kind === 'place') {
    return (
      <svg viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="200" height="125" fill="#1a2030" />
        <g stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none">
          <path d="M-10 30 L 210 50" />
          <path d="M-10 80 L 210 90" />
          <path d="M40 -10 L 60 130" />
          <path d="M120 -10 L 140 130" />
          <path d="M170 -10 L 180 130" />
        </g>
        <circle cx="100" cy="65" r="14" fill={accent} opacity="0.18" />
        <circle cx="100" cy="65" r="6" fill={accent} />
        <circle cx="100" cy="65" r="3" fill="#fff" />
      </svg>
    )
  }
  if (kind === 'doc') {
    return (
      <svg viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect width="200" height="125" fill="#0f1623" />
        <g transform="translate(40,18)">
          <rect width="100" height="90" rx="6" fill="#e8ecf3" />
          <rect x="10" y="14" width="60" height="4" rx="1" fill="#1a1f2c" />
          <rect x="10" y="26" width="80" height="2" rx="1" fill="#5b6373" />
          <rect x="10" y="32" width="80" height="2" rx="1" fill="#5b6373" />
          <rect x="10" y="38" width="50" height="2" rx="1" fill="#5b6373" />
          <rect x="10" y="50" width="80" height="2" rx="1" fill="#5b6373" />
          <rect x="10" y="56" width="70" height="2" rx="1" fill="#5b6373" />
          <rect x="10" y="68" width="34" height="6" rx="2" fill={accent} />
        </g>
      </svg>
    )
  }
  return null
}