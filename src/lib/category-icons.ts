import {
  Car,
  Gamepad2,
  HeartPulse,
  Home,
  Receipt,
  Utensils,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  home: Home,
  'gamepad-2': Gamepad2,
  'heart-pulse': HeartPulse,
  receipt: Receipt,
}

export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? Receipt
}
