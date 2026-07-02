import { useState, type ReactNode } from 'react'
import type { RawCard } from '../lib/deck'
import { Rating, type Grade, type StoredCard } from '../lib/srs'
import { RatingBar, Schaubild } from './ui'

export interface CardProps {
  card: RawCard
  stored?: StoredCard
  onGrade: (g: Grade, wasMC?: boolean, mcCorrect?: boolean) => void
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-[#f0e3ea] px-3 py-1 text-xs font-semibold text-[#7a1f49]">
      {children}
    </span>
  )
}

export function OpenCard({ card, stored, onGrade }: CardProps) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="animate-pop">
      <div className="mb-3 flex items-center gap-2">
        <Tag>✍️ Offene Frage</Tag>
        <Tag>{card.thema}</Tag>
      </div>
      <p className="text-lg font-semibold leading-snug text-gray-900">{card.karte_vorderseite}</p>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-6 w-full rounded-xl bg-[#7a1f49] py-3 font-semibold text-white transition hover:bg-[#661a3d] active:scale-[0.99]"
        >
          Antwort zeigen
        </button>
      ) : (
        <div className="mt-5 space-y-4">
          <ul className="space-y-2 rounded-xl bg-[#eef6f0] p-4">
            {card.karte_rueckseite.map((p, i) => (
              <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-gray-800">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <Schaubild file={card.schaubild} hinweis={card.schaubild_hinweis} />
          <div>
            <p className="mb-1.5 text-center text-sm text-gray-500">Wie gut wusstest du es?</p>
            <RatingBar card={stored} onRate={(g) => onGrade(g)} />
          </div>
        </div>
      )}
    </div>
  )
}

export function McCard({ card, onGrade }: CardProps) {
  const mc = card.multiple_choice
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const correct = picked === mc.richtige_index

  return (
    <div className="animate-pop">
      <div className="mb-3 flex items-center gap-2">
        <Tag>🔘 Multiple Choice</Tag>
        <Tag>{card.thema}</Tag>
      </div>
      <p className="text-lg font-semibold leading-snug text-gray-900">{mc.frage}</p>

      <div className="mt-5 space-y-2.5">
        {mc.optionen.map((opt, i) => {
          const isRight = i === mc.richtige_index
          let cls = 'border-gray-200 bg-white hover:border-[#7a1f49]/50'
          if (answered) {
            if (isRight) cls = 'border-emerald-500 bg-emerald-50'
            else if (i === picked) cls = 'border-red-400 bg-red-50'
            else cls = 'border-gray-200 bg-white opacity-60'
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${cls}`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  answered && isRight
                    ? 'bg-emerald-500 text-white'
                    : answered && i === picked
                      ? 'bg-red-400 text-white'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-[15px] leading-snug text-gray-800">{opt}</span>
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="mt-4 space-y-4 animate-slideup">
          <div
            className={`rounded-xl p-3 text-[15px] font-semibold ${
              correct ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {correct ? '✓ Richtig!' : '✗ Leider falsch.'}
          </div>
          <p className="rounded-xl bg-[#faf6f8] p-3 text-sm leading-relaxed text-gray-700">{mc.erklaerung}</p>
          <Schaubild file={card.schaubild} hinweis={card.schaubild_hinweis} />
          <button
            onClick={() => onGrade(correct ? Rating.Good : Rating.Again, true, correct)}
            className="w-full rounded-xl bg-[#7a1f49] py-3 font-semibold text-white transition hover:bg-[#661a3d] active:scale-[0.99]"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  )
}

export function ReverseCard({ card, stored, onGrade }: CardProps) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="animate-pop">
      <div className="mb-3 flex items-center gap-2">
        <Tag>🖼️ Schaubild erkennen</Tag>
        <Tag>{card.thema}</Tag>
      </div>
      <p className="text-[15px] leading-relaxed text-gray-700">{card.reverse.prompt}</p>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-6 w-full rounded-xl bg-[#7a1f49] py-3 font-semibold text-white transition hover:bg-[#661a3d] active:scale-[0.99]"
        >
          Auflösen
        </button>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl bg-[#eef6f0] p-4 text-center text-lg font-bold text-emerald-800">
            {card.reverse.antwort}
          </div>
          <Schaubild file={card.schaubild} hinweis={card.schaubild_hinweis} />
          <div>
            <p className="mb-1.5 text-center text-sm text-gray-500">Wusstest du das Konzept?</p>
            <RatingBar card={stored} onRate={(g) => onGrade(g)} />
          </div>
        </div>
      )}
    </div>
  )
}
