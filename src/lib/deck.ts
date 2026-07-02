// Deck: laedt die Kartendaten und leitet Lern-Items + Themen ab.
import cardsJson from '../data/cards.json'

export type Block = 'A' | 'B'
export type ItemType = 'open' | 'mc' | 'reverse'

export interface MultipleChoice {
  frage: string
  optionen: string[]
  richtige_index: number
  erklaerung: string
}
export interface RawCard {
  id: string
  block: Block
  thema: string
  karte_vorderseite: string
  karte_rueckseite: string[]
  multiple_choice: MultipleChoice
  reverse: { prompt: string; antwort: string }
  schaubild: string
  schaubild_hinweis: string
}

export const CARDS = cardsJson as unknown as RawCard[]
export const CARD_BY_ID: Record<string, RawCard> = Object.fromEntries(CARDS.map((c) => [c.id, c]))

export const ITEM_TYPES: ItemType[] = ['open', 'mc', 'reverse']
export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  open: 'Offene Frage',
  mc: 'Multiple Choice',
  reverse: 'Schaubild erkennen',
}
export const ITEM_TYPE_ICON: Record<ItemType, string> = { open: '✍️', mc: '🔘', reverse: '🖼️' }

export interface Item {
  itemId: string
  qid: string
  type: ItemType
  thema: string
  block: Block
}

export const ITEMS: Item[] = CARDS.flatMap((c) =>
  ITEM_TYPES.map((t) => ({ itemId: `${c.id}__${t}`, qid: c.id, type: t, thema: c.thema, block: c.block })),
)
export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((it) => [it.itemId, it]))

export interface Topic {
  thema: string
  block: Block
  qids: string[]
}
export const TOPICS: Topic[] = (() => {
  const map = new Map<string, Topic>()
  for (const c of CARDS) {
    if (!map.has(c.thema)) map.set(c.thema, { thema: c.thema, block: c.block, qids: [] })
    map.get(c.thema)!.qids.push(c.id)
  }
  return [...map.values()]
})()

export const BLOCK_LABEL: Record<Block, string> = {
  A: 'Block A · Betriebliche Anwendungssysteme',
  B: 'Block B · Elektronischer Handel',
}

export function schaubildUrl(file: string): string {
  return `${import.meta.env.BASE_URL}schaubilder/${file}`
}
