import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  CameraOff,
  FlipHorizontal2,
  Hand,
  Keyboard,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SlidersHorizontal,
} from 'lucide-react'
import { accentPalette } from '../constants/sampleCards.js'

export function Toolbox({
  accent,
  onAccentChange,
  cameraOn,
  onToggleCamera,
  mirror,
  onToggleMirror,
  onRecalibrate,
  settings,
  onUpdateSettings,
  trackingActive,
  onToggleTracking,
  paused,
  onTogglePause,
  pinching,
  onTogglePinch,
  onOpenKeyboard,
}) {
  return (
    <div className="glass mx-auto flex flex-none max-w-full flex-nowrap items-center gap-1.5 p-2">
      <ToolButton
        accent={accent}
        active={cameraOn}
        title={cameraOn ? 'Hide camera' : 'Show camera'}
        onClick={onToggleCamera}
      >
        {cameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
        {cameraOn && <ActiveDot accent={accent} />}
      </ToolButton>
      <ToolButton
        accent={accent}
        active={!mirror}
        title={mirror ? 'Mirror on (selfie view)' : 'Mirror off (natural view)'}
        onClick={onToggleMirror}
      >
        <FlipHorizontal2 size={20} />
      </ToolButton>
      <ToolButton
        accent={accent}
        title="Recalibrate cursor"
        hint="R"
        onClick={onRecalibrate}
      >
        <RotateCcw size={20} />
      </ToolButton>
      <SensitivityButton accent={accent} settings={settings} onUpdateSettings={onUpdateSettings} />
      <Divider />
      <ToolButton
        accent={accent}
        active={trackingActive}
        title={trackingActive ? 'Deactivate hand navigation' : 'Activate hand navigation'}
        onClick={onToggleTracking}
      >
        <Hand size={20} />
        {trackingActive && <ActiveDot accent={accent} />}
      </ToolButton>
      <ToolButton
        accent={accent}
        active={paused}
        disabled={!trackingActive}
        title={paused ? 'Resume tracking' : 'Pause tracking'}
        onClick={onTogglePause}
      >
        {paused ? <Play size={18} /> : <Pause size={18} />}
      </ToolButton>
      <ToolButton
        accent={accent}
        active={pinching}
        title="Simulate pinch"
        onClick={onTogglePinch}
      >
        <span
          className="block h-2 w-2 rounded-full"
          style={{
            background: pinching ? accent : 'currentColor',
            boxShadow: pinching ? `0 0 8px ${accent}` : 'none',
          }}
        />
      </ToolButton>
      <Divider />
      <ToolButton accent={accent} title="Keyboard shortcuts" hint="⌘K" onClick={onOpenKeyboard}>
        <Keyboard size={20} />
      </ToolButton>
      <SettingsButton accent={accent} onAccentChange={onAccentChange} />
    </div>
  )
}

function SensitivityButton({ accent, settings, onUpdateSettings }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useOutsideClose(wrapperRef, open, () => setOpen(false))

  return (
    <div ref={wrapperRef} className="relative">
      <ToolButton accent={accent} active={open} title="Sensitivity" onClick={() => setOpen((v) => !v)}>
        <SlidersHorizontal size={20} />
      </ToolButton>
      {open && (
        <Popover>
          <PopoverHeader title="Sensitivity" />
          <SliderRow
            label="Cursor smoothing"
            value={settings.smoothingAlpha}
            min={0.1}
            max={0.6}
            step={0.05}
            display={`${(settings.smoothingAlpha * 100).toFixed(0)}%`}
            accent={accent}
            onChange={(value) => onUpdateSettings({ smoothingAlpha: value })}
            hint="Lower = smoother / floatier · Higher = snappier"
          />
          <SliderRow
            label="Pinch close"
            value={settings.pinchClose}
            min={0.7}
            max={0.95}
            step={0.01}
            display={settings.pinchClose.toFixed(2)}
            accent={accent}
            onChange={(value) =>
              onUpdateSettings({
                pinchClose: value,
                pinchOpen: Math.min(settings.pinchOpen, value - 0.1),
              })
            }
            hint="How close fingers must be to register a click"
          />
          <SliderRow
            label="Pinch open"
            value={settings.pinchOpen}
            min={0.4}
            max={0.85}
            step={0.01}
            display={settings.pinchOpen.toFixed(2)}
            accent={accent}
            onChange={(value) =>
              onUpdateSettings({
                pinchOpen: value,
                pinchClose: Math.max(settings.pinchClose, value + 0.1),
              })
            }
            hint="How far fingers must move to release"
          />
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({ smoothingAlpha: 0.3, pinchClose: 0.85, pinchOpen: 0.6 })
            }
            className="mono mt-1 w-full rounded-md border border-white/10 px-2 py-1.5 text-[10.5px] uppercase tracking-[0.1em] text-ink-dim hover:bg-white/5"
          >
            Reset to defaults
          </button>
        </Popover>
      )}
    </div>
  )
}

function SettingsButton({ accent, onAccentChange }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useOutsideClose(wrapperRef, open, () => setOpen(false))

  return (
    <div ref={wrapperRef} className="relative">
      <ToolButton accent={accent} active={open} title="Settings" onClick={() => setOpen((v) => !v)}>
        <Settings size={20} />
      </ToolButton>
      {open && (
        <Popover>
          <PopoverHeader title="Settings" />
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] text-ink">Accent color</span>
            <span className="mono text-[10px] text-ink-sub">{accent.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {accentPalette.map((color) => {
              const active = color === accent
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => onAccentChange(color)}
                  aria-label={`Accent ${color}`}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: color,
                    boxShadow: active
                      ? `0 0 0 2px #0e1218, 0 0 0 3.5px ${color}`
                      : `0 0 8px ${color}55`,
                  }}
                />
              )
            })}
          </div>
        </Popover>
      )}
    </div>
  )
}

function Popover({ children }) {
  return (
    <div
      className="absolute bottom-[calc(100%+10px)] right-0 z-30 w-[260px] rounded-[14px] border border-white/10 p-3.5"
      style={{
        background: 'rgba(14, 18, 24, 0.92)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  )
}

function PopoverHeader({ title }) {
  return <div className="eyebrow mb-3">{title}</div>
}

function SliderRow({ label, value, min, max, step, display, accent, onChange, hint }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] text-ink">{label}</span>
        <span className="mono text-[10px] text-ink-sub">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-current"
        style={{ accentColor: accent }}
      />
      {hint && <div className="mono mt-1 text-[10px] leading-snug text-ink-sub">{hint}</div>}
    </div>
  )
}

function useOutsideClose(ref, open, close) {
  useEffect(() => {
    if (!open) return undefined
    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) close()
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, ref, close])
}

function ActiveDot({ accent }) {
  return (
    <span
      className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
      style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
    />
  )
}

function ToolButton({ accent, active, disabled, title, hint, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="relative flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/[0.06] bg-white/[0.03] text-ink transition-all enabled:hover:border-white/[0.12] enabled:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
      style={
        active
          ? {
              color: accent,
              background: `color-mix(in oklab, ${accent} 14%, transparent)`,
              borderColor: `color-mix(in oklab, ${accent} 40%, transparent)`,
              boxShadow: `0 0 18px -4px color-mix(in oklab, ${accent} 50%, transparent)`,
            }
          : undefined
      }
    >
      {children}
      {hint && (
        <span className="mono absolute bottom-1 right-1.5 text-[8.5px] text-ink-sub">{hint}</span>
      )}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-[26px] w-px flex-none bg-white/10" />
}