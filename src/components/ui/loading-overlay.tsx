'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export function LoadingOverlay() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: Brain,
      title: 'Analisando conteúdo',
      description: 'Processando texto com IA...'
    },
    {
      icon: Zap,
      title: 'Classificando email',
      description: 'Determinando categoria...'
    },
    {
      icon: CheckCircle,
      title: 'Gerando resposta',
      description: 'Criando sugestão inteligente...'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 max-w-md mx-4 border border-gray-200 dark:border-zinc-700"
      >
        <div className="text-center space-y-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto"
            >
              <div className="w-full h-full border-4 border-primary-200 dark:border-primary-800 rounded-full">
                <div className="w-full h-full border-4 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            </motion.div>
            <motion.div
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
                {(() => {
                  const Icon = steps[currentStep].icon
                  return <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                })()}
              </div>
            </motion.div>
          </div>

          <motion.div
            key={currentStep}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep].description}
            </p>
          </motion.div>

          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStep
                    ? 'bg-primary-600 dark:bg-primary-400 w-8'
                    : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                initial={false}
                animate={{
                  scale: index === currentStep ? 1.2 : 1,
                }}
              />
            ))}
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Powered by AI • Processamento seguro
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Tempo estimado: 2-3 segundos
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
