// Persistenter Fortschritts-Store (localStorage) mit React-Anbindung.
import { useSyncExternalStore } from 'react'
import { ITEMS } from './deck'
import { isDue, masteryLevel, newCard, reviewCard, type Grade, type StoredCard } from './srs'

const KEY = 'it-systeme-trainer-v1'

export interface Stats {
  xp: number
  streak: number
  lastDay: string
  reviewsTotal: number
  reviewsToday: number
  todayDate: string
  mcCorrect: number
  mcTotal: number
}
export interface Progress {
  cards: Record<string, StoredCard>
  stats: Stats
}

function todayStr(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10)
}
function defaultState(): Progress {
  return {
    cards: {},
    stats: { xp: 0, streak: 0, lastDay: '', reviewsTotal: 0, reviewsToday: 0, todayDate: todayStr(), mcCorrect: 0, mcTotal: 0 },
  }
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>
      return { cards: parsed.cards ?? {}, stats: { ...defaultState().stats, ...parsed.stats } }
    }
  } catch {
    /* ignore */
  }
  return defaultState()
}

let state: Progress = load()
const listeners = new Set<() => void>()

function commit(next: Progress) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void): () => void {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
function getSnapshot(): Progress {
  return state
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function getStoredCard(itemId: string): StoredCard | undefined {
  return state.cards[itemId]
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 60)) + 1
}
export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 60
}

export function grade(itemId: string, rating: Grade, wasMC = false, mcCorrect = false): void {
  const now = new Date()
  const existing = state.cards[itemId] ?? newCard(now)
  const updated = reviewCard(existing, rating, now)

  const s = { ...state.stats }
  const t = todayStr(now)
  if (s.todayDate !== t) {
    s.reviewsToday = 0
    s.todayDate = t
  }
  s.reviewsToday += 1
  s.reviewsTotal += 1
  s.xp += rating >= 3 ? 12 : 6
  if (wasMC) {
    s.mcTotal += 1
    if (mcCorrect) s.mcCorrect += 1
  }
  if (s.lastDay !== t) {
    const yesterday = todayStr(new Date(now.getTime() - 86_400_000))
    s.streak = s.lastDay === yesterday ? s.streak + 1 : 1
    s.lastDay = t
  }
  commit({ cards: { ...state.cards, [itemId]: updated }, stats: s })
}

export function resetProgress(): void {
  commit(defaultState())
}

// ---- Auswahl / Scheduling ----
export function dueItemIds(now: Date = new Date()): string[] {
  return ITEMS.filter((it) => {
    const c = state.cards[it.itemId]
    return !c || isDue(c, now)
  }).map((it) => it.itemId)
}

export function newItemIds(): string[] {
  return ITEMS.filter((it) => !state.cards[it.itemId]).map((it) => it.itemId)
}

export function topicMastery(qids: string[]): number {
  // Durchschnittliche Mastery (0-5) über alle Items der Themen-Fragen.
  const items = ITEMS.filter((it) => qids.includes(it.qid))
  if (items.length === 0) return 0
  const sum = items.reduce((acc, it) => acc + masteryLevel(state.cards[it.itemId]), 0)
  return sum / items.length
}

export function overallMastery(): number {
  const sum = ITEMS.reduce((acc, it) => acc + masteryLevel(state.cards[it.itemId]), 0)
  return sum / ITEMS.length / 5 // 0..1
}
