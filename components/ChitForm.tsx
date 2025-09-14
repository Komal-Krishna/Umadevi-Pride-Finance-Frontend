'use client'

import { useState } from 'react'
import { X, Calculator, DollarSign, Calendar, User, FileText } from 'lucide-react'
import { api } from '../lib/api'

interface ChitFormProps {
  onClose: () => void
  onSuccess: () => void
}

interface ChitFormData {
  chit_name: string
  total_amount: number
  duration_months: number
  to_whom: string
  start_date: string
}

export default function ChitForm({ onClose, onSuccess }: ChitFormProps) {
  const [formData, setFormData] = useState<ChitFormData>({
    chit_name: '',
    total_amount: 0,
    duration_months: 0,
    to_whom: '',
    start_date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ChitFormData, string>>>({})

  const calculateMonthlyAmount = () => {
    if (formData.total_amount > 0 && formData.duration_months > 0) {
      return formData.total_amount / formData.duration_months
    }
    return 0
  }

  const handleInputChange = (field: keyof ChitFormData, value: string | number) => {
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

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChitFormData, string>> = {}

    if (!formData.chit_name.trim()) {
      newErrors.chit_name = 'Chit name is required'
    }

    if (formData.total_amount <= 0) {
      newErrors.total_amount = 'Total amount must be greater than 0'
    }

    if (formData.duration_months <= 0) {
      newErrors.duration_months = 'Duration must be greater than 0'
    }

    if (!formData.to_whom.trim()) {
      newErrors.to_whom = 'To whom is required'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
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
      await api.post('/api/v1/chits', formData)
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating chit:', error)
      // Handle API errors
      if (error.response?.data?.detail) {
        setErrors({ chit_name: error.response.data.detail })
      }
    } finally {
      setLoading(false)
    }
  }

  const monthlyAmount = calculateMonthlyAmount()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add New Chit</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Chit Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Chit Name
            </label>
            <input
              type="text"
              value={formData.chit_name}
              onChange={(e) => handleInputChange('chit_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.chit_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Family Chit, Office Chit"
            />
            {errors.chit_name && (
              <p className="text-red-500 text-sm mt-1">{errors.chit_name}</p>
            )}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Total Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={formData.total_amount || ''}
              onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.total_amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter total chit amount"
            />
            {errors.total_amount && (
              <p className="text-red-500 text-sm mt-1">{errors.total_amount}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Duration (Months)
            </label>
            <input
              type="number"
              min="1"
              value={formData.duration_months || ''}
              onChange={(e) => handleInputChange('duration_months', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.duration_months ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter duration in months"
            />
            {errors.duration_months && (
              <p className="text-red-500 text-sm mt-1">{errors.duration_months}</p>
            )}
          </div>

          {/* To Whom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              To Whom
            </label>
            <input
              type="text"
              value={formData.to_whom}
              onChange={(e) => handleInputChange('to_whom', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.to_whom ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter recipient name"
            />
            {errors.to_whom && (
              <p className="text-red-500 text-sm mt-1">{errors.to_whom}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.start_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
            )}
          </div>

          {/* Monthly Amount Calculation */}
          {monthlyAmount > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Calculator className="w-4 h-4" />
                <span className="font-medium">Calculated Monthly Amount</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{formatIndianNumber(monthlyAmount)}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {formatIndianNumber(formData.total_amount)} ÷ {formData.duration_months} months
              </div>
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
                  Creating...
                </>
              ) : (
                'Create Chit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
