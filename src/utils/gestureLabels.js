export function handLabel(detected, fallback = 'IDLE') {
  if (!detected) return fallback
  if (detected.left && detected.right) return 'BOTH'
  if (detected.right) return 'RIGHT'
  if (detected.left) return 'LEFT'
  return fallback
}

export function gestureLabel(activeGesture, fallback = 'IDLE') {
  switch (activeGesture) {
    case 'point':
      return 'POINT'
    case 'pinch':
      return 'PINCH · CLICK'
    case 'grab':
      return 'GRAB'
    case 'scroll-up':
      return 'SCROLL ↑'
    case 'scroll-down':
      return 'SCROLL ↓'
    default:
      return fallback
  }
}

export function gestureShort(activeGesture, fallback = '—') {
  switch (activeGesture) {
    case 'point':
      return 'POINT'
    case 'pinch':
      return 'PINCH'
    case 'grab':
      return 'GRAB'
    case 'scroll-up':
      return 'SCROLL ↑'
    case 'scroll-down':
      return 'SCROLL ↓'
    default:
      return fallback
  }
}