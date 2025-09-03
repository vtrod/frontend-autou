import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Agora mesmo'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h atrás`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d atrás`
  }
  
  return formatDate(date)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function downloadAsJson(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const result = event.target?.result as string
      resolve(result)
    }
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'))
    }
    
    if (file.type === 'application/pdf') {
      // For PDF files, we would need a PDF parser library
      // For now, we'll just read as text (this won't work for actual PDFs)
      reader.readAsText(file)
    } else {
      reader.readAsText(file)
    }
  })
}

export function validateEmailContent(content: string): {
  isValid: boolean
  error?: string
} {
  if (!content.trim()) {
    return { isValid: false, error: 'O conteúdo não pode estar vazio' }
  }
  
  if (content.trim().length < 10) {
    return { isValid: false, error: 'O conteúdo deve ter pelo menos 10 caracteres' }
  }
  
  if (content.length > 10000) {
    return { isValid: false, error: 'O conteúdo não pode exceder 10.000 caracteres' }
  }
  
  return { isValid: true }
}
