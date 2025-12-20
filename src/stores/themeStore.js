import { create } from 'zustand'

export const useThemeStore = create((set, get) => ({
  isDark: true,
  
  toggleTheme: () => {
    const newTheme = !get().isDark
    set({ isDark: newTheme })
    
    // Update document class
    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  },
  
  setTheme: (isDark) => {
    set({ isDark })
    
    // Update document class
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  },
  
  // Initialize theme
  initTheme: () => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const isDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark
    
    set({ isDark })
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}))