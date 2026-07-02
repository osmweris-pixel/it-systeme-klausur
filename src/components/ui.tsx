import { useState } from 'react'
import { schaubildUrl } from '../lib/deck'
import { previewInterval, Rating, newCard, type Grade, type StoredCard } from '../lib/srs'

export function Schaubild({ file, hinweis }: { file: string; hinweis?: string }) {
  const [showHint, setShowHint] = useState(false)
  return (
    <div className="animate-slideup">
      <div className="overflow-hidden rounded-xl border border-[#e3d6dd] bg-white shadow-sm">
        <img
          src={schaubildUrl(file)}
          alt="Schaubild aus dem Skript"
          className="mx-auto max-h-[46vh] w-full object-contain"
        />
      </div>
      {hinweis && (
        <div className="mt-2">
          <button
            onClick={() => setShowHint((v) => !v)}
            className="text-sm font-semibold text-[#7a1f49] hover:underline"
          >
            {showHint ? '▾ Lesehilfe ausblenden' : '▸ So liest du das Schaubild'}
          </button>
          {showHint && (
            <p className="mt-1 rounded-lg bg-[#faf6f8] p-3 text-sm leading-relaxed text-gray-700">{hinweis}</p>
          )}
        </div>
      )}
    </div>
  )
}

const RATINGS: { grade: Grade; label: string; cls: string }[] = [
  { grade: Rating.Again, label: 'Nochmal', cls: 'bg-red-500 hover:bg-red-600' },
  { grade: Rating.Hard, label: 'Schwer', cls: 'bg-amber-500 hover:bg-amber-600' },
  { grade: Rating.Good, label: 'Gut', cls: 'bg-emerald-600 hover:bg-emerald-700' },
  { grade: Rating.Easy, label: 'Einfach', cls: 'bg-sky-600 hover:bg-sky-700' },
]

export function RatingBar({ card, onRate }: { card?: StoredCard; onRate: (g: Grade) => void }) {
  const base = card ?? newCard()
  return (
    <div className="grid grid-cols-4 gap-2">
      {RATINGS.map((r) => (
        <button
          key={r.grade}
          onClick={() => onRate(r.grade)}
          className={`flex flex-col items-center rounded-xl px-2 py-2.5 font-semibold text-white transition active:scale-95 ${r.cls}`}
        >
          <span>{r.label}</span>
          <span className="text-[11px] font-normal opacity-90">{previewInterval(base, r.grade)}</span>
        </button>
      ))}
    </div>
  )
}

export function MasteryDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" title={`Mastery ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-4 rounded-full ${i <= level ? 'bg-[#7a1f49]' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#7a1f49] to-[#a13a68] transition-all duration-300"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  )
}
