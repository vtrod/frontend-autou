'use client'

import { motion } from 'framer-motion'

export function HeroSection() {
    return (
        <section className="text-center space-y-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
            >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                    <span className="bg-gradient-to-r from-zinc-500 via-neutral-500 to-slate-800 bg-clip-text text-transparent">
                        Email Classifier
                    </span>
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Classifique emails automaticamente e receba sugestões de respostas inteligentes
                </p>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-to-r from-zinc-700 via-neutral-800 to-neutral-900 text-zinc-50 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                        document.querySelector('#upload-section')?.scrollIntoView({
                            behavior: 'smooth'
                        })
                    }}
                >
                    Começar Análise
                </motion.button>
            </motion.div>
        </section>
    )
}
