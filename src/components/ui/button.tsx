'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    children: React.ReactNode
    className?: string
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    type?: 'button' | 'submit' | 'reset'
    title?: string
}

const buttonVariants = {
    default: 'bg-gradient-to-r from-zinc-500 to-neutral-800 text-white hover:bg-gradient-to-r from-zinc-700 to-neutral-900 focus:ring-zinc-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-zinc-300 dark:hover:bg-zinc-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
}

const sizeVariants = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'default',
        size = 'md',
        loading = false,
        disabled,
        children,
        onClick,
        type = 'button',
        title,
        ...props
    }, ref) => {
        const isDisabled = disabled || loading

        return (
            <motion.button
                ref={ref}
                type={type}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                className={cn(
                    'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black',
                    buttonVariants[variant],
                    sizeVariants[size],
                    isDisabled && 'opacity-50 cursor-not-allowed',
                    loading && 'btn-loading',
                    className
                )}
                disabled={isDisabled}
                onClick={onClick}
                title={title}
                {...props}
            >
                {loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {children}
            </motion.button>
        )
    }
)

Button.displayName = 'Button'