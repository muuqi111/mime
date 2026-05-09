import {
  GesturePointGlyph,
  GestureTwoFingerGlyph,
  GesturePinchGlyph,
  GestureTwoHandGlyph,
  GestureFistGlyph,
  GesturePalmGlyph,
} from '../components/GestureGlyphs.jsx'

export const gestures = [
  {
    id: 'point',
    name: 'One finger',
    description: 'point · move cursor',
    shortcut: '·',
    Glyph: GesturePointGlyph,
  },
  {
    id: 'hover',
    name: 'Two fingers',
    description: 'hover · inspect',
    shortcut: '·',
    Glyph: GestureTwoFingerGlyph,
  },
  {
    id: 'pinch',
    name: 'Pinch',
    description: 'click · select',
    shortcut: '⌃',
    Glyph: GesturePinchGlyph,
  },
  {
    id: 'scroll',
    name: 'Two hands',
    description: 'scroll · pan',
    shortcut: '↕',
    Glyph: GestureTwoHandGlyph,
  },
  {
    id: 'grab',
    name: 'Fist',
    description: 'grab · drag',
    shortcut: '✊',
    Glyph: GestureFistGlyph,
  },
  {
    id: 'pause',
    name: 'Open palm',
    description: 'pause tracking',
    shortcut: '✋',
    Glyph: GesturePalmGlyph,
  },
]