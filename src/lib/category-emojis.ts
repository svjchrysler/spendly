const CATEGORY_EMOJIS: Record<string, string> = {
  alimentación: '🍔',
  comida: '🍽️',
  food: '🍔',
  'eating out': '🍔',
  restaurante: '🍔',
  supermercado: '🛒',
  groceries: '🛒',
  taxi: '🚕',
  transporte: '🚗',
  transport: '🚗',
  'transporte publico': '🚌',
  'transporte público': '🚌',
  salud: '💊',
  health: '💊',
  home: '💳',
  vivienda: '🏠',
  rent: '🏠',
  entretenimiento: '🎬',
  entertainment: '🎬',
  clothes: '👖',
  ropa: '👖',
  telefono: '📱',
  teléfono: '📱',
  university: '🧑‍🎓',
  universidad: '🧑‍🎓',
  pets: '🐶',
  mascotas: '🐶',
  otros: '📦',
  other: '📦',
  suscripciones: '📱',
  subscriptions: '📱',
}

const EMOJI_RE = /\p{Extended_Pictographic}/u

export const categoryEmojiOptions = [
  '🍔',
  '🍽️',
  '🛒',
  '🚕',
  '🚗',
  '🚌',
  '💊',
  '🏠',
  '💳',
  '🎬',
  '👖',
  '📱',
  '🧑‍🎓',
  '🐶',
  '📦',
  '☕',
  '✈️',
  '🎮',
  '💡',
  '🎁',
]

export function isEmojiIcon(value: string | null | undefined): boolean {
  return Boolean(value && EMOJI_RE.test(value))
}

export function getCategoryEmoji(name: string | null | undefined): string | null {
  if (!name) return null
  return CATEGORY_EMOJIS[name.trim().toLowerCase()] ?? null
}

export function resolveCategoryEmoji(
  icon?: string | null,
  name?: string | null,
): string | null {
  if (isEmojiIcon(icon)) return icon!.match(EMOJI_RE)![0]
  return getCategoryEmoji(name)
}
