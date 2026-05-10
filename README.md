# Mime

A browser-based playground for touchless input. Point a webcam at yourself, raise a hand, and your fingers become the mouse, pinch to click, make a fist to grab, hold up one or two fingers on your left hand to scroll. Everything runs locally, no video ever leaves the device.


## What works today

**Hand tracking** runs on MediaPipe Hands and drives a holographic cursor.

| Gesture | Action |
|---|---|
| Right hand, one finger out | Move the cursor |
| Right hand, pinch (thumb + index) | Click the element under the cursor |
| Right hand, closed fist | Grab state (visual only for now, drag isn't wired to anything draggable yet) |
| Left hand, one finger up | Scroll up the element under the cursor |
| Left hand, two fingers up | Scroll down |

**The toolbox** along the bottom has nine commands. 

- Camera : show or hide the camera panel
- Mirror : flip the camera between selfie view and natural
- Recalibrate : recenter the cursor and reset the smoothing buffer
- Sensitivity : popover with sliders for cursor smoothing and pinch thresholds (persists to localStorage)
- Hand : start or stop the MediaPipe tracking entirely
- Pause : freeze tracking without releasing the camera
- Pinch dot : manually toggle the pinch state (debug)
- Keyboard : open the shortcut sheet
- Settings : popover with the accent color picker

**The boot flow** uses a real `getUserMedia` call. If you deny the prompt the loading screen shows a *Try again* / *Continue with mouse* fallback, and the cursor stays on mouse-driven mode until you grant access.

## Test surface

The central panel hosts the drills. Tabs along the top group them by interaction type, and a row of chips inside each tab switches between drills. Best results per drill are persisted to localStorage.

| Tab | Drill | Status |
|---|---|---|
| Cards | Click targets — pinch each glowing circle, chrono runs from first hit | live |
| Cards | Drag & drop — close your fist on a shape, drop it in the matching zone | live |
| Cards | Reorder list | placeholder |
| Text | Long article — scroll the column with your left hand, pinch the highlighted word once you find it | live |
| Text | Find the word | placeholder |
| Shapes | Trace a path / Pinch hold / Combo | placeholder |
| All | Sampler of the live drills | live |

Drills subscribe to a `GestureContext` rather than to native DOM events, so the same code path works in mouse fallback (mousedown counts as both pinch and grab while held).

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and click *Allow camera access*. The first call to MediaPipe lazy-loads the model (~50KB JS plus WASM/TFLite from jsDelivr) so the first pinch may take a moment; after that frames run at 60fps.

```bash
npm run build      # production bundle
npm run preview    # preview the build
```

## Keyboard shortcuts

| Key | Action |
|---|---|
| `R` | Recalibrate cursor |
| `H` | Toggle hand navigation |
| `C` | Toggle camera panel |
| `M` | Mirror camera |
| `Space` | Pause / resume tracking |
| `1` – `6` | Switch accent color |
| `⌘K` / `Ctrl+K` | Open the shortcut sheet |
| `Esc` | Close any popover or overlay |

Shortcuts are ignored while you're typing in an input or contenteditable.

## Stack

- React 18 (functional components, hooks)
- Vite 6
- Tailwind CSS 3
- `@mediapipe/hands` + `@mediapipe/camera_utils` + `@mediapipe/drawing_utils`
- `lucide-react` for icons

The MediaPipe modules are imported dynamically inside `useHandTracking.js`, so the initial bundle stays small and the model only loads after the user clicks *Allow camera access*.


## Roadmap

The remaining placeholders (reorder, scroll-to-find, trace, hold, combo) are next. Beyond that: a confidence/FPS readout that's actually live, snapshot capture of the canvas state, and an *All* tab that meaningfully aggregates a global score across drills rather than just listing them.