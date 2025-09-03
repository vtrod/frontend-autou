/**
 * Hook personalizado para gerenciar dados da API
 */

import { useEffect, useState } from 'react'
import { getEmailHistory, getSystemStats, clearEmailHistory } from '@/lib/api'
import type { EmailHistory, StatsResponse } from '@/lib/api'
import toast from 'react-hot-toast'

export function useEmailHistory() {
  const [history, setHistory] = useState<EmailHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getEmailHistory(50)
      setHistory(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar histórico'
      setError(errorMessage)
      console.error('Erro ao buscar histórico:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    try {
      await clearEmailHistory()
      setHistory([])
      toast.success('Histórico limpo com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao limpar histórico'
      toast.error(errorMessage)
      console.error('Erro ao limpar histórico:', err)
    }
  }

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  return {
    history,
    loading,
    error,
    fetchHistory,
    clearHistory,
    removeFromHistory
  }
}

export function useSystemStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getSystemStats()
      setStats(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas'
      setError(errorMessage)
      console.error('Erro ao buscar estatísticas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    fetchStats
  }
}
