const EMOJI_REGEX = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu

export function extractExpenseEmoji(description: string | null | undefined): string | null {
  if (!description) return null
  const match = description.match(EMOJI_REGEX)
  return match?.[0] ?? null
}

export function getExpenseTitle(description: string | null | undefined): string {
  if (!description) return ''
  return description
    .replace(EMOJI_REGEX, '')
    .replace(/#\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getExpenseLabel(
  description: string | null | undefined,
  categoryName?: string | null,
): string {
  return getExpenseTitle(description) || categoryName || 'Gasto'
}
