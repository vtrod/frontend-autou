/**
 * Cliente da API para comunicação com o backend
 */

// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Tipos para a API baseados nos schemas do backend
export interface EmailAnalysisRequest {
  content: string
  file_name?: string
}

export interface EmailAnalysisResponse {
  id: string
  classification: 'productive' | 'unproductive'
  confidence: number
  suggested_response: string
  analysis_timestamp: string
  file_name?: string
}

export interface EmailHistory {
  id: string
  content: string
  classification: 'productive' | 'unproductive'
  confidence: number
  suggested_response: string
  analysis_timestamp: string
  file_name?: string
}

export interface StatsResponse {
  total_processed: number
  productive_count: number
  unproductive_count: number
  average_confidence: number
}

export interface HealthResponse {
  status: string
  app_name: string
  version: string
  timestamp: string
}

export interface ErrorResponse {
  error: string
  detail?: string
  timestamp: string
}

// Cliente HTTP personalizado
class APIClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        let errorData: ErrorResponse
        try {
          errorData = await response.json()
        } catch {
          throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`)
        }
        throw new Error(errorData.error || `Erro HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro de rede: Não foi possível conectar ao servidor')
    }
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health')
  }

  // Análise de texto direto
  async analyzeText(request: EmailAnalysisRequest): Promise<EmailAnalysisResponse> {
    return this.request<EmailAnalysisResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Análise de arquivo
  async analyzeFile(file: File): Promise<EmailAnalysisResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<EmailAnalysisResponse>('/analyze/file', {
      method: 'POST',
      headers: {}, // Remove Content-Type para FormData
      body: formData,
    })
  }

  // Buscar análise por ID
  async getAnalysis(id: string): Promise<EmailAnalysisResponse> {
    return this.request<EmailAnalysisResponse>(`/analysis/${id}`)
  }

  // Buscar histórico
  async getHistory(limit = 50, classification?: 'productive' | 'unproductive'): Promise<EmailHistory[]> {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    if (classification) {
      params.append('classification', classification)
    }

    return this.request<EmailHistory[]>(`/history?${params.toString()}`)
  }

  // Buscar estatísticas
  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/stats')
  }

  // Limpar histórico
  async clearHistory(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/history', {
      method: 'DELETE',
    })
  }
}

// Instância singleton do cliente
export const apiClient = new APIClient(API_BASE_URL)

// Funções utilitárias de alto nível
export async function analyzeEmail(content: string, fileName?: string): Promise<EmailAnalysisResponse> {
  return apiClient.analyzeText({ content, file_name: fileName })
}

export async function analyzeEmailFile(file: File): Promise<EmailAnalysisResponse> {
  return apiClient.analyzeFile(file)
}

export async function getEmailHistory(limit = 50): Promise<EmailHistory[]> {
  return apiClient.getHistory(limit)
}

export async function getSystemStats(): Promise<StatsResponse> {
  return apiClient.getStats()
}

export async function clearEmailHistory(): Promise<void> {
  await apiClient.clearHistory()
}

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const health = await apiClient.healthCheck()
    return health.status === 'healthy'
  } catch {
    return false
  }
}
