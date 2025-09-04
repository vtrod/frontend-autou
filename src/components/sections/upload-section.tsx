'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Type, Send, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEmailStore } from '@/store/email-store'
import { extractTextFromFile, validateEmailContent, formatFileSize, generateId } from '@/lib/utils'
import { analyzeEmail, analyzeEmailFile } from '@/lib/api'
import toast from 'react-hot-toast'

type UploadTab = 'file' | 'text'

export function UploadSection() {
  const {
    currentFile,
    currentText,
    setCurrentFile,
    setCurrentText,
    clearCurrentInput,
    isProcessing,
    setProcessing,
    addResult
  } = useEmailStore()

  const [activeTab, setActiveTab] = useState<UploadTab>('file')
  const [dragActive, setDragActive] = useState(false)
  const [textCharCount, setTextCharCount] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.name.match(/\.(txt|pdf)$/i)) {
      toast.error('Apenas arquivos .txt e .pdf são suportados')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB')
      return
    }

    try {
      setCurrentFile(file)
      toast.success(`Arquivo "${file.name}" carregado com sucesso!`)
    } catch (error) {
      toast.error('Erro ao processar o arquivo')
      console.error(error)
    }
  }, [setCurrentFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false)
  })

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setCurrentText(text)
    setTextCharCount(text.length)
  }

  const handleClear = () => {
    clearCurrentInput()
    setTextCharCount(0)
    toast.success('Conteúdo limpo')
  }

  const handleProcess = async () => {
    setProcessing(true)

    try {
      let apiResponse

      if (activeTab === 'file' && currentFile) {
        apiResponse = await analyzeEmailFile(currentFile)
      } else if (activeTab === 'text' && currentText) {
        const validation = validateEmailContent(currentText)
        if (!validation.isValid) {
          toast.error(validation.error!)
          return
        }
        apiResponse = await analyzeEmail(currentText)
      } else {
        toast.error('Nenhum conteúdo para analisar')
        return
      }

      const result = {
        id: apiResponse.id,
        content: activeTab === 'text' ? currentText : (currentFile?.name || 'Arquivo'),
        classification: apiResponse.classification,
        confidence: Math.round(apiResponse.confidence * 100),
        suggestedResponse: apiResponse.suggested_response,
        timestamp: new Date(apiResponse.analysis_timestamp),
        fileName: apiResponse.file_name,
        fileType: currentFile?.type
      }

      addResult(result)

      clearCurrentInput()
      setTextCharCount(0)

      toast.success('Email analisado com sucesso!')

    } catch (error) {
      console.error('Erro ao processar email:', error)
      if (error instanceof Error) {
        toast.error(`Erro: ${error.message}`)
      } else {
        toast.error('Erro ao processar o email')
      }
    } finally {
      setProcessing(false)
    }
  }

  const canProcess = (activeTab === 'file' && currentFile) ||
    (activeTab === 'text' && currentText.trim().length >= 10)

  return (
    <section id="upload-section" className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden"
      >
        <div className="border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
          <div className="flex">
            {[
              { id: 'file' as const, label: 'Upload de Arquivo', icon: Upload },
              { id: 'text' as const, label: 'Texto Direto', icon: Type }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-medium transition-all duration-300 ${activeTab === tab.id
                      ? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-zinc-900 border-b-2 border-primary-600 dark:border-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'file' && (
              <motion.div
                key="file-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${isDragActive || dragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 scale-[1.02]'
                      : 'border-gray-300 dark:border-zinc-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                    }`}
                >
                  <input {...getInputProps()} />

                  <motion.div
                    animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                    className="space-y-4"
                  >
                    <div className={`inline-flex p-4 rounded-full ${isDragActive
                        ? 'bg-primary-100 dark:bg-primary-900'
                        : 'bg-gray-100 dark:bg-zinc-700'
                      }`}>
                      <Upload className={`w-8 h-8 ${isDragActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400'
                        }`} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isDragActive ? 'Solte o arquivo' : 'Envie um arquivo'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        .txt ou .pdf
                      </p>
                    </div>
                  </motion.div>

                  {(isDragActive || dragActive) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-primary-500/10 rounded-2xl flex items-center justify-center"
                    >
                      <div className="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                        Solte para fazer upload
                      </div>
                    </motion.div>
                  )}
                </div>

                {currentFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-700 rounded-xl"
                  >
                    <div className="flex-shrink-0 p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {currentFile.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(currentFile.size)}
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentFile(null)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'text' && (
              <motion.div
                key="text-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <textarea
                  value={currentText}
                  onChange={handleTextChange}
                  placeholder="Cole o texto do email aqui..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />

                {currentText.length > 0 && currentText.length < 10 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-orange-600 dark:text-orange-400 text-sm"
                  >
                    Texto muito curto
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button
              onClick={handleProcess}
              disabled={!canProcess || isProcessing}
              loading={isProcessing}
              className="flex-1"
            >
              <Send className="w-4 h-4" />
              {isProcessing ? 'Analisando...' : 'Analisar'}
            </Button>

            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isProcessing || (!currentFile && !currentText)}
            >
              <Trash2 className="w-4 h-4" />
              Limpar
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}


