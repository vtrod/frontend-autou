'use client'

import { motion } from 'framer-motion'
import { useSystemStats } from '@/hooks/useAPIData'
import { Mail, CheckCircle, XCircle, TrendingUp, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function StatsSection() {
  const { stats, loading, error, fetchStats } = useSystemStats()
  const [displayStats, setDisplayStats] = useState({
    totalProcessed: 0,
    productiveCount: 0,
    unproductiveCount: 0,
    averageConfidence: 0
  })

  useEffect(() => {
    if (!stats) return

    const animateValue = (start: number, end: number, setter: (value: number) => void) => {
      const duration = 1000
      const steps = 60
      const stepValue = (end - start) / steps
      let current = start

      const timer = setInterval(() => {
        current += stepValue
        if ((stepValue > 0 && current >= end) || (stepValue < 0 && current <= end)) {
          current = end
          clearInterval(timer)
        }
        setter(Math.round(current))
      }, duration / steps)

      return timer
    }

    const timers: NodeJS.Timeout[] = []

    timers.push(animateValue(displayStats.totalProcessed, stats.total_processed, (value) =>
      setDisplayStats(prev => ({ ...prev, totalProcessed: value }))
    ))
    timers.push(animateValue(displayStats.productiveCount, stats.productive_count, (value) =>
      setDisplayStats(prev => ({ ...prev, productiveCount: value }))
    ))
    timers.push(animateValue(displayStats.unproductiveCount, stats.unproductive_count, (value) =>
      setDisplayStats(prev => ({ ...prev, unproductiveCount: value }))
    ))
    timers.push(animateValue(displayStats.averageConfidence, Math.round(stats.average_confidence * 100), (value) =>
      setDisplayStats(prev => ({ ...prev, averageConfidence: value }))
    ))

    return () => {
      timers.forEach(timer => clearInterval(timer))
    }
  }, [stats])

  if (loading) {
    return (
      <section className="py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-700">
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            <span className="text-gray-600 dark:text-gray-400">Carregando estatísticas...</span>
          </div>
        </motion.div>
      </section>
    )
  }

  if (!stats || stats.total_processed === 0) {
    return null
  }

  return (
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center"
      >
        <div className="flex items-center gap-8 px-6 py-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayStats.totalProcessed}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processados
            </p>
          </div>

          <div className="w-px h-12 bg-gray-200 dark:bg-zinc-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {displayStats.productiveCount}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Produtivos
            </p>
          </div>

          <div className="w-px h-12 bg-gray-200 dark:bg-zinc-700"></div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {displayStats.unproductiveCount}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Improdutivos
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
