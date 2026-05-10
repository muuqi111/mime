import { useEffect } from 'react'
import { X } from 'lucide-react'

const sections = [
  {
    title: 'Navigation',
    items: [
      { keys: ['H'], label: 'Toggle hand navigation' },
      { keys: ['Space'], label: 'Pause / resume tracking' },
      { keys: ['R'], label: 'Recalibrate cursor' },
    ],
  },
  {
    title: 'Camera',
    items: [
      { keys: ['C'], label: 'Show / hide camera panel' },
      { keys: ['M'], label: 'Mirror camera (selfie ↔ natural)' },
    ],
  },
  {
    title: 'Test surface',
    items: [
      { keys: ['←', '→'], label: 'Switch tab (All / Cards / Text / Shapes)' },
      { keys: ['↑', '↓'], label: 'Switch drill within the tab' },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { keys: ['1', '…', '6'], label: 'Switch accent color' },
    ],
  },
  {
    title: 'App',
    items: [
      { keys: ['⌘', 'K'], label: 'Open this menu' },
      { keys: ['Esc'], label: 'Close any popover or overlay' },
    ],
  },
]

export function KeyboardShortcuts({ accent, open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 px-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px] rounded-[16px] border border-white/10 bg-canvas-elevated/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="eyebrow" style={{ color: accent }}>
              Shortcuts
            </div>
            <h2 className="mt-1 text-[20px] font-semibold tracking-tight">Keyboard reference</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ink-dim transition-colors hover:bg-white/10 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="eyebrow mb-2 text-ink-sub">{section.title}</div>
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-ink">{item.label}</span>
                    <span className="flex flex-none items-center gap-1">
                      {item.keys.map((key, index) => (
                        <KeyCap key={`${key}-${index}`}>{key}</KeyCap>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mono mt-6 text-[10.5px] uppercase tracking-[0.14em] text-ink-sub">
          Press <KeyCap inline>Esc</KeyCap> or click outside to close.
        </div>
      </div>
    </div>
  )
}

function KeyCap({ children, inline }) {
  return (
    <kbd
      className={`mono inline-flex min-w-[22px] items-center justify-center rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[11px] tracking-wide text-ink ${
        inline ? 'mx-1' : ''
      }`}
    >
      {children}
    </kbd>
  )
}