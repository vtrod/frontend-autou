'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/sections/hero-section'
import { UploadSection } from '@/components/sections/upload-section'
import { ResultsSection } from '@/components/sections/results-section'
import { HistorySection } from '@/components/sections/history-section'
import { StatsSection } from '@/components/sections/stats-section'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { useEmailStore } from '@/store/email-store'

export default function HomePage() {
  const { isProcessing, currentResult } = useEmailStore()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* Hero Section */}
            <HeroSection />

            {/* Stats Section */}
            <StatsSection />

            {/* Upload Section */}
            <UploadSection />

            {/* Results Section */}
            {currentResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ResultsSection />
              </motion.div>
            )}

            {/* History Section */}
            <HistorySection />
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Loading Overlay */}
      {isProcessing && <LoadingOverlay />}
    </div>
  )
}
