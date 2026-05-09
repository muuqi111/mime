import { useCallback, useEffect, useState } from 'react'
import { CameraOff } from 'lucide-react'
import { useHandTracking } from './hooks/useHandTracking.js'
import { accentPalette } from './constants/sampleCards.js'
import { AuraCursor } from './components/AuraCursor.jsx'
import { BrandBar } from './components/BrandBar.jsx'
import { GestureGuide } from './components/GestureGuide.jsx'
import { TestCanvas } from './components/TestCanvas.jsx'
import { CameraFeed } from './components/CameraFeed.jsx'
import { HandInfo } from './components/HandInfo.jsx'
import { Toolbox } from './components/Toolbox.jsx'
import { LoadingScreen } from './components/LoadingScreen.jsx'
import { KeyboardShortcuts } from './components/KeyboardShortcuts.jsx'

const wideStyle = {
  display: 'grid',
  gap: 'clamp(12px, 1.4vw, 22px)',
  padding: 'clamp(16px, 1.8vw, 26px) clamp(16px, 1.8vw, 26px) 8px',
  gridTemplateColumns: 'clamp(220px, 19vw, 280px) minmax(0, 1fr) clamp(260px, 22vw, 340px)',
  gridTemplateRows: 'auto minmax(0, 1fr) auto',
  gridTemplateAreas: '"bar bar bar" "gest canvas right" "tools tools tools"',
}

const compactStyle = {
  display: 'grid',
  gap: 'clamp(12px, 1.4vw, 22px)',
  padding: 'clamp(16px, 1.8vw, 26px) clamp(16px, 1.8vw, 26px) 8px',
  gridTemplateColumns: 'clamp(200px, 24vw, 260px) minmax(0, 1fr)',
  gridTemplateRows: 'auto minmax(0, 1fr) auto auto',
  gridTemplateAreas: '"bar bar" "gest canvas" "gest right" "tools tools"',
}

function pickLayout() {
  if (typeof window === 'undefined') return 'wide'
  return window.innerWidth < 1100 ? 'compact' : 'wide'
}

