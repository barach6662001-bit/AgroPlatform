import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Density = 'compact' | 'comfortable'

interface PreferencesState {
  sidebarCollapsed: boolean
  density: Density
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  setDensity: (d: Density) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      density: 'compact',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setDensity: (d) => {
        set({ density: d })
        document.documentElement.dataset.density = d
      },
    }),
    {
      name: 'agroplatform-preferences',
      onRehydrateStorage: () => (state) => {
        if (state?.density) document.documentElement.dataset.density = state.density
      },
    }
  )
)
