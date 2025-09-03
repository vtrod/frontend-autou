'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { History, CheckCircle, XCircle, Trash2, Download, Eye, Calendar, Filter, Loader2 } from 'lucide-react'
import { useEmailHistory } from '@/hooks/useAPIData'
import { Button } from '@/components/ui/button'
import { formatRelativeTime, downloadAsJson, truncateText } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useState } from 'react'

type FilterType = 'all' | 'productive' | 'unproductive'

export function HistorySection() {
  const { history, loading, error, clearHistory, removeFromHistory } = useEmailHistory()
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const adaptedHistory = history.map(item => ({
    id: item.id,
    content: item.content,
    classification: item.classification,
    confidence: Math.round(item.confidence * 100),
    suggestedResponse: item.suggested_response,
    timestamp: new Date(item.analysis_timestamp),
    fileName: item.file_name
  }))

  const filteredHistory = filter === 'all'
    ? adaptedHistory
    : adaptedHistory.filter(item => item.classification === filter)

  const handleClearHistory = async () => {
    await clearHistory()
  }

  const handleExportHistory = () => {
    if (adaptedHistory.length === 0) {
      toast.error('Nenhum histórico para exportar')
      return
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: adaptedHistory.length,
      history: adaptedHistory.map(item => ({
        id: item.id,
        classification: item.classification,
        confidence: item.confidence,
        timestamp: item.timestamp,
        fileName: item.fileName,
        contentPreview: truncateText(item.content, 100)
      }))
    }

    downloadAsJson(exportData, `autou-email-history-${new Date().toISOString().split('T')[0]}.json`)
    toast.success('Histórico exportado com sucesso!')
  }

  const handleRemoveItem = (id: string) => {
    removeFromHistory(id)
    toast.success('Item removido do histórico')
  }

  const filters = [
    { id: 'all' as const, label: 'Todos', count: adaptedHistory.length },
    {
      id: 'productive' as const,
      label: 'Produtivos',
      count: adaptedHistory.filter(item => item.classification === 'productive').length
    },
    {
      id: 'unproductive' as const,
      label: 'Improdutivos',
      count: adaptedHistory.filter(item => item.classification === 'unproductive').length
    }
  ]

  if (loading) {
    return (
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden"
        >
          <div className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Carregando histórico...</p>
          </div>
        </motion.div>
      </section>
    )
  }

  if (adaptedHistory.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Histórico ({adaptedHistory.length})
            </h3>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="inline-flex p-4 bg-gray-100 dark:bg-zinc-700 rounded-full">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                {filter === 'all' ? 'Nenhuma análise ainda' : `Nenhum email ${filter === 'productive' ? 'produtivo' : 'improdutivo'} encontrado`}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'all'
                  ? 'Seus emails analisados aparecerão aqui'
                  : 'Tente outro filtro ou analise mais emails'
                }
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredHistory.map((item, index) => {
                  const isProductive = item.classification === 'productive'
                  const isExpanded = selectedItem === item.id

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Item Header */}
                      <div className="p-4 bg-gray-50 dark:bg-zinc-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isProductive
                                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                : 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
                              }`}>
                              {isProductive ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <XCircle className="w-5 h-5" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${isProductive
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                    : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                                  }`}>
                                  {isProductive ? 'Produtivo' : 'Improdutivo'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.confidence}% confiança
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {formatRelativeTime(new Date(item.timestamp))}
                                {item.fileName && (
                                  <>
                                    <span>•</span>
                                    <span>{item.fileName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedItem(isExpanded ? null : item.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-200 dark:border-zinc-700"
                          >
                            <div className="p-4 space-y-4">
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                  Conteúdo Analisado:
                                </h5>
                                <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
                                  {item.content}
                                </p>
                              </div>

                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                  Resposta Sugerida:
                                </h5>
                                <p className="text-gray-700 dark:text-gray-300 text-sm bg-primary-50 dark:bg-primary-950 p-3 rounded-lg border border-primary-100 dark:border-primary-800">
                                  {item.suggestedResponse}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
