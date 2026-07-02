import { useEffect, useMemo, useState } from 'react'
import { CARDS, type RawCard } from '../lib/deck'
import { Schaubild } from './ui'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const EXAM_SIZE = 10
const EXAM_SECONDS = 90 * 60

export function Exam({ onExit }: { onExit: () => void }) {
  const questions = useMemo<RawCard[]>(() => shuffle(CARDS).slice(0, EXAM_SIZE), [])
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (finished) return
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          setFinished(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [finished])

  const q = questions[idx]
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  function rate(v: number) {
    const next = [...scores, v]
    setScores(next)
    if (idx + 1 >= questions.length) {
      setFinished(true)
    } else {
      setIdx((i) => i + 1)
      setRevealed(false)
    }
  }

  if (finished) {
    const points = Math.round(scores.reduce((a, b) => a + b, 0) * 10)
    const used = EXAM_SECONDS - secondsLeft
    return (
      <div className="mx-auto w-full max-w-md animate-pop text-center">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-3 text-5xl">🏁</div>
          <h2 className="mb-1 text-2xl font-bold text-[#7a1f49]">Klausur-Simulation beendet</h2>
          <p className="mb-4 text-gray-500">
            {scores.length} von {questions.length} Fragen bewertet
          </p>
          <div className="text-5xl font-extrabold text-[#7a1f49]">
            {points}
            <span className="text-2xl text-gray-400"> / 100</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Zeit genutzt: {Math.floor(used / 60)} min · Ziel: 9 min pro Frage
          </p>
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

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onExit} className="text-sm text-gray-500 hover:text-gray-800">
          ✕
        </button>
        <div className="flex-1 text-center text-sm font-medium text-gray-500">
          Frage {idx + 1} / {questions.length}
        </div>
        <div
          className={`rounded-lg px-3 py-1 font-mono text-sm font-bold ${
            secondsLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-[#f0e3ea] text-[#7a1f49]'
          }`}
        >
          ⏱ {mm}:{ss}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-6" key={q.id}>
        <div className="mb-3 inline-block rounded-full bg-[#f0e3ea] px-3 py-1 text-xs font-semibold text-[#7a1f49]">
          {q.thema} · 10 Punkte · ~9 Min
        </div>
        <p className="text-lg font-semibold leading-snug text-gray-900">{q.karte_vorderseite}</p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-6 w-full rounded-xl bg-[#7a1f49] py-3 font-semibold text-white transition hover:bg-[#661a3d]"
          >
            Musterlösung zeigen
          </button>
        ) : (
          <div className="mt-5 space-y-4 animate-slideup">
            <ul className="space-y-2 rounded-xl bg-[#eef6f0] p-4">
              {q.karte_rueckseite.map((p, i) => (
                <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-gray-800">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Schaubild file={q.schaubild} hinweis={q.schaubild_hinweis} />
            <div>
              <p className="mb-1.5 text-center text-sm text-gray-500">Wie viel konntest du?</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => rate(0)} className="rounded-xl bg-red-500 py-2.5 font-semibold text-white hover:bg-red-600">
                  Nicht
                </button>
                <button onClick={() => rate(0.5)} className="rounded-xl bg-amber-500 py-2.5 font-semibold text-white hover:bg-amber-600">
                  Teilweise
                </button>
                <button onClick={() => rate(1)} className="rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700">
                  Sicher
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
