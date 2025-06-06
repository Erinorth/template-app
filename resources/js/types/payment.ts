// Interface สำหรับข้อมูล Payment
export interface Payment {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

// Interface สำหรับ Filter Options
export interface StatusOption {
  value: string
  label: string
  count: number
}

export interface EmailSuggestion {
  value: string
  count: number
}

export interface AmountFilter {
  min?: number
  max?: number
}
