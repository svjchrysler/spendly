const CATEGORY_EMOJIS: Record<string, string> = {
  alimentación: '🍽️',
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

export function getCategoryEmoji(name: string | null | undefined): string | null {
  if (!name) return null
  return CATEGORY_EMOJIS[name.trim().toLowerCase()] ?? null
}
