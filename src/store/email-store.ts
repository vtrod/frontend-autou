import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface EmailResult {
  id: string
  content: string
  classification: 'productive' | 'unproductive'
  confidence: number
  suggestedResponse: string
  timestamp: Date
  fileName?: string
  fileType?: string
}

interface EmailStats {
  totalProcessed: number
  productiveCount: number
  unproductiveCount: number
  averageConfidence: number
}

interface EmailStore {
  // Current processing state
  isProcessing: boolean
  currentResult: EmailResult | null
  
  // History
  history: EmailResult[]
  
  // Stats
  stats: EmailStats
  
  // Actions
  setProcessing: (processing: boolean) => void
  addResult: (result: EmailResult) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  updateStats: () => void
  
  // File handling
  currentFile: File | null
  currentText: string
  setCurrentFile: (file: File | null) => void
  setCurrentText: (text: string) => void
  clearCurrentInput: () => void
}

export const useEmailStore = create<EmailStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isProcessing: false,
      currentResult: null,
      history: [],
      stats: {
        totalProcessed: 0,
        productiveCount: 0,
        unproductiveCount: 0,
        averageConfidence: 0,
      },
      currentFile: null,
      currentText: '',

      // Actions
      setProcessing: (processing) => set({ isProcessing: processing }),
      
      addResult: (result) => {
        set((state) => ({
          currentResult: result,
          history: [result, ...state.history].slice(0, 50), // Keep only last 50 results
        }))
        get().updateStats()
      },
      
      clearHistory: () => {
        set({
          history: [],
          stats: {
            totalProcessed: 0,
            productiveCount: 0,
            unproductiveCount: 0,
            averageConfidence: 0,
          },
        })
      },
      
      removeFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }))
        get().updateStats()
      },
      
      updateStats: () => {
        const { history } = get()
        const totalProcessed = history.length
        const productiveCount = history.filter((item) => item.classification === 'productive').length
        const unproductiveCount = totalProcessed - productiveCount
        const averageConfidence = totalProcessed > 0 
          ? Math.round(history.reduce((sum, item) => sum + item.confidence, 0) / totalProcessed)
          : 0

        set({
          stats: {
            totalProcessed,
            productiveCount,
            unproductiveCount,
            averageConfidence,
          },
        })
      },
      
      setCurrentFile: (file) => set({ currentFile: file }),
      setCurrentText: (text) => set({ currentText: text }),
      clearCurrentInput: () => set({ currentFile: null, currentText: '' }),
    }),
    {
      name: 'email-store',
      partialize: (state) => ({
        history: state.history,
        stats: state.stats,
      }),
    }
  )
)
