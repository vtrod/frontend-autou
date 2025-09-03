'use client'

import { motion } from 'framer-motion'
import { Rocket, Moon, Sun, Monitor, Github, Play } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function Header() {
  const { theme, setTheme, actualTheme } = useTheme()

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const ThemeIcon = themeIcons[theme]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800"
    >
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl text-white shadow-lg">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AutoU Email Classifier
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by AI
              </p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleTheme}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800"
              title={`Tema atual: ${theme}`}
            >
              <ThemeIcon className="w-4 h-4" />
            </Button>
          </nav>
        </div>
      </div>
    </motion.header>
  )
}
