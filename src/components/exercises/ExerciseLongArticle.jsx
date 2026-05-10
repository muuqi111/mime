import { useEffect, useRef, useState } from 'react'
import { useGesture } from '../../context/GestureContext.jsx'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { ExerciseStats } from './ExerciseStats.jsx'

const HIDDEN_WORD = 'mimosa'

const PARAGRAPHS = [
  'Touchless input has been promised for so long that the phrase itself feels brittle. Every demo reel insists that a wave of the hand could feel as ordinary as a swipe of the thumb, and every working prototype quietly admits how much choreography sits behind that promise.',
  'The first thing that breaks is the cursor. A mouse has weight; the body holds it still without thinking. Suspending a finger in the air looks effortless until you notice the shoulder doing the work of a wrist, and the wrist doing the work of a stylus. The cursor that drifts the most is the one that pretends to be effortless.',
  'Pinches survive better. They are decisive in a way most aerial gestures are not, and the body already knows the move from picking up small things. The hard part is the threshold: how much closure counts as a click, how much opening counts as a release, and how to keep the boundary crisp without making it brittle.',
  'Scroll, on the other hand, is a posture. It is held longer than a click and rewards smoothness more than precision. Two fingers down for one direction, two fingers up for the other, and you are mostly asking the body to relax into a rhythm rather than a target.',
  'Most of the work in a touchless interface is therefore not gesture recognition. It is feedback. A confident cursor, a click that punches, a panel that fades cleanly when the hand drops out of frame. Without that, every interaction feels like talking to a system that might not be listening, and the user folds their arms.',
  `There is a small accidental detail in our current build, the kind of thing only worth mentioning because someone might be skimming, not reading. The flower we ended up using as the watch-word is ${HIDDEN_WORD}. If you found it, the scroll worked.`,
  'The honest version of this is that the medium is still finding its grammar. The desktop took twenty years to settle, the phone closer to ten, and the camera-as-input surface is barely a few. The patterns we have so far are not laws, they are conventions made up to keep the demo from breaking.',
  'Maybe the most useful thing a touchless playground can do is lower the stakes for that grammar to be explored. Not a productivity claim, not a future-of-input claim, just a small, low-friction room in which the body can try a vocabulary on for size. That is the whole pitch.',
  'And if it works, the cursor stops being the part you notice. The hand becomes a mouse without anyone needing to say so. The room learns the rhythm. The prototype gets out of the way.',
]

export function ExerciseLongArticle({ accent }) {
  const { pointerRef, pinching } = useGesture()
  const scrollerRef = useRef(null)
  const wordRef = useRef(null)
  const wasPinchingRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [wordSeen, setWordSeen] = useState(false)
  const [wordFound, setWordFound] = useState(false)
  const [bestSeconds, setBestSeconds] = useLocalStorage('mime.ex.long-article.best-seconds', null)
  const [startedAt, setStartedAt] = useState(null)

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return undefined
    const handleScroll = () => {
      const max = node.scrollHeight - node.clientHeight
      setProgress(max > 0 ? node.scrollTop / max : 0)
    }
    node.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => node.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (wordFound) return undefined
    const node = scrollerRef.current
    const word = wordRef.current
    if (!node || !word) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wordSeen) {
          setWordSeen(true)
          if (!startedAt) setStartedAt(performance.now())
        }
      },
      { root: node, threshold: 0.6 },
    )
    observer.observe(word)
    return () => observer.disconnect()
  }, [wordSeen, wordFound, startedAt])

  useEffect(() => {
    if (pinching && !wasPinchingRef.current && wordSeen && !wordFound) {
      const word = wordRef.current
      if (word) {
        const rect = word.getBoundingClientRect()
        const cx = pointerRef.current.x
        const cy = pointerRef.current.y
        if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
          setWordFound(true)
          if (startedAt) {
            const seconds = (performance.now() - startedAt) / 1000
            if (bestSeconds == null || seconds < bestSeconds) setBestSeconds(seconds)
          }
        }
      }
    }
    wasPinchingRef.current = pinching
  }, [pinching, wordSeen, wordFound, pointerRef, startedAt, bestSeconds, setBestSeconds])

  const reset = () => {
    const node = scrollerRef.current
    if (node) node.scrollTo({ top: 0, behavior: 'auto' })
    setProgress(0)
    setWordSeen(false)
    setWordFound(false)
    setStartedAt(null)
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="relative flex min-h-0 flex-1 gap-3 overflow-hidden">
        <div
          ref={scrollerRef}
          className="scrollbar-none relative h-full min-h-0 flex-1 overflow-y-auto rounded-[12px] border border-white/[0.06] bg-white/[0.015] p-6 pr-8 text-[14px] leading-[1.7] text-ink-dim"
        >
          <div className="mx-auto max-w-[640px] space-y-4">
            {PARAGRAPHS.map((paragraph, index) => (
              <p key={index}>
                {paragraph.includes(HIDDEN_WORD)
                  ? renderWithTarget(paragraph, wordRef, accent, wordFound)
                  : paragraph}
              </p>
            ))}
          </div>
        </div>
        <ProgressRail progress={progress} accent={accent} />
      </div>

      <ExerciseStats
        accent={accent}
        onReset={reset}
        items={[
          { label: 'Progress', value: `${Math.round(progress * 100)}%`, accent: progress > 0.99 },
          {
            label: 'Word',
            value: wordFound ? 'found' : wordSeen ? 'seen, pinch it' : 'hidden',
            accent: wordFound,
          },
          {
            label: 'Best',
            value: bestSeconds != null ? `${bestSeconds.toFixed(1)}s` : '—',
          },
        ]}
      />
    </div>
  )
}

function renderWithTarget(paragraph, wordRef, accent, found) {
  const index = paragraph.indexOf(HIDDEN_WORD)
  if (index === -1) return paragraph
  const before = paragraph.slice(0, index)
  const after = paragraph.slice(index + HIDDEN_WORD.length)
  return (
    <>
      {before}
      <span
        ref={wordRef}
        className="mono cursor-none rounded px-1.5 py-0.5 text-[13px] uppercase tracking-[0.08em]"
        style={{
          color: '#06121a',
          background: found ? `linear-gradient(180deg, ${accent}, color-mix(in oklab, ${accent} 70%, white))` : accent,
          boxShadow: `0 0 18px -4px ${accent}`,
        }}
      >
        {HIDDEN_WORD}
      </span>
      {after}
    </>
  )
}

function ProgressRail({ progress, accent }) {
  return (
    <div className="relative w-1.5 flex-none rounded-full bg-white/[0.04]">
      <div
        className="absolute inset-x-0 top-0 rounded-full transition-[height]"
        style={{
          height: `${Math.max(2, progress * 100)}%`,
          background: accent,
          boxShadow: `0 0 8px ${accent}`,
        }}
      />
    </div>
  )
}