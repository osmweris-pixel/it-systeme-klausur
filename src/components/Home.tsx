import { BLOCK_LABEL, ITEMS, ITEM_TYPES, TOPICS, type Block, type Topic } from '../lib/deck'
import { dueItemIds, topicMastery, useProgress } from '../lib/store'
import { MasteryDots } from './ui'

export function Home({
  onStudyDue,
  onStudyTopic,
  onExam,
}: {
  onStudyDue: () => void
  onStudyTopic: (t: Topic) => void
  onExam: () => void
}) {
  useProgress() // re-render bei Änderungen
  const due = dueItemIds().length
  const blocks: Block[] = ['A', 'B']

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={onStudyDue}
          className="group rounded-2xl bg-gradient-to-br from-[#7a1f49] to-[#a13a68] p-5 text-left text-white shadow-lg transition hover:brightness-110 active:scale-[0.99]"
        >
          <div className="text-3xl">🎯</div>
          <div className="mt-2 text-lg font-bold">Weiterlernen</div>
          <div className="text-sm text-white/85">
            {due > 0 ? `${due} Karten fällig` : 'Alles wiederholt – frei üben'}
          </div>
        </button>
        <button
          onClick={onExam}
          className="group rounded-2xl border-2 border-[#7a1f49]/20 bg-white p-5 text-left shadow-sm transition hover:border-[#7a1f49]/50 active:scale-[0.99]"
        >
          <div className="text-3xl">🏁</div>
          <div className="mt-2 text-lg font-bold text-[#7a1f49]">Klausur-Simulation</div>
          <div className="text-sm text-gray-500">10 Fragen · 90 Min · wie in der Prüfung</div>
        </button>
      </div>

      {blocks.map((b) => (
        <div key={b}>
          <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-[#7a1f49]">{BLOCK_LABEL[b]}</h2>
          <div className="space-y-2">
            {TOPICS.filter((t) => t.block === b).map((t) => {
              const m = topicMastery(t.qids)
              return (
                <button
                  key={t.thema}
                  onClick={() => onStudyTopic(t)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left shadow-sm transition hover:shadow-md active:scale-[0.99]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-gray-900">{t.thema}</div>
                    <div className="text-xs text-gray-400">
                      {t.qids.length} Frage{t.qids.length > 1 ? 'n' : ''} · {t.qids.length * ITEM_TYPES.length} Karten
                    </div>
                  </div>
                  <MasteryDots level={Math.round(m)} />
                  <span className="text-gray-300">›</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <p className="px-1 text-center text-xs text-gray-400">
        {ITEMS.length} Karten aus {TOPICS.length} Themen · Fortschritt wird lokal gespeichert
      </p>
    </div>
  )
}
