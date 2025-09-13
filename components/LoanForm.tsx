'use client'

import { useState, useEffect } from 'react'
import { X, Save, DollarSign, Building, Percent, Calendar } from 'lucide-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

interface LoanFormData {
  lender_name: string
  lender_type: string
  principle_amount: string
  interest_rate: string
  interest_rate_indian: string
  payment_frequency: 'monthly' | 'bimonthly' | 'quarterly'
  date_of_borrowing: string
}

interface LoanFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: any
}

export default function LoanForm({ isOpen, onClose, onSuccess, editData }: LoanFormProps) {
  const [formData, setFormData] = useState<LoanFormData>({
    lender_name: '',
    lender_type: '',
    principle_amount: '',
    interest_rate: '',
    interest_rate_indian: '',
    payment_frequency: 'monthly',
    date_of_borrowing: new Date().toISOString().split('T')[0]
  })

  const [isConverting, setIsConverting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<LoanFormData>>({})

  // Function to format number in Indian style (1,23,45,678.90)
  const formatIndianNumber = (value: string): string => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '')
    
    // Split by decimal point
    const parts = cleanValue.split('.')
    let integerPart = parts[0]
    const decimalPart = parts[1] || ''
    
    // Indian numbering system: commas every 2 digits from right, except first 3
    if (integerPart.length > 3) {
      // Handle first 3 digits separately
      const firstPart = integerPart.slice(0, integerPart.length - 3)
      const lastPart = integerPart.slice(integerPart.length - 3)
      
      // Add commas every 2 digits in the first part
      let formattedFirstPart = ''
      for (let i = 0; i < firstPart.length; i++) {
        if (i > 0 && (firstPart.length - i) % 2 === 0) {
          formattedFirstPart += ','
        }
        formattedFirstPart += firstPart[i]
      }
      
      // Combine first part + comma + last 3 digits
      integerPart = formattedFirstPart + (formattedFirstPart ? ',' : '') + lastPart
    }
    
    // Combine with decimal part
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart
  }

  // Function to parse Indian formatted number back to float
  const parseIndianNumber = (value: string): number => {
    const cleanValue = value.replace(/,/g, '')
    return parseFloat(cleanValue) || 0
  }

  useEffect(() => {
    if (editData) {
      setFormData({
        lender_name: editData.lender_name || '',
        lender_type: editData.lender_type || '',
        principle_amount: editData.principle_amount ? formatIndianNumber(editData.principle_amount.toString()) : '',
        interest_rate: editData.interest_rate ? editData.interest_rate.toString() : '',
        interest_rate_indian: editData.interest_rate_indian ? editData.interest_rate_indian.toString() : '',
        payment_frequency: editData.payment_frequency || 'monthly',
        date_of_borrowing: editData.date_of_borrowing ? new Date(editData.date_of_borrowing).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      })
    } else {
      // Reset form for new loan
      setFormData({
        lender_name: '',
        lender_type: '',
        principle_amount: '',
        interest_rate: '',
        interest_rate_indian: '',
        payment_frequency: 'monthly',
        date_of_borrowing: new Date().toISOString().split('T')[0]
      })
    }
    // Clear errors when form opens
    setErrors({})
  }, [editData, isOpen])

  const validateForm = () => {
    const newErrors: Partial<LoanFormData> = {}
    
    if (!formData.lender_name.trim()) {
      newErrors.lender_name = 'Lender name is required'
    }
    
    if (!formData.lender_type.trim()) {
      newErrors.lender_type = 'Lender type is required'
    }
    
    if (!formData.principle_amount.trim()) {
      newErrors.principle_amount = 'Principle amount is required'
    } else {
      const amount = parseIndianNumber(formData.principle_amount)
      if (amount <= 0) {
        newErrors.principle_amount = 'Principle amount must be greater than 0'
      } else if (amount > 99999999.99) {
        newErrors.principle_amount = 'Principle amount cannot exceed ₹99,999,999.99'
      }
    }
    
    if (!formData.interest_rate.trim()) {
      newErrors.interest_rate = 'Interest rate is required'
    } else {
      const rate = parseFloat(formData.interest_rate)
      if (rate <= 0) {
        newErrors.interest_rate = 'Interest rate must be greater than 0'
      } else if (rate > 100) {
        newErrors.interest_rate = 'Interest rate cannot exceed 100%'
      }
    }
    
    if (!formData.interest_rate_indian.trim()) {
      newErrors.interest_rate_indian = 'Indian interest rate is required'
    } else {
      const rate = parseFloat(formData.interest_rate_indian)
      if (rate <= 0) {
        newErrors.interest_rate_indian = 'Indian interest rate must be greater than 0'
      } else if (rate > 100) {
        newErrors.interest_rate_indian = 'Indian interest rate cannot exceed 100%'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Auto-conversion logic for interest rates
  const handleInterestRateChange = (type: 'percentage' | 'indian', value: string) => {
    if (isConverting) return // Prevent infinite loops
    
    const numValue = parseFloat(value) || 0
    
    setIsConverting(true)
    
    if (type === 'percentage') {
      setFormData(prev => ({
        ...prev,
        interest_rate: value,
        interest_rate_indian: numValue > 0 ? (numValue / 12).toFixed(2) : ''
      }))
      // Clear errors when user starts typing
      if (errors.interest_rate) {
        setErrors(prev => ({ ...prev, interest_rate: undefined }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        interest_rate_indian: value,
        interest_rate: numValue > 0 ? (numValue * 12).toFixed(2) : ''
      }))
      // Clear errors when user starts typing
      if (errors.interest_rate_indian) {
        setErrors(prev => ({ ...prev, interest_rate_indian: undefined }))
      }
    }
    
    // Reset conversion flag after a short delay
    setTimeout(() => setIsConverting(false), 100)
  }

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    let processedValue = value

    if (field === 'principle_amount') {
      processedValue = formatIndianNumber(value)
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    try {
      const submitData = {
        lender_name: formData.lender_name,
        lender_type: formData.lender_type,
        principle_amount: parseIndianNumber(formData.principle_amount),
        interest_rate: parseFloat(formData.interest_rate),
        interest_rate_indian: parseFloat(formData.interest_rate_indian),
        payment_frequency: formData.payment_frequency,
        date_of_borrowing: formData.date_of_borrowing
      }

      if (editData) {
        await api.put(`/api/v1/loans/${editData.id}`, submitData)
        toast.success('Loan updated successfully!')
      } else {
        await api.post('/api/v1/loans', submitData)
        toast.success('Loan created successfully!')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error saving loan:', error)
      
      // Handle different error response formats
      let errorMessage = 'Error saving loan'
      
      if (error.response?.data) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors array
          errorMessage = error.response.data.detail.map((err: any) => err.msg || err.message || 'Validation error').join(', ')
        } else if (error.response.data.detail && typeof error.response.data.detail === 'object') {
          // Handle single validation error object
          errorMessage = error.response.data.detail.msg || error.response.data.detail.message || 'Validation error'
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editData ? 'Edit Loan' : 'Add New Loan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lender Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building className="w-4 h-4 inline mr-2" />
                Lender Name *
              </label>
              <input
                type="text"
                value={formData.lender_name}
                onChange={(e) => handleInputChange('lender_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.lender_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter lender name"
              />
              {errors.lender_name && (
                <p className="text-red-500 text-sm mt-1">{errors.lender_name}</p>
              )}
            </div>

            {/* Lender Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lender Type *
              </label>
              <input
                type="text"
                value={formData.lender_type}
                onChange={(e) => handleInputChange('lender_type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.lender_type ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Gold, External, Personal"
              />
              {errors.lender_type && (
                <p className="text-red-500 text-sm mt-1">{errors.lender_type}</p>
              )}
            </div>

            {/* Principle Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Principle Amount *
              </label>
              <input
                type="text"
                value={formData.principle_amount}
                onChange={(e) => handleInputChange('principle_amount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.principle_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter amount in Indian format (e.g., 1,00,000)
              </p>
              {errors.principle_amount && (
                <p className="text-red-500 text-sm mt-1">{errors.principle_amount}</p>
              )}
            </div>

            {/* Date of Borrowing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date of Borrowing *
              </label>
              <input
                type="date"
                value={formData.date_of_borrowing}
                onChange={(e) => handleInputChange('date_of_borrowing', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Payment Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Frequency *
              </label>
              <select
                value={formData.payment_frequency}
                onChange={(e) => handleInputChange('payment_frequency', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="monthly">Monthly</option>
                <option value="bimonthly">Bi-monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          {/* Interest Rate Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <Percent className="w-5 h-5 inline mr-2" />
              Interest Rate
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Percentage Per Annum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage Per Annum (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.interest_rate}
                  onChange={(e) => handleInterestRateChange('percentage', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.interest_rate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 12.00"
                />
                <p className="text-xs text-gray-500 mt-1">Standard percentage per year</p>
                {errors.interest_rate && (
                  <p className="text-red-500 text-sm mt-1">{errors.interest_rate}</p>
                )}
              </div>

              {/* Indian Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indian Interest Rate (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.interest_rate_indian}
                  onChange={(e) => handleInterestRateChange('indian', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.interest_rate_indian ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 1.00"
                />
                <p className="text-xs text-gray-500 mt-1">1 rupee = 12% annually</p>
                {errors.interest_rate_indian && (
                  <p className="text-red-500 text-sm mt-1">{errors.interest_rate_indian}</p>
                )}
              </div>
            </div>
            
            {/* Auto-fill indicator */}
            {(formData.interest_rate || formData.interest_rate_indian) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Auto-filled:</strong> {formData.interest_rate}% per annum = ₹{formData.interest_rate_indian} Indian rate
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : (editData ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}