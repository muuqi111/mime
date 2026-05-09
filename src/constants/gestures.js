import {
  GesturePointGlyph,
  GestureTwoFingerGlyph,
  GesturePinchGlyph,
  GestureFistGlyph,
} from '../components/GestureGlyphs.jsx'

export const gestures = [
  {
    id: 'point',
    name: 'One finger',
    description: 'right · move cursor',
    shortcut: '·',
    Glyph: GesturePointGlyph,
  },
  {
    id: 'pinch',
    name: 'Pinch',
    description: 'right · click · select',
    shortcut: '⌃',
    Glyph: GesturePinchGlyph,
  },
  {
    id: 'grab',
    name: 'Fist',
    description: 'right · grab · drag',
    shortcut: '✊',
    Glyph: GestureFistGlyph,
  },
  {
    id: 'scroll-up',
    name: 'Left · 1 finger',
    description: 'scroll up',
    shortcut: '↑',
    Glyph: GesturePointGlyph,
  },
  {
    id: 'scroll-down',
    name: 'Left · 2 fingers',
    description: 'scroll down',
    shortcut: '↓',
    Glyph: GestureTwoFingerGlyph,
  },
]