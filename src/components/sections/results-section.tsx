'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Copy, Edit, Eye, Share2, Download } from 'lucide-react'
import { useEmailStore } from '@/store/email-store'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useState } from 'react'

export function ResultsSection() {
  const { currentResult } = useEmailStore()
  const [editingResponse, setEditingResponse] = useState(false)
  const [editedResponse, setEditedResponse] = useState('')

  if (!currentResult) return null

  const isProductive = currentResult.classification === 'productive'

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(currentResult.suggestedResponse)
      toast.success('Resposta copiada para a área de transferência!')
    } catch (error) {
      toast.error('Erro ao copiar resposta')
    }
  }

  const handleEditResponse = () => {
    setEditedResponse(currentResult.suggestedResponse)
    setEditingResponse(true)
  }

  const handleSaveEdit = () => {
    // Here you would typically update the response in the store
    toast.success('Resposta editada com sucesso!')
    setEditingResponse(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resultado da Análise - AutoU Email Classifier',
          text: `Classificação: ${isProductive ? 'Produtivo' : 'Improdutivo'} (${currentResult.confidence}% confiança)\n\nResposta sugerida: ${currentResult.suggestedResponse}`,
        })
      } catch (error) {
        handleCopyResponse()
      }
    } else {
      handleCopyResponse()
    }
  }

  const handleDownload = () => {
    const data = {
      classification: currentResult.classification,
      confidence: currentResult.confidence,
      suggestedResponse: currentResult.suggestedResponse,
      timestamp: currentResult.timestamp,
      fileName: currentResult.fileName
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `email-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Resultado baixado com sucesso!')
  }

  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Resultado da Análise
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Analisado {formatRelativeTime(new Date(currentResult.timestamp))}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Classification Result */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden"
        >
          <div className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Classificação
              </h3>

              {/* Classification Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
                className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl text-lg font-semibold ${isProductive
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                  }`}
              >
                {isProductive ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                {isProductive ? 'Produtivo' : 'Improdutivo'}
              </motion.div>

              {/* Confidence Score */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Nível de Confiança
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentResult.confidence}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    className={`h-3 rounded-full ${isProductive
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${currentResult.confidence}%` }}
                    transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Classification Description */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300 text-center">
                {isProductive
                  ? 'Este email requer uma ação ou resposta específica e é considerado produtivo para o fluxo de trabalho.'
                  : 'Este email não necessita de uma ação imediata e é classificado como comunicação de cortesia.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="w-4 h-4" />
                Baixar
              </Button>
            </div>
          </div>
        </motion.div>

        {/* AI Response */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden"
        >
          <div className="p-8 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Resposta Sugerida pela IA
            </h3>

            <div className="space-y-4">
              {editingResponse ? (
                <div className="space-y-3">
                  <textarea
                    value={editedResponse}
                    onChange={(e) => setEditedResponse(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white resize-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} className="flex-1">
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingResponse(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950 dark:to-blue-950 rounded-xl border border-primary-100 dark:border-primary-800">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      "{currentResult.suggestedResponse}"
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCopyResponse}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleEditResponse}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Email Preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conteúdo Analisado
            </h3>
            {currentResult.fileName && (
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {currentResult.fileName}
              </span>
            )}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-zinc-800 rounded-xl">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {currentResult.content}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
