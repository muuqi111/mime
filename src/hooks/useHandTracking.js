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
const SCROLL_BASE = 30
const SCROLL_RAMP = 50
const SCROLL_HOLD_TO_PEAK = 2

function countFingersUp(landmarks) {
  return {
    index: landmarks[8].y < landmarks[5].y,
    middle: landmarks[12].y < landmarks[9].y,
    ring: landmarks[16].y < landmarks[13].y,
    pinky: landmarks[20].y < landmarks[17].y,
  }
}

function fingerCount(fingers) {
  return [fingers.index, fingers.middle, fingers.ring, fingers.pinky].filter(Boolean).length
}

function findScrollableAncestor(element) {
  let node = element
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node)
    if (/(auto|scroll|overlay)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return null
}

class FingerScroller {
  constructor() {
    this.target = 0
    this.current = 0
    this.dir = 0
    this.holdStart = 0
    this.element = null
    this.rafId = null
    this.tick = this.tick.bind(this)
  }

  setDirection(dir, element) {
    if (dir !== this.dir) {
      this.dir = dir
      this.holdStart = Date.now()
    }
    this.element = element || this.element
    const held = (Date.now() - this.holdStart) / 1000
    const ramp = Math.min(held / SCROLL_HOLD_TO_PEAK, 1)
    const speed = SCROLL_BASE + ramp * SCROLL_RAMP
    this.target = dir * speed
    if (!this.rafId && dir !== 0) {
      this.rafId = requestAnimationFrame(this.tick)
    }
  }

  release() {
    this.target = 0
    this.dir = 0
    this.holdStart = 0
  }

  stop() {
    this.release()
    this.current = 0
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = null
    this.element = null
  }

  tick() {
    const ease = this.target !== 0 ? 0.12 : 0.08
    this.current += (this.target - this.current) * ease
    if (Math.abs(this.current) < 0.15 && this.target === 0) {
      this.current = 0
      this.rafId = null
      return
    }
    if (this.element && this.element.isConnected) {
      this.element.scrollBy(0, this.current)
    }
    this.rafId = requestAnimationFrame(this.tick)
  }
}

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
  const scrollerRef = useRef(new FingerScroller())
  const stateRef = useRef({
    smoother: new ExpSmoother(settingsRef.current.smoothingAlpha),
    isPinching: false,
    isGrabbing: false,
    activeGesture: null,
    handsDetected: { left: false, right: false },
    lastClickAt: 0,
  })

  const [pinching, setPinching] = useState(false)
  const [grabbing, setGrabbing] = useState(false)
  const [activeGesture, setActiveGesture] = useState(null)
  const [handsDetected, setHandsDetected] = useState({ left: false, right: false })
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
      if (event.button === 0) {
        setPinching(true)
        setGrabbing(true)
      }
    }

    const handleUp = (event) => {
      if (trackingActive.current) return
      if (event.button === 0) {
        setPinching(false)
        setGrabbing(false)
      }
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

        let rightHandRaw = null
        let rightHandMirrored = null
        let leftHandRaw = null

        if (results.multiHandLandmarks && results.multiHandedness) {
          for (let i = 0; i < results.multiHandLandmarks.length; i += 1) {
            const raw = results.multiHandLandmarks[i]
            const label = results.multiHandedness[i].label

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

            if (label === 'Left') {
              rightHandRaw = raw
              rightHandMirrored = raw.map((point) => ({ ...point, x: 1 - point.x }))
            } else {
              leftHandRaw = raw
            }
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

        const rightFingers = rightHandRaw ? countFingersUp(rightHandRaw) : null
        const isFist = !!rightHandRaw && fingerCount(rightFingers) === 0
        if (isFist !== state.isGrabbing) {
          state.isGrabbing = isFist
          setGrabbing(isFist)
        }

        let scrollDir = 0
        if (leftHandRaw) {
          const leftFingers = countFingersUp(leftHandRaw)
          const count = fingerCount(leftFingers)
          if (count === 1 && leftFingers.index) scrollDir = -1
          else if (count === 2 && leftFingers.index && leftFingers.middle) scrollDir = 1
        }

        if (scrollDir !== 0) {
          const ex = targetRef.current.x
          const ey = targetRef.current.y
          const elementAtCursor = document.elementFromPoint(ex, ey)
          const scrollable = findScrollableAncestor(elementAtCursor)
          scrollerRef.current.setDirection(scrollDir, scrollable)
        } else {
          scrollerRef.current.release()
        }

        let nextActive = null
        if (rightHandRaw) nextActive = 'point'
        if (state.isGrabbing) nextActive = 'grab'
        if (state.isPinching) nextActive = 'pinch'
        if (scrollDir === -1) nextActive = 'scroll-up'
        else if (scrollDir === 1) nextActive = 'scroll-down'
        if (nextActive !== state.activeGesture) {
          state.activeGesture = nextActive
          setActiveGesture(nextActive)
        }

        const detected = { left: !!leftHandRaw, right: !!rightHandRaw }
        if (
          detected.left !== state.handsDetected.left ||
          detected.right !== state.handsDetected.right
        ) {
          state.handsDetected = detected
          setHandsDetected(detected)
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
    scrollerRef.current.stop()
    cameraRef.current = null
    handsRef.current = null
    trackingActive.current = false
    pausedRef.current = false
    setPaused(false)
    if (stateRef.current.isGrabbing) {
      stateRef.current.isGrabbing = false
      setGrabbing(false)
    }
    if (stateRef.current.activeGesture) {
      stateRef.current.activeGesture = null
      setActiveGesture(null)
    }
    if (stateRef.current.handsDetected.left || stateRef.current.handsDetected.right) {
      stateRef.current.handsDetected = { left: false, right: false }
      setHandsDetected({ left: false, right: false })
    }
    setStatus('idle')
  }, [])

  const togglePause = useCallback(() => {
    if (!trackingActive.current) return
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
    if (pausedRef.current) {
      stateRef.current.smoother.reset()
      scrollerRef.current.release()
      if (stateRef.current.isPinching) {
        stateRef.current.isPinching = false
        setPinching(false)
      }
      if (stateRef.current.isGrabbing) {
        stateRef.current.isGrabbing = false
        setGrabbing(false)
      }
      if (stateRef.current.activeGesture) {
        stateRef.current.activeGesture = null
        setActiveGesture(null)
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
      scrollerRef.current.stop()
    }
  }, [])

  return {
    videoRef,
    canvasRef,
    pointerRef,
    pinching,
    grabbing,
    activeGesture,
    handsDetected,
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