import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { resolveCategoryEmoji } from '@/lib/category-emojis'
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
}: Readonly<ExpenseIconProps>) {
  return (
    <CategoryIcon
      emoji={
        extractExpenseEmoji(description) ??
        resolveCategoryEmoji(categoryIcon, categoryName)
      }
      icon={categoryIcon}
      color={categoryColor}
      name={categoryName}
      size={size}
      className={className}
    />
  )
}