function useResponsiveLayout() {
  const [layout, setLayout] = useState(pickLayout)

  useEffect(() => {
    const update = () => setLayout(pickLayout())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return layout
}

export default function App() {
  const [accent, setAccent] = useState(accentPalette[0])
  const [cameraOn, setCameraOn] = useState(true)
  const [mirror, setMirror] = useState(true)
  const [pinchSimulated, setPinchSimulated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const layout = useResponsiveLayout()

  const {
    videoRef,
    canvasRef,
    pointerRef,
    pinching: pointerPinching,
    grabbing,
    activeGesture,
    handsDetected,
    status: trackingStatus,
    error: trackingError,
    paused,
    settings,
    startTracking,
    stopTracking,
    togglePause,
    recalibrate,
    updateSettings,
  } = useHandTracking()

  const isPinching = pinchSimulated || pointerPinching
  const trackingActive = trackingStatus === 'active'
  const guideActiveId = activeGesture ?? (pinchSimulated ? 'pinch' : 'point')

  const handleToggleTracking = useCallback(() => {
    if (trackingActive) stopTracking()
    else startTracking()
  }, [trackingActive, startTracking, stopTracking])

  const handleToggleCamera = useCallback(() => setCameraOn((value) => !value), [])
  const handleToggleMirror = useCallback(() => setMirror((value) => !value), [])
  const handleAccentByIndex = useCallback((index) => {
    if (accentPalette[index]) setAccent(accentPalette[index])
  }, [])

  useEffect(() => {
    if (loading) return undefined
    const handleKey = (event) => {
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setKeyboardOpen((value) => !value)
        return
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const key = event.key.toLowerCase()
      if (key === 'r') {
        event.preventDefault()
        recalibrate()
      } else if (key === 'h') {
        event.preventDefault()
        handleToggleTracking()
      } else if (key === 'c') {
        event.preventDefault()
        handleToggleCamera()
      } else if (key === 'm') {
        event.preventDefault()
        handleToggleMirror()
      } else if (event.key === ' ') {
        event.preventDefault()
        togglePause()
      } else if (/^[1-6]$/.test(event.key)) {
        event.preventDefault()
        handleAccentByIndex(Number(event.key) - 1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [
    loading,
    recalibrate,
    handleToggleTracking,
    handleToggleCamera,
    handleToggleMirror,
    togglePause,
    handleAccentByIndex,
  ])

  return (
    <>
      {loading && (
        <LoadingScreen
          accent={accent}
          onDone={() => setLoading(false)}
          onRequestCamera={startTracking}
          trackingStatus={trackingStatus}
          trackingError={trackingError}
        />
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute h-px w-px opacity-0"
        style={{ pointerEvents: 'none', left: -9999, top: -9999 }}
      />

      <div
        className="relative h-screen w-screen overflow-hidden text-ink"
        style={{
          ...(layout === 'wide' ? wideStyle : compactStyle),
          '--accent': accent,
          background: `radial-gradient(1200px 700px at 80% -10%, color-mix(in oklab, ${accent} 11%, transparent), transparent 60%), radial-gradient(900px 600px at -10% 110%, color-mix(in oklab, ${accent} 8%, transparent), transparent 60%), #0a0d12`,
        }}
      >
        <BackgroundGrid />

        <div style={{ gridArea: 'bar' }}>
          <BrandBar accent={accent} trackingStatus={trackingStatus} paused={paused} />
        </div>

        <div style={{ gridArea: 'gest' }} className="min-h-0">
          <GestureGuide accent={accent} activeId={guideActiveId} />
        </div>

        <div style={{ gridArea: 'canvas' }} className="min-h-0 min-w-0">
          <TestCanvas accent={accent} />
        </div>

        <div
          style={{ gridArea: 'right' }}
          className={`flex min-h-0 min-w-0 gap-3.5 ${layout === 'compact' ? 'flex-row' : 'flex-col'}`}
        >
          {cameraOn ? (
            <>
              <div className={layout === 'compact' ? 'max-w-[360px] flex-1' : ''}>
                <CameraFeed
                  accent={accent}
                  canvasRef={canvasRef}
                  status={trackingStatus}
                  mirror={mirror}
                  paused={paused}
                  activeGesture={activeGesture}
                  handsDetected={handsDetected}
                />
              </div>
              <div className={layout === 'compact' ? 'flex-1' : ''}>
                <HandInfo
                  accent={accent}
                  activeGesture={activeGesture}
                  handsDetected={handsDetected}
                  live={trackingActive && !paused}
                />
              </div>
            </>
          ) : (
            <div
              className="glass flex w-full items-center justify-center gap-2 text-ink-dim"
              style={{ aspectRatio: '16 / 10' }}
            >
              <CameraOff size={18} />
              <span className="mono text-[11px] uppercase tracking-[0.08em]">Camera off</span>
            </div>
          )}
        </div>

        <div style={{ gridArea: 'tools' }} className="flex justify-center">
          <Toolbox
            accent={accent}
            onAccentChange={setAccent}
            cameraOn={cameraOn}
            onToggleCamera={handleToggleCamera}
            mirror={mirror}
            onToggleMirror={handleToggleMirror}
            onRecalibrate={recalibrate}
            settings={settings}
            onUpdateSettings={updateSettings}
            trackingActive={trackingActive}
            onToggleTracking={handleToggleTracking}
            paused={paused}
            onTogglePause={togglePause}
            pinching={pinchSimulated}
            onTogglePinch={() => setPinchSimulated((value) => !value)}
            onOpenKeyboard={() => setKeyboardOpen(true)}
          />
        </div>
      </div>

      <KeyboardShortcuts accent={accent} open={keyboardOpen} onClose={() => setKeyboardOpen(false)} />

      <AuraCursor pointerRef={pointerRef} pinching={isPinching} accent={accent} />
    </>
  )
}

function BackgroundGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 100%)',
      }}
    />
  )
}