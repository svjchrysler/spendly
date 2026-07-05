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

export const categoryIconOptions = [
  { value: 'utensils', label: 'Alimentación' },
  { value: 'car', label: 'Transporte' },
  { value: 'home', label: 'Vivienda' },
  { value: 'gamepad-2', label: 'Entretenimiento' },
  { value: 'heart-pulse', label: 'Salud' },
  { value: 'receipt', label: 'General' },
]

export const categoryColorOptions = [
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#059669',
  '#64748B',
  '#EF4444',
  '#06B6D4',
]
