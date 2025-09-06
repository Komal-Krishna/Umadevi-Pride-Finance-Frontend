'use client'

import { useState } from 'react'
import { X, DollarSign, Calendar, User, Building, Percent } from 'lucide-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

interface OutsideInterestFormProps {
  onClose: () => void
  onSuccess: () => void
  editData?: any
}

export default function OutsideInterestForm({ onClose, onSuccess, editData }: OutsideInterestFormProps) {
  const [formData, setFormData] = useState({
    to_whom: editData?.to_whom || '',
    category: editData?.category || '',
    principle_amount: editData?.principle_amount ? editData.principle_amount.toString() : '',
    interest_rate_percentage: editData?.interest_rate_percentage ? editData.interest_rate_percentage.toString() : '',
    interest_rate_indian: editData?.interest_rate_indian ? editData.interest_rate_indian.toString() : '',
    payment_frequency: editData?.payment_frequency || 'monthly',
    date_of_lending: editData?.date_of_lending || '',
    lend_to: editData?.lend_to || ''
  })

  const [isConverting, setIsConverting] = useState(false)

  const [loading, setLoading] = useState(false)

  // Auto-conversion logic for interest rates
  const handleInterestRateChange = (type: 'percentage' | 'indian', value: string) => {
    if (isConverting) return // Prevent infinite loops
    
    const numValue = parseFloat(value) || 0
    
    setIsConverting(true)
    
    if (type === 'percentage') {
      setFormData(prev => ({
        ...prev,
        interest_rate_percentage: value,
        interest_rate_indian: numValue > 0 ? (numValue / 12).toFixed(2) : ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        interest_rate_indian: value,
        interest_rate_percentage: numValue > 0 ? (numValue * 12).toFixed(2) : ''
      }))
    }
    
    // Reset conversion flag after a short delay
    setTimeout(() => setIsConverting(false), 100)
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/,/g, ''))
    if (isNaN(num)) return ''
    return num.toLocaleString('en-IN')
  }

  const handleCurrencyChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    const formattedValue = formatCurrency(numericValue)
    setFormData(prev => ({ ...prev, principle_amount: formattedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        principle_amount: parseFloat(formData.principle_amount.toString().replace(/,/g, '')),
        interest_rate_percentage: parseFloat(formData.interest_rate_percentage.toString()),
        interest_rate_indian: parseFloat(formData.interest_rate_indian.toString()),
        date_of_lending: formData.date_of_lending
      }

      if (editData) {
        await api.put(`/api/v1/outside_interest/${editData.id}`, submitData)
        toast.success('Outside interest updated successfully!')
      } else {
        await api.post('/api/v1/outside_interest', submitData)
        toast.success('Outside interest created successfully!')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error saving outside interest:', error)
      toast.error(error.response?.data?.detail || 'Error saving outside interest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editData ? 'Edit Outside Interest' : 'Add New Outside Interest'}
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
            {/* To Whom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                To Whom
              </label>
              <input
                type="text"
                value={formData.to_whom}
                onChange={(e) => setFormData(prev => ({ ...prev, to_whom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter recipient name"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Business, Personal, Investment"
                required
              />
            </div>

            {/* Principle Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Principle Amount
              </label>
              <input
                type="text"
                value={formData.principle_amount}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                required
              />
            </div>

            {/* Date of Lending */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date of Lending
              </label>
              <input
                type="date"
                value={formData.date_of_lending}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_lending: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Lend To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Lend To
              </label>
              <input
                type="text"
                value={formData.lend_to}
                onChange={(e) => setFormData(prev => ({ ...prev, lend_to: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter borrower name"
                required
              />
            </div>

            {/* Payment Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency
              </label>
              <select
                value={formData.payment_frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_frequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage Per Annum (%)
                </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.interest_rate_percentage}
                onChange={(e) => handleInterestRateChange('percentage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12.00"
                required
              />
                <p className="text-xs text-gray-500 mt-1">Standard percentage per year</p>
              </div>

              {/* Indian Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indian Interest Rate (₹)
                </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.interest_rate_indian}
                onChange={(e) => handleInterestRateChange('indian', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1.00"
                required
              />
                <p className="text-xs text-gray-500 mt-1">1 rupee = 12% annually</p>
              </div>
            </div>
            
            {/* Auto-fill indicator */}
            {(formData.interest_rate_percentage || formData.interest_rate_indian) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Auto-filled:</strong> {formData.interest_rate_percentage}% per annum = ₹{formData.interest_rate_indian} Indian rate
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (editData ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
