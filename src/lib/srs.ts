// Spaced-Repetition-Kern auf Basis von FSRS (ts-fsrs).
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs'

const scheduler = fsrs(
  generatorParameters({ enable_fuzz: true, request_retention: 0.9, maximum_interval: 365 }),
)

// Gespeicherte Karte: wie ts-fsrs Card, aber Datumsfelder als ISO-String (localStorage-tauglich).
export type StoredCard = Omit<Card, 'due' | 'last_review'> & {
  due: string
  last_review?: string
}

function serialize(c: Card): StoredCard {
  return { ...c, due: c.due.toISOString(), last_review: c.last_review?.toISOString() }
}

function revive(s: StoredCard): Card {
  return {
    ...s,
    due: new Date(s.due),
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  } as Card
}

export function newCard(now: Date = new Date()): StoredCard {
  return serialize(createEmptyCard(now))
}

export function reviewCard(s: StoredCard, rating: Grade, now: Date = new Date()): StoredCard {
  const res = scheduler.next(revive(s), now, rating)
  return serialize(res.card)
}

export function isDue(s: StoredCard, now: Date = new Date()): boolean {
  return new Date(s.due).getTime() <= now.getTime()
}

// Vorschau-Intervall (für die Beschriftung der Bewertungsknöpfe).
export function previewInterval(s: StoredCard, rating: Grade, now: Date = new Date()): string {
  const res = scheduler.next(revive(s), now, rating)
  const diffMs = res.card.due.getTime() - now.getTime()
  const days = diffMs / 86_400_000
  if (days >= 1) return `${Math.round(days)} T`
  const mins = diffMs / 60_000
  if (mins >= 60) return `${Math.round(mins / 60)} h`
  return `${Math.max(1, Math.round(mins))} min`
}

// Mastery-Stufe 0-5 aus FSRS-Zustand + Stabilitaet.
export function masteryLevel(s?: StoredCard): number {
  if (!s) return 0
  if (s.state === State.New) return 0
  if (s.state === State.Learning || s.state === State.Relearning) return 1
  const st = s.stability
  if (st < 3) return 2
  if (st < 10) return 3
  if (st < 30) return 4
  return 5
}

export { Rating, State }
export type { Grade }
