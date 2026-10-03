import { createContext, useContext } from 'react'

/** Pantallas de primer nivel de Ajustes a las que se puede llegar directo */
export type SettingsEntry = 'root' | 'categorias' | 'presupuesto'

export type SettingsApi = Readonly<{
  openSettings: (entry?: SettingsEntry) => void
}>

export const SettingsContext = createContext<SettingsApi | null>(null)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings debe usarse dentro de AppShell')
  return context
}
