export function TrackedILogo({ accent, size = 28, className = '', style }) {
  const dotSize = size * 0.32
  const iWidth = size * 0.32
  const iHeight = size * 0.78
  const stemWidth = Math.max(1.6, size * 0.11)
  const stemHeight = size * 0.55
  const stemRadius = size * 0.06
  const meOffset = -size * 0.04

  const letterStyle = {
    fontSize: size,
    fontWeight: 500,
    letterSpacing: '-0.05em',
    lineHeight: 1,
    fontFamily: 'inherit',
  }

  const ringTransform = { transformOrigin: 'center', transformBox: 'fill-box' }

  return (
    <span className={`inline-flex items-end ${className}`} style={style}>
      <span style={letterStyle}>m</span>
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          width: iWidth,
          height: iHeight,
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: stemWidth,
            height: stemHeight,
            background: 'currentColor',
            borderRadius: stemRadius,
          }}
        />
        <svg
          width={dotSize}
          height={dotSize}
          viewBox="0 0 32 32"
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: 'translate(-50%, -10%)',
            overflow: 'visible',
          }}
        >
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke={accent}
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.55"
            className="animate-logo-spin"
            style={ringTransform}
          />
          <circle cx="16" cy="16" r="9" fill="none" stroke={accent} strokeWidth="1.4" opacity="0.9" />
          <circle cx="16" cy="16" r="4" fill={accent} />
          <circle
            cx="16"
            cy="16"
            r="6.5"
            fill="none"
            stroke={accent}
            strokeWidth="1"
            opacity="0.5"
            className="animate-logo-pulse"
            style={ringTransform}
          />
        </svg>
      </span>
      <span style={{ ...letterStyle, marginLeft: meOffset }}>me</span>
    </span>
  )
}