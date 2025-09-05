'use client'

import { useState, useEffect } from 'react'
import { X, Save, Car, MoreVertical } from 'lucide-react'
import { api } from '../lib/api'

interface VehicleFormData {
  vehicle_name: string
  principle_amount: string
  rent: string
  payment_frequency: 'monthly' | 'bimonthly' | 'quarterly'
  date_of_lending: string
  lend_to: string
}

interface VehicleFormProps {
  isOpen: boolean
  onClose: () => void
  vehicle?: any // For editing existing vehicle
  onSuccess: () => void
}

export default function VehicleForm({ isOpen, onClose, vehicle, onSuccess }: VehicleFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicle_name: '',
    principle_amount: '',
    rent: '',
    payment_frequency: 'monthly',
    date_of_lending: new Date().toISOString().split('T')[0],
    lend_to: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<VehicleFormData>>({})

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
    if (vehicle) {
      setFormData({
        vehicle_name: vehicle.vehicle_name || '',
        principle_amount: vehicle.principle_amount ? formatIndianNumber(vehicle.principle_amount.toString()) : '',
        rent: vehicle.rent ? formatIndianNumber(vehicle.rent.toString()) : '',
        payment_frequency: vehicle.payment_frequency || 'monthly',
        date_of_lending: vehicle.date_of_lending ? new Date(vehicle.date_of_lending).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        lend_to: vehicle.lend_to || ''
      })
    } else {
      // Reset form for new vehicle
      setFormData({
        vehicle_name: '',
        principle_amount: '',
        rent: '',
        payment_frequency: 'monthly',
        date_of_lending: new Date().toISOString().split('T')[0],
        lend_to: ''
      })
    }
  }, [vehicle, isOpen])

  const validateForm = () => {
    const newErrors: Partial<VehicleFormData> = {}
    
    if (!formData.vehicle_name.trim()) {
      newErrors.vehicle_name = 'Vehicle name is required'
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
    
    if (!formData.rent.trim()) {
      newErrors.rent = 'Rent is required'
    } else {
      const rent = parseIndianNumber(formData.rent)
      if (rent <= 0) {
        newErrors.rent = 'Rent must be greater than 0'
      } else if (rent > 99999999.99) {
        newErrors.rent = 'Rent cannot exceed ₹99,999,999.99'
      }
    }
    
    if (!formData.lend_to.trim()) {
      newErrors.lend_to = 'Lend to is required'
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
      const submitData = {
        vehicle_name: formData.vehicle_name,
        principle_amount: parseIndianNumber(formData.principle_amount),
        rent: parseIndianNumber(formData.rent),
        payment_frequency: formData.payment_frequency,
        date_of_lending: formData.date_of_lending,
        lend_to: formData.lend_to
      }
      
      
      if (vehicle) {
        // Update existing vehicle
        await api.put(`/api/v1/vehicles/updateDetails/${vehicle.id}`, submitData)
      } else {
        // Create new vehicle
        await api.post('/api/v1/vehicles/create', submitData)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    let processedValue = value
    
    // Apply Indian formatting for number fields
    if (field === 'principle_amount' || field === 'rent') {
      processedValue = formatIndianNumber(value)
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Car className="w-5 h-5" />
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Maximum amount allowed for principle and rent is ₹99,999,999.99
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Name *
            </label>
            <input
              type="text"
              value={formData.vehicle_name}
              onChange={(e) => handleInputChange('vehicle_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.vehicle_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter vehicle name"
            />
            {errors.vehicle_name && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicle_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              Maximum allowed: ₹9,999,999,999,999.99
            </p>
            {errors.principle_amount && (
              <p className="text-red-500 text-sm mt-1">{errors.principle_amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rent *
            </label>
            <input
              type="text"
              value={formData.rent}
              onChange={(e) => handleInputChange('rent', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.rent ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum allowed: ₹9,999,999,999,999.99
            </p>
            {errors.rent && (
              <p className="text-red-500 text-sm mt-1">{errors.rent}</p>
            )}
          </div>

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
              <option value="bimonthly">Bimonthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Lending *
            </label>
            <input
              type="date"
              value={formData.date_of_lending}
              onChange={(e) => handleInputChange('date_of_lending', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lend to *
            </label>
            <input
              type="text"
              value={formData.lend_to}
              onChange={(e) => handleInputChange('lend_to', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.lend_to ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter person name"
            />
            {errors.lend_to && (
              <p className="text-red-500 text-sm mt-1">{errors.lend_to}</p>
            )}
          </div>

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
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : (vehicle ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
