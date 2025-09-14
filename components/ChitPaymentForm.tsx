'use client'

import { useState, useEffect } from 'react'
import { X, Calculator, DollarSign, Calendar, FileText, TrendingUp } from 'lucide-react'
import { api } from '../lib/api'

interface Chit {
  id: number
  chit_name: string
  total_amount: number
  duration_months: number
  monthly_amount: number
  to_whom: string
  start_date: string
  is_closed: boolean
}

interface ChitPaymentFormProps {
  onClose: () => void
  onSuccess: () => void
}

interface ChitPaymentFormData {
  source_id: number
  amount: number
  payment_date: string
  description: string
  payment_type: string
  payment_status: string
}

export default function ChitPaymentForm({ onClose, onSuccess }: ChitPaymentFormProps) {
  const [chits, setChits] = useState<Chit[]>([])
  const [formData, setFormData] = useState<ChitPaymentFormData>({
    source_id: 0,
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    description: '',
    payment_type: 'debit',
    payment_status: 'PAID'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ChitPaymentFormData, string>>>({})

  useEffect(() => {
    fetchChits()
  }, [])

  const fetchChits = async () => {
    try {
      const response = await api.get('/api/v1/chits')
      setChits(response.data)
    } catch (error) {
      console.error('Error fetching chits:', error)
    }
  }

  const selectedChit = chits.find(chit => chit.id === formData.source_id)

  const calculateProfit = () => {
    if (selectedChit && formData.amount > 0) {
      const expectedAmount = selectedChit.monthly_amount
      const profit = expectedAmount - formData.amount
      const profitPercentage = (profit / expectedAmount) * 100
      return { profit, profitPercentage }
    }
    return { profit: 0, profitPercentage: 0 }
  }

  const handleInputChange = (field: keyof ChitPaymentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChitPaymentFormData, string>> = {}

    if (!formData.source_id) {
      newErrors.source_id = 'Please select a chit'
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const paymentData = {
        source_type: 'chit',
        source_id: formData.source_id,
        amount: formData.amount,
        payment_date: formData.payment_date,
        description: formData.description,
        payment_type: formData.payment_type,
        payment_status: formData.payment_status
      }

      await api.post('/api/v1/payments', paymentData)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating chit payment:', error)
      // Handle API errors
      if (error.response?.data?.detail) {
        setErrors({ description: error.response.data.detail })
      }
    } finally {
      setLoading(false)
    }
  }

  const { profit, profitPercentage } = calculateProfit()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Chit Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Chit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Select Chit
            </label>
            <select
              value={formData.source_id}
              onChange={(e) => handleInputChange('source_id', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.source_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={0}>Select a chit...</option>
              {chits.map((chit) => (
                <option key={chit.id} value={chit.id}>
                  {chit.chit_name} - {chit.to_whom} (₹{chit.monthly_amount.toLocaleString()}/month)
                </option>
              ))}
            </select>
            {errors.source_id && (
              <p className="text-red-500 text-sm mt-1">{errors.source_id}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Amount Paid (₹)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter amount paid"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Payment Date
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => handleInputChange('payment_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.payment_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.payment_date && (
              <p className="text-red-500 text-sm mt-1">{errors.payment_date}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Enter payment description..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Chit Info & Profit Calculation */}
          {selectedChit && (
            <div className="space-y-3">
              {/* Chit Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Chit Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>Expected Monthly: ₹{selectedChit.monthly_amount.toLocaleString()}</div>
                  <div>Total Amount: ₹{selectedChit.total_amount.toLocaleString()}</div>
                  <div>Duration: {selectedChit.duration_months} months</div>
                </div>
              </div>

              {/* Profit Calculation */}
              {formData.amount > 0 && (
                <div className={`p-4 rounded-lg border ${
                  profit > 0 ? 'bg-green-50 border-green-200' : 
                  profit < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className={`w-4 h-4 ${
                      profit > 0 ? 'text-green-600' : 
                      profit < 0 ? 'text-red-600' : 'text-gray-600'
                    }`} />
                    <span className={`font-medium ${
                      profit > 0 ? 'text-green-900' : 
                      profit < 0 ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      Profit Calculation
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Expected Amount:</span>
                      <span>₹{selectedChit.monthly_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actual Amount:</span>
                      <span>₹{formData.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Profit/Loss:</span>
                      <span className={profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-600'}>
                        ₹{profit.toLocaleString()} ({profitPercentage.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                'Add Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
