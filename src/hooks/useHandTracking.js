import { useCallback, useEffect, useRef, useState } from 'react'

const SETTINGS_KEY = 'mime.tracking.settings'
const DEFAULT_SETTINGS = {
  smoothingAlpha: 0.3,
  cursorLerp: 0.35,
  pinchClose: 0.85,
  pinchOpen: 0.6,
}
const PINCH_RANGE_MIN = 0.03
const PINCH_RANGE_SPAN = 0.09
const CLICK_DEBOUNCE_MS = 300

class ExpSmoother {
  constructor(alpha) {
    this.alpha = alpha
    this.values = {}
  }

  push(channel, value) {
    if (!(channel in this.values)) {
      this.values[channel] = value
      return value
    }
    this.values[channel] += this.alpha * (value - this.values[channel])
    return this.values[channel]
  }

  reset() {
    this.values = {}
  }
}

function loadSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null')
    if (stored && typeof stored === 'object') return { ...DEFAULT_SETTINGS, ...stored }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS }
}

export function useHandTracking() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const pointerRef = useRef({ x: 0, y: 0, visible: false })
  const targetRef = useRef({ x: 0, y: 0, visible: false })
  const trackingActive = useRef(false)
  const pausedRef = useRef(false)
  const handsRef = useRef(null)
  const cameraRef = useRef(null)
  const settingsRef = useRef(loadSettings())
  const stateRef = useRef({
    smoother: new ExpSmoother(settingsRef.current.smoothingAlpha),
    isPinching: false,
    lastClickAt: 0,
  })

  const [pinching, setPinching] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [paused, setPaused] = useState(false)
  const [settings, setSettingsState] = useState(settingsRef.current)

  useEffect(() => {
    const handleMove = (event) => {
      if (trackingActive.current) return
      targetRef.current.x = event.clientX
      targetRef.current.y = event.clientY
      targetRef.current.visible = true
    }

    const handleEnter = () => {
      if (trackingActive.current) return
      targetRef.current.visible = true
    }

    const handleLeave = () => {
      if (trackingActive.current) return
      targetRef.current.visible = false
    }

    const handleDown = (event) => {
      if (trackingActive.current) return
      if (event.button === 0) setPinching(true)
    }

    const handleUp = (event) => {
      if (trackingActive.current) return
      if (event.button === 0) setPinching(false)
    }

    let frameId
    const tick = () => {
      const lerp = settingsRef.current.cursorLerp
      pointerRef.current.x += (targetRef.current.x - pointerRef.current.x) * lerp
      pointerRef.current.y += (targetRef.current.y - pointerRef.current.y) * lerp
      pointerRef.current.visible = targetRef.current.visible
      frameId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseenter', handleEnter)
    document.addEventListener('mouseleave', handleLeave)
    window.addEventListener('pointerdown', handleDown)
    window.addEventListener('pointerup', handleUp)
    frameId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseenter', handleEnter)
      document.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('pointerdown', handleDown)
      window.removeEventListener('pointerup', handleUp)
      cancelAnimationFrame(frameId)
    }
  }, [])

  const startTracking = useCallback(async () => {
    if (status === 'requesting' || status === 'active') return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) {
      setError('Video element not mounted')
      setStatus('error')
      return
    }

    setStatus('requesting')
    setError(null)

    try {
      const handsModule = await import('@mediapipe/hands')
      const cameraModule = await import('@mediapipe/camera_utils')
      const drawingModule = await import('@mediapipe/drawing_utils')

      const HandsCtor = handsModule.Hands
      const CameraCtor = cameraModule.Camera
      const drawConnectors = drawingModule.drawConnectors
      const HAND_CONNECTIONS = handsModule.HAND_CONNECTIONS

      const hands = new HandsCtor({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      })
      handsRef.current = hands

      hands.onResults((results) => {
        const liveCanvas = canvasRef.current
        if (!liveCanvas) return
        const ctx = liveCanvas.getContext('2d')
        const cw = liveCanvas.width
        const ch = liveCanvas.height
        ctx.clearRect(0, 0, cw, ch)
        ctx.drawImage(results.image, 0, 0, cw, ch)

        if (pausedRef.current) return

        let rightHandMirrored = null

        if (results.multiHandLandmarks && results.multiHandedness) {
          for (let i = 0; i < results.multiHandLandmarks.length; i += 1) {
            const raw = results.multiHandLandmarks[i]
            const label = results.multiHandedness[i].label
            const mirrored = raw.map((point) => ({ ...point, x: 1 - point.x }))

            drawConnectors(ctx, raw, HAND_CONNECTIONS, {
              color: 'rgba(255,255,255,0.35)',
              lineWidth: 1.5,
            })
            raw.forEach((point) => {
              ctx.beginPath()
              ctx.arc(point.x * cw, point.y * ch, 2.2, 0, Math.PI * 2)
              ctx.fillStyle = 'rgba(255,255,255,0.45)'
              ctx.fill()
            })
            ;[4, 8, 12, 16, 20].forEach((idx) => {
              const point = raw[idx]
              ctx.beginPath()
              ctx.arc(point.x * cw, point.y * ch, 4.5, 0, Math.PI * 2)
              ctx.fillStyle = 'rgba(255,255,255,0.9)'
              ctx.strokeStyle = '#fff'
              ctx.lineWidth = 1
              ctx.fill()
              ctx.stroke()
            })

            if (label === 'Left') rightHandMirrored = mirrored
          }
        }

        const state = stateRef.current
        const cfg = settingsRef.current

        if (rightHandMirrored) {
          const indexTip = rightHandMirrored[8]
          const thumbTip = rightHandMirrored[4]
          const rawX = indexTip.x * window.innerWidth
          const rawY = indexTip.y * window.innerHeight
          const cx = state.smoother.push('cx', rawX)
          const cy = state.smoother.push('cy', rawY)

          targetRef.current.x = cx
          targetRef.current.y = cy
          targetRef.current.visible = true

          const pinchDistance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y)
          const smoothPinch = state.smoother.push('pinch', pinchDistance)
          const pinchStrength = 1 - Math.max(0, Math.min(1, (smoothPinch - PINCH_RANGE_MIN) / PINCH_RANGE_SPAN))

          const now = Date.now()
          if (pinchStrength > cfg.pinchClose && !state.isPinching) {
            if (now - state.lastClickAt >= CLICK_DEBOUNCE_MS) {
              state.isPinching = true
              state.lastClickAt = now
              setPinching(true)
              const target = document.elementFromPoint(cx, cy)
              if (target && target.isConnected) {
                try {
                  target.click()
                } catch {
                  // intentionally swallowed
                }
              }
            }
          } else if (pinchStrength < cfg.pinchOpen && state.isPinching) {
            state.isPinching = false
            setPinching(false)
          }
        } else {
          targetRef.current.visible = false
          if (state.isPinching) {
            state.isPinching = false
            setPinching(false)
          }
          state.smoother.reset()
        }
      })

      const camera = new CameraCtor(video, {
        onFrame: async () => {
          const liveCanvas = canvasRef.current
          if (liveCanvas) {
            if (liveCanvas.width !== video.videoWidth) liveCanvas.width = video.videoWidth
            if (liveCanvas.height !== video.videoHeight) liveCanvas.height = video.videoHeight
          }
          await hands.send({ image: video })
        },
        width: 640,
        height: 480,
      })
      cameraRef.current = camera
      await camera.start()
      trackingActive.current = true
      pausedRef.current = false
      setPaused(false)
      setStatus('active')
    } catch (err) {
      const message = err?.message || String(err)
      setError(message)
      setStatus(/permission|denied|notallowed/i.test(message) ? 'denied' : 'error')
    }
  }, [status])

  const stopTracking = useCallback(() => {
    cameraRef.current?.stop()
    handsRef.current?.close()
    cameraRef.current = null
    handsRef.current = null
    trackingActive.current = false
    pausedRef.current = false
    setPaused(false)
    setStatus('idle')
  }, [])

  const togglePause = useCallback(() => {
    if (!trackingActive.current) return
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
    if (pausedRef.current) {
      stateRef.current.smoother.reset()
      if (stateRef.current.isPinching) {
        stateRef.current.isPinching = false
        setPinching(false)
      }
    }
  }, [])

  const recalibrate = useCallback(() => {
    stateRef.current.smoother.reset()
    stateRef.current.isPinching = false
    setPinching(false)
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    targetRef.current.x = cx
    targetRef.current.y = cy
    pointerRef.current.x = cx
    pointerRef.current.y = cy
  }, [])

  const updateSettings = useCallback((partial) => {
    const next = { ...settingsRef.current, ...partial }
    settingsRef.current = next
    stateRef.current.smoother.alpha = next.smoothingAlpha
    setSettingsState(next)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    return () => {
      cameraRef.current?.stop()
      handsRef.current?.close()
    }
  }, [])

  return {
    videoRef,
    canvasRef,
    pointerRef,
    pinching,
    status,
    error,
    paused,
    settings,
    startTracking,
    stopTracking,
    togglePause,
    recalibrate,
    updateSettings,
  }
}