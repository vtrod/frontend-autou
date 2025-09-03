import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/providers/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'AutoU Email Classifier - Classificação Inteligente de Emails',
    description: 'Sistema avançado de classificação de emails usando Inteligência Artificial. Desenvolvido para o desafio AutoU.',
    keywords: ['AutoU', 'Email', 'IA', 'Classificação', 'Inteligência Artificial'],
    authors: [{ name: 'Candidato AutoU' }],
    viewport: 'width=device-width, initial-scale=1',
    robots: 'index, follow',
    openGraph: {
        title: 'AutoU Email Classifier',
        description: 'Sistema inteligente de classificação de emails com IA',
        type: 'website',
        locale: 'pt_BR',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-black dark:to-zinc-900`}>
                <ThemeProvider>
                    <div className="relative min-h-screen">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>

                        {/* Main Content */}
                        <div className="relative z-10">
                            {children}
                        </div>
                    </div>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--border)',
                            },
                        }}
                    />
                </ThemeProvider>
            </body>
        </html>
    )
}
