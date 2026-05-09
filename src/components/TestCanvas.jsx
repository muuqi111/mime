import { useState } from 'react'
import { Play, Search } from 'lucide-react'
import { ContentCard } from './ContentCard.jsx'
import { sampleCards } from '../constants/sampleCards.js'

const tabs = ['All', 'Cards', 'Text', 'Shapes']

export function TestCanvas({ accent }) {
  const [activeTab, setActiveTab] = useState('All')
  const [hoveredId, setHoveredId] = useState(sampleCards[1].id)

  return (
    <div className="glass flex min-h-0 min-w-0 flex-col p-5">
      <div className="flex min-w-0 items-center justify-between gap-3.5">
        <div className="min-w-0">
          <div className="eyebrow">Test surface</div>
          <div className="mt-1 text-xl font-semibold tracking-tight md:text-[22px]">
            Try clicking, scrolling, and grabbing
          </div>
        </div>
        <div className="flex flex-none items-center gap-2.5">
          <div className="flex gap-0.5 rounded-[10px] border border-white/5 bg-white/[0.03] p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-[7px] px-3.5 py-1.5 text-[12px] transition-colors ${
                  tab === activeTab ? 'bg-white/[0.08] text-ink' : 'text-ink-dim hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/5 bg-white/[0.03] text-ink transition-colors hover:bg-white/[0.06]"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      <div
        className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-3.5 overflow-hidden sm:grid-cols-2 xl:grid-cols-3"
        style={{ gridAutoRows: '1fr' }}
      >
        {sampleCards.map((card) => (
          <ContentCard
            key={card.id}
            card={card}
            accent={accent}
            hovered={card.id === hoveredId}
            onPointerEnter={() => setHoveredId(card.id)}
            onPointerLeave={() => setHoveredId(null)}
          />
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2.5 border-t border-white/5 pt-3.5">
        <div className="mono min-w-0 truncate text-[11px] tracking-wide text-ink-dim">
          6 ITEMS · DRAG TO REORDER · PINCH TO OPEN
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[9px] px-3.5 py-2 text-[12.5px] font-semibold"
            style={{
              background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 92%, white), ${accent})`,
              color: '#06121a',
              boxShadow: `0 0 18px -4px ${accent}, 0 1px 0 rgba(255,255,255,0.4) inset`,
            }}
          >
            <Play size={13} /> Demo flow
          </button>
          <button
            type="button"
            className="rounded-[9px] border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[12.5px] text-ink transition-colors hover:bg-white/[0.06]"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}