import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { getCategoryEmoji } from '@/lib/category-emojis'
import { extractExpenseEmoji } from '@/lib/expense-display'

interface ExpenseIconProps {
  description?: string | null
  categoryName?: string | null
  categoryIcon?: string | null
  categoryColor?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'pill'
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
  return (
    <CategoryIcon
      emoji={extractExpenseEmoji(description) ?? getCategoryEmoji(categoryName)}
      icon={categoryIcon ?? 'receipt'}
      color={categoryColor}
      name={categoryName}
      size={size}
      className={className}
    />
  )
}
