import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const WEEK_MS = 1000 * 60 * 60 * 24 * 7

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      // Keep cached rows around for offline reopen
      gcTime: WEEK_MS,
      retry: (failureCount) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'online',
      retry: false,
    },
  },
})

export const queryPersister = createSyncStoragePersister({
  storage: typeof window === 'undefined' ? undefined : window.localStorage,
  key: 'spendly-query-cache',
})

export const queryPersistOptions = {
  persister: queryPersister,
  maxAge: WEEK_MS,
  // ponytail: bump to wipe bad caches after schema/query-key changes
  buster: 'v1',
}
