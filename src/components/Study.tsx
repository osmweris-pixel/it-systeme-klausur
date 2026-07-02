import { useMemo, useState, type ReactNode } from 'react'
import { CARD_BY_ID, ITEM_BY_ID } from '../lib/deck'
import { grade as storeGrade, getStoredCard } from '../lib/store'
import { Rating, type Grade } from '../lib/srs'
import { McCard, OpenCard, ReverseCard } from './cards'
import { ProgressBar } from './ui'

export function Study({ queue, title, onExit }: { queue: string[]; title: string; onExit: () => void }) {
  const total = useMemo(() => queue.length, [queue])
  const [items, setItems] = useState<string[]>(queue)
  const [learned, setLearned] = useState(0)
  const [reviewed, setReviewed] = useState(0)
  const [mcCorrect, setMcCorrect] = useState(0)
  const [again, setAgain] = useState(0)

  const currentId = items[0]

  function handleGrade(itemId: string, g: Grade, wasMC = false, wasCorrect = false) {
    storeGrade(itemId, g, wasMC, wasCorrect)
    setReviewed((r) => r + 1)
    if (wasMC && wasCorrect) setMcCorrect((c) => c + 1)
    if (g === Rating.Again) {
      setAgain((a) => a + 1)
      setItems((q) => [...q.slice(1), itemId]) // später im Durchgang nochmal
    } else {
      setLearned((l) => l + 1)
      setItems((q) => q.slice(1))
    }
  }

  if (total === 0) {
    return (
      <Done title="Nichts fällig" reviewed={0} mcCorrect={0} again={0} onExit={onExit}>
        Aktuell ist keine Karte fällig. Komm später wieder oder starte ein Thema neu.
      </Done>
    )
  }

  if (!currentId) {
    return (
      <Done title="Durchgang geschafft!" reviewed={reviewed} mcCorrect={mcCorrect} again={again} onExit={onExit} />
    )
  }

  const item = ITEM_BY_ID[currentId]
  const raw = CARD_BY_ID[item.qid]
  const stored = getStoredCard(currentId)

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onExit} className="text-sm text-gray-500 hover:text-gray-800" aria-label="Beenden">
          ✕
        </button>
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs font-medium text-gray-500">
            <span>{title}</span>
            <span>
              {learned} / {total}
            </span>
          </div>
          <ProgressBar value={total ? learned / total : 0} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-lg shadow-[#7a1f49]/5 sm:p-6" key={currentId}>
        {item.type === 'open' && <OpenCard card={raw} stored={stored} onGrade={(g) => handleGrade(currentId, g)} />}
        {item.type === 'mc' && (
          <McCard card={raw} stored={stored} onGrade={(g, mc, ok) => handleGrade(currentId, g, mc, ok)} />
        )}
        {item.type === 'reverse' && (
          <ReverseCard card={raw} stored={stored} onGrade={(g) => handleGrade(currentId, g)} />
        )}
      </div>
    </div>
  )
}

function Done({
  title,
  reviewed,
  mcCorrect,
  again,
  onExit,
  children,
}: {
  title: string
  reviewed: number
  mcCorrect: number
  again: number
  onExit: () => void
  children?: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-md animate-pop text-center">
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-3 text-5xl">🎉</div>
        <h2 className="mb-2 text-2xl font-bold text-[#7a1f49]">{title}</h2>
        {children ? (
          <p className="text-gray-600">{children}</p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat n={reviewed} label="Bewertungen" />
            <Stat n={mcCorrect} label="MC richtig" />
            <Stat n={again} label="Nochmal" />
          </div>
        )}
        <button
          onClick={onExit}
          className="mt-6 w-full rounded-xl bg-[#7a1f49] py-3 font-semibold text-white transition hover:bg-[#661a3d]"
        >
          Zurück zur Übersicht
        </button>
      </div>
    </div>
  )
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-xl bg-[#faf6f8] py-3">
      <div className="text-2xl font-bold text-[#7a1f49]">{n}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
