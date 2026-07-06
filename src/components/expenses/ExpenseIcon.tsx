import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { getCategoryEmoji } from '@/lib/category-emojis'
import { extractExpenseEmoji } from '@/lib/expense-display'
import { cn } from '@/lib/utils'

const sizeMap = {
  sm: { box: 'size-8', emoji: 'text-lg leading-none' },
  md: { box: 'size-9', emoji: 'text-xl leading-none' },
  lg: { box: 'size-12', emoji: 'text-2xl leading-none' },
  xl: { box: 'size-14', emoji: 'text-3xl leading-none' },
} as const

interface ExpenseIconProps {
  description?: string | null
  categoryName?: string | null
  categoryIcon?: string | null
  categoryColor?: string | null
  size?: keyof typeof sizeMap
  className?: string
}

export function ExpenseIcon({
  description,
  categoryName,
  categoryIcon,
  categoryColor,
  size = 'md',
  className,
}: ExpenseIconProps) {
  const emoji = extractExpenseEmoji(description) ?? getCategoryEmoji(categoryName)
  const sizes = sizeMap[size]

  if (emoji) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-secondary',
          sizes.box,
          className,
        )}
        style={{
          boxShadow: categoryColor ? `inset 0 0 0 1px ${categoryColor}33` : undefined,
        }}
      >
        <span className={sizes.emoji} role="img" aria-hidden>
          {emoji}
        </span>
      </div>
    )
  }

  return (
    <CategoryIcon
      icon={categoryIcon ?? 'receipt'}
      color={categoryColor}
      name={categoryName}
      size={size}
      className={className}
    />
  )
}
