import { useEffect, useState } from 'react'
import { ExerciseClickTargets } from './exercises/ExerciseClickTargets.jsx'
import { ExerciseDragDrop } from './exercises/ExerciseDragDrop.jsx'
import { ExerciseLongArticle } from './exercises/ExerciseLongArticle.jsx'
import { ExercisePlaceholder } from './exercises/ExercisePlaceholder.jsx'

const CLICK_TARGETS = { id: 'click-targets', name: 'Click targets', Component: ExerciseClickTargets }
const DRAG_DROP = { id: 'drag-drop', name: 'Drag & drop', Component: ExerciseDragDrop }
const LONG_ARTICLE = { id: 'long-article', name: 'Long article', Component: ExerciseLongArticle }
const REORDER_SOON = { id: 'reorder', name: 'Reorder list', Component: (props) => <ExercisePlaceholder {...props} label="Reorder list — coming soon" /> }
const SCROLL_TARGET_SOON = { id: 'scroll-target', name: 'Find the word', Component: (props) => <ExercisePlaceholder {...props} label="Find the word — coming soon" /> }
const PINCH_HOLD_SOON = { id: 'pinch-hold', name: 'Pinch hold', Component: (props) => <ExercisePlaceholder {...props} label="Pinch hold — coming soon" /> }
const TRACE_PATH_SOON = { id: 'trace-path', name: 'Trace a path', Component: (props) => <ExercisePlaceholder {...props} label="Trace a path — coming soon" /> }
const COMBO_SOON = { id: 'combo', name: 'Combo', Component: (props) => <ExercisePlaceholder {...props} label="Combo — coming soon" /> }

const TABS = [
  { id: 'All', drills: [CLICK_TARGETS, DRAG_DROP, LONG_ARTICLE] },
  { id: 'Cards', drills: [CLICK_TARGETS, DRAG_DROP, REORDER_SOON] },
  { id: 'Text', drills: [LONG_ARTICLE, SCROLL_TARGET_SOON] },
  { id: 'Shapes', drills: [TRACE_PATH_SOON, PINCH_HOLD_SOON, COMBO_SOON] },
]

const DRILL_TITLES = {
  'click-targets': 'Pinch the targets',
  'drag-drop': 'Grab and place each shape',
  'long-article': 'Scroll through and pinch the highlighted word',
  reorder: 'Reorder the list with a fist',
  'scroll-target': 'Scroll to find the hidden word',
  'pinch-hold': 'Hold the pinch to fill the gauge',
  'trace-path': 'Trace the path with your cursor',
  combo: 'Grab, scroll, release in the zone',
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function TestCanvas({ accent }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [activeDrillId, setActiveDrillId] = useState(TABS[0].drills[0].id)

  const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0]
  const drill = tab.drills.find((d) => d.id === activeDrillId) ?? tab.drills[0]
  const Drill = drill.Component

  useEffect(() => {
    if (!tab.drills.find((d) => d.id === activeDrillId)) {
      setActiveDrillId(tab.drills[0].id)
    }
  }, [tab, activeDrillId])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      if (isTypingTarget(event.target)) return

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        const direction = event.key === 'ArrowLeft' ? -1 : 1
        const currentIndex = TABS.findIndex((t) => t.id === activeTab)
        const nextIndex = (currentIndex + direction + TABS.length) % TABS.length
        const nextTab = TABS[nextIndex]
        setActiveTab(nextTab.id)
        setActiveDrillId(nextTab.drills[0].id)
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        if (tab.drills.length <= 1) return
        event.preventDefault()
        const direction = event.key === 'ArrowUp' ? -1 : 1
        const currentIndex = tab.drills.findIndex((d) => d.id === activeDrillId)
        const nextIndex = (currentIndex + direction + tab.drills.length) % tab.drills.length
        setActiveDrillId(tab.drills[nextIndex].id)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeTab, activeDrillId, tab])

  return (
    <div className="glass flex h-full min-h-0 min-w-0 flex-col p-5">
      <div className="flex min-w-0 items-center justify-between gap-3.5">
        <div className="min-w-0">
          <div className="eyebrow">Test surface</div>
          <div className="mt-1 text-xl font-semibold tracking-tight md:text-[22px]">
            {DRILL_TITLES[drill.id] ?? 'Practice'}
          </div>
        </div>
        <div className="flex flex-none items-center gap-3">
          <div className="flex gap-0.5 rounded-[10px] border border-white/5 bg-white/[0.03] p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id)
                  setActiveDrillId(t.drills[0].id)
                }}
                className={`rounded-[7px] px-3.5 py-1.5 text-[12px] transition-colors ${
                  t.id === activeTab ? 'bg-white/[0.08] text-ink' : 'text-ink-dim hover:text-ink'
                }`}
              >
                {t.id}
              </button>
            ))}
          </div>
          <KeyHint keys={['←', '→']} label="tab" />
        </div>
      </div>

      {tab.drills.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            {tab.drills.map((d) => {
              const active = d.id === activeDrillId
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDrillId(d.id)}
                  className="mono rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors"
                  style={
                    active
                      ? {
                          color: accent,
                          borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`,
                          background: `color-mix(in oklab, ${accent} 14%, transparent)`,
                        }
                      : {
                          color: 'rgba(232,237,243,0.55)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          background: 'transparent',
                        }
                  }
                >
                  {d.name}
                </button>
              )
            })}
          </div>
          <KeyHint keys={['↑', '↓']} label="drill" />
        </div>
      )}

      <div className="mt-3.5 flex min-h-0 flex-1 flex-col">
        <Drill key={drill.id} accent={accent} />
      </div>
    </div>
  )
}

function KeyHint({ keys, label }) {
  return (
    <div className="mono flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-ink-sub">
      {keys.map((key) => (
        <kbd
          key={key}
          className="inline-flex min-w-[18px] items-center justify-center rounded-[5px] border border-white/10 bg-white/[0.04] px-1 py-0.5 text-[10px] text-ink-dim"
        >
          {key}
        </kbd>
      ))}
      <span className="ml-0.5 text-[9px] tracking-[0.14em]">{label}</span>
    </div>
  )
}