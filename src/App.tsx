import { useState } from 'react'
import { ITEMS, type Topic } from './lib/deck'
import { dueItemIds, levelFromXp, overallMastery, resetProgress, useProgress, xpForLevel } from './lib/store'
import { Exam } from './components/Exam'
import { Home } from './components/Home'
import { Study } from './components/Study'

type View = { k: 'home' } | { k: 'study'; queue: string[]; title: string } | { k: 'exam' }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [view, setView] = useState<View>({ k: 'home' })
  const p = useProgress()

  const level = levelFromXp(p.stats.xp)
  const curLvlXp = xpForLevel(level)
  const nextLvlXp = xpForLevel(level + 1)
  const lvlProgress = (p.stats.xp - curLvlXp) / (nextLvlXp - curLvlXp)
  const mastery = Math.round(overallMastery() * 100)

  function startDue() {
    setView({ k: 'study', queue: shuffle(dueItemIds()).slice(0, 20), title: 'Fällige Karten' })
  }
  function startTopic(t: Topic) {
    const q = shuffle(ITEMS.filter((it) => t.qids.includes(it.qid)).map((it) => it.itemId))
    setView({ k: 'study', queue: q, title: t.thema })
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-[#e3d6dd] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5">
          <button
            onClick={() => setView({ k: 'home' })}
            className="flex items-center gap-2 font-extrabold text-[#7a1f49]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#7a1f49] text-white">IT</span>
            <span className="hidden sm:inline">Systeme-Trainer</span>
          </button>
          <div className="flex-1" />
          <Badge icon="🔥" value={p.stats.streak} label="Streak" flame={p.stats.streak > 0} />
          <Badge icon="⭐" value={mastery + '%'} label="Mastery" />
          <div className="flex flex-col items-end">
            <div className="text-xs font-bold text-[#7a1f49]">Lvl {level}</div>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-[#7a1f49] to-[#a13a68]"
                style={{ width: `${Math.round(lvlProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {view.k === 'home' && (
          <>
            <h1 className="mb-1 text-center text-2xl font-extrabold text-gray-900">IT-Systeme Trainer</h1>
            <p className="mb-6 text-center text-sm text-gray-500">
              Karteikarten für die Klausur – Thema für Thema, mit Schaubildern und Spaced Repetition
            </p>
            <Home onStudyDue={startDue} onStudyTopic={startTopic} onExam={() => setView({ k: 'exam' })} />
          </>
        )}
        {view.k === 'study' && (
          <Study queue={view.queue} title={view.title} onExit={() => setView({ k: 'home' })} />
        )}
        {view.k === 'exam' && <Exam onExit={() => setView({ k: 'home' })} />}
      </main>

      <footer className="mx-auto w-full max-w-2xl px-4 pb-6 pt-2 text-center">
        <button
          onClick={() => {
            if (confirm('Gesamten Lernfortschritt wirklich zurücksetzen?')) resetProgress()
          }}
          className="text-xs text-gray-400 hover:text-red-500"
        >
          Fortschritt zurücksetzen
        </button>
      </footer>
    </div>
  )
}

function Badge({
  icon,
  value,
  label,
  flame,
}: {
  icon: string
  value: string | number
  label: string
  flame?: boolean
}) {
  return (
    <div className="flex flex-col items-center" title={label}>
      <div className="flex items-center gap-1 font-bold text-gray-800">
        <span className={flame ? 'animate-flame' : ''}>{icon}</span>
        <span>{value}</span>
      </div>
      <div className="text-[10px] text-gray-400">{label}</div>
    </div>
  )
}
