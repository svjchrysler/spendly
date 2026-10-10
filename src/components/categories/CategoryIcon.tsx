import { resolveCategoryEmoji } from '@/lib/category-emojis'
import { getCategoryIcon } from '@/lib/category-icons'
import { useCategoryColor } from '@/hooks/useCategoryColor'
import { cn } from '@/lib/utils'

const sizeMap = {
  sm: { box: 'size-8', icon: 'size-3.5', emoji: 'text-lg leading-none' },
  md: { box: 'size-9', icon: 'size-4', emoji: 'text-xl leading-none' },
  lg: { box: 'size-12', icon: 'size-5', emoji: 'text-2xl leading-none' },
  xl: { box: 'size-14', icon: 'size-6', emoji: 'text-3xl leading-none' },
  pill: { box: '', icon: 'size-3.5', emoji: 'text-base leading-none' },
} as const

interface CategoryIconProps {
  icon?: string | null
  color?: string | null
  name?: string | null
  emoji?: string | null
  size?: keyof typeof sizeMap
  className?: string
}

export function CategoryIcon({
  icon,
  color: rawColor,
  name,
  emoji: emojiProp,
  size = 'md',
  className,
}: Readonly<CategoryIconProps>) {
  const color = useCategoryColor()(rawColor)
  const emoji = emojiProp ?? resolveCategoryEmoji(icon, name)
  const sizes = sizeMap[size]
  const Icon = getCategoryIcon(icon && !emoji ? icon : 'receipt')
  // El color de la categoría tiñe el fondo: la lista se lee por color antes
  // que por texto
  const tintStyle = color
    ? { backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)` }
    : undefined

  if (size === 'pill') {
    if (emoji) {
      return (
        <span className={cn(sizes.emoji, className)} role="img" aria-hidden>
          {emoji}
        </span>
      )
    }
    return (
      <Icon
        className={cn(sizes.icon, 'shrink-0', className)}
        style={{ color }}
      />
    )
  }

  if (emoji) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-fill-quaternary',
          sizes.box,
          className,
        )}
        style={tintStyle}
      >
        <span className={sizes.emoji} role="img" aria-hidden>
          {emoji}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-fill-quaternary',
        sizes.box,
        className,
      )}
      style={tintStyle}
    >
      <Icon
        className={cn(sizes.icon, !color && 'text-primary')}
        style={color ? { color } : undefined}
      />
    </div>
  )
}
