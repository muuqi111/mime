const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function GesturePointGlyph({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps}>
      <path d="M16 5v14" />
      <path d="M11 19c0-2 .5-3.5 0-5l-1-2c-.5-1 .5-2 1.5-1.5L13 12" />
      <path d="M11 19c-1.5 0-3 1-3 3v3c0 1 1 2 2 2h10c2 0 3-1 3-3v-7c0-1-.8-2-2-2h-1c-1 0-2-1-2-2" />
      <circle cx="16" cy="4" r="1.2" fill="currentColor" />
    </svg>
  )
}

export function GestureTwoFingerGlyph({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps}>
      <path d="M13 5v14" />
      <path d="M17 5v14" />
      <path d="M9 19c-1 0-2 1-2 2.5V25c0 1 .5 2 2 2h11c2 0 3-1.5 3-3.5V14c0-1-.5-2-1.8-2" />
      <path d="M9 19V12c0-1 .5-2 1.5-2" />
    </svg>
  )
}

export function GesturePinchGlyph({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps}>
      <circle cx="11" cy="9" r="3" />
      <path d="M14 11.5 18 15" />
      <path d="M22 8c-1.5 0-3 1-3 3v8c0 3-2 5-5 5h-3c-2 0-3.5-1-4.5-2.5L4 18" />
      <path d="M19 11h2.5c1 0 1.5.5 1.5 1.5" />
      <path d="m9 14 3 4" />
    </svg>
  )
}

export function GestureTwoHandGlyph({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps}>
      <path d="M5 9c0-1 1-2 2-2s2 1 2 2v6" />
      <path d="M9 11c0-1 1-2 2-2s2 1 2 2v3" />
      <path d="M13 13v9c0 1.5-1 3-3 3H8c-1.5 0-2.5-.5-3.5-1.5L3 22" />
      <path d="M27 9c0-1-1-2-2-2s-2 1-2 2v6" />
      <path d="M23 11c0-1-1-2-2-2s-2 1-2 2v3" />
      <path d="M19 13v9c0 1.5 1 3 3 3h2c1.5 0 2.5-.5 3.5-1.5L29 22" />
    </svg>
  )
}

export function GestureFistGlyph({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps}>
      <rect x="7" y="11" width="18" height="13" rx="4" />
      <path d="M10 11v-2M14 11v-3M18 11v-3M22 11v-2" />
      <path d="M7 17h18" />
    </svg>
  )
}

export function GesturePalmGlyph({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...baseProps}>
      <path d="M9 13V7a1.5 1.5 0 0 1 3 0v6" />
      <path d="M12 13V5a1.5 1.5 0 0 1 3 0v8" />
      <path d="M15 13V6a1.5 1.5 0 0 1 3 0v7" />
      <path d="M18 13V8a1.5 1.5 0 0 1 3 0v9c0 4-2 7-6 7h-2c-2 0-3.5-1-4.5-2.5L7 18l-1-3a1.5 1.5 0 0 1 2.5-1.5L9 14" />
    </svg>
  )
}