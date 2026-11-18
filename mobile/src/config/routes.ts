import catalogue from './routes.json'
import type { UserMode } from '@/types'
export interface AppRoute {
  id: string
  path: string
  title: string
  mode: UserMode | 'public' | 'shared'
  icon?: string
  tab?: boolean
  description?: string
  links?: string[]
}
export const routes = catalogue as AppRoute[]
export type RouteId = (typeof catalogue)[number]['id']
export function getRoute(id: string): AppRoute {
  const route = routes.find((item) => item.id === id)
  if (!route) throw new Error(`Unknown route: ${id}`)
  return route
}
export const homeRoute = (mode: UserMode) => (mode === 'family' ? 'familyHome' : 'elderHome')
export function getTabs(mode: UserMode) {
  const ids =
    mode === 'family'
      ? ['familyHome', 'manageMemory', 'observation', 'interaction', 'account']
      : ['elderHome', 'memory', 'training', 'companion', 'account']
  return ids.map(getRoute)
}
