'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, DollarSign, Users, TrendingUp, Percent, CreditCard, RefreshCw, Plus, X, Edit, Trash2, Lock } from 'lucide-react'
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
  closure_date?: string
  is_collected: boolean
  collected_amount?: number
  collected_date?: string
  created_at: string
  total_payments: number
  total_profit: number
  profit_percentage: number
  net_profit: number
  net_profit_percentage: number
}

interface Payment {
  id: number
  amount: number
  payment_date: string
  description: string
  payment_status: string
  expected_amount?: number
  profit?: number
  profit_percentage?: number
}

interface ChitDetailsProps {
  chitId: number
}

interface ChitPaymentFormData {
  amount: number
  payment_date: string
  description: string
  payment_type: string
  payment_status: string
}

export default function ChitDetails({ chitId }: ChitDetailsProps) {
  const [chit, setChit] = useState<Chit | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [formData, setFormData] = useState<ChitPaymentFormData>({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    description: '',
    payment_type: 'debit',
    payment_status: 'PAID'
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<ChitPaymentFormData>>({})
  const [showEditForm, setShowEditForm] = useState(false)
  const [editFormData, setEditFormData] = useState({
    chit_name: '',
    total_amount: 0,
    duration_months: 0,
    to_whom: '',
    start_date: ''
  })
  const [editFormLoading, setEditFormLoading] = useState(false)
  const [editFormErrors, setEditFormErrors] = useState<Partial<typeof editFormData>>({})
  const [showCollectForm, setShowCollectForm] = useState(false)
  const [collectFormData, setCollectFormData] = useState({
    collected_amount: 0,
    collected_date: new Date().toISOString().split('T')[0]
  })
  const [collectFormLoading, setCollectFormLoading] = useState(false)
  const [collectFormErrors, setCollectFormErrors] = useState<Partial<typeof collectFormData>>({})
  const router = useRouter()

  useEffect(() => {
    fetchChitDetails()
    fetchChitPayments()
  }, [chitId])

  const fetchChitDetails = async () => {
    try {
      const response = await api.get(`/api/v1/chits/${chitId}`)
      setChit(response.data)
    } catch (error) {
      console.error('Error fetching chit details:', error)
    }
  }

  const fetchChitPayments = async () => {
    try {
      const response = await api.get('/api/v1/payments', {
        params: {
          source_type: 'chit',
          source_id: chitId
        }
      })
      setPayments(response.data)
    } catch (error) {
      console.error('Error fetching chit payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchChitDetails()
    fetchChitPayments()
  }

  const handleCloseChit = async () => {
    if (!chit) return
    
    if (confirm('Are you sure you want to close this chit? This action cannot be undone.')) {
      try {
        await api.post(`/api/v1/chits/${chit.id}/close`)
        refreshData()
        alert('Chit closed successfully!')
      } catch (error: any) {
        console.error('Error closing chit:', error)
        const errorMessage = error.response?.data?.detail || 'Failed to close chit. Please try again.'
        alert(errorMessage)
      }
    }
  }

  const handleEditChit = () => {
    if (!chit) return
    
    // Populate edit form with current chit data
    setEditFormData({
      chit_name: chit.chit_name,
      total_amount: chit.total_amount,
      duration_months: chit.duration_months,
      to_whom: chit.to_whom,
      start_date: chit.start_date
    })
    setShowEditForm(true)
  }

  const handleEditInputChange = (field: keyof typeof editFormData, value: string | number) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateEditForm = (): boolean => {
    const newErrors: Partial<typeof editFormData> = {}

    if (!editFormData.chit_name.trim()) {
      newErrors.chit_name = 'Chit name is required'
    }

    if (editFormData.total_amount <= 0) {
      newErrors.total_amount = 'Total amount must be greater than 0'
    }

    if (editFormData.duration_months <= 0) {
      newErrors.duration_months = 'Duration must be greater than 0'
    }

    if (!editFormData.to_whom.trim()) {
      newErrors.to_whom = 'To whom is required'
    }

    if (!editFormData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    setEditFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEditForm()) {
      return
    }

    setEditFormLoading(true)
    try {
      const updateData = {
        chit_name: editFormData.chit_name,
        total_amount: editFormData.total_amount,
        duration_months: editFormData.duration_months,
        to_whom: editFormData.to_whom,
        start_date: editFormData.start_date
      }

      await api.put(`/api/v1/chits/${chitId}`, updateData)
      setShowEditForm(false)
      refreshData()
    } catch (error: any) {
      console.error('Error updating chit:', error)
      if (error.response?.data?.detail) {
        setEditFormErrors({ chit_name: error.response.data.detail })
      }
    } finally {
      setEditFormLoading(false)
    }
  }

  const handleDeleteChit = async () => {
    if (!chit) return
    
    if (confirm('Are you sure you want to delete this chit? This will also delete all associated payments. This action cannot be undone.')) {
      try {
        await api.delete(`/api/v1/chits/${chit.id}`)
        alert('Chit deleted successfully!')
        router.push('/chit')
      } catch (error: any) {
        console.error('Error deleting chit:', error)
        const errorMessage = error.response?.data?.detail || 'Failed to delete chit. Please try again.'
        alert(errorMessage)
      }
    }
  }

  const handleCollectChit = () => {
    if (!chit) return
    
    // Populate collect form with current date
    setCollectFormData({
      collected_amount: 0,
      collected_date: new Date().toISOString().split('T')[0]
    })
    setShowCollectForm(true)
  }

  const handleCollectInputChange = (field: keyof typeof collectFormData, value: string | number) => {
    setCollectFormData(prev => ({ ...prev, [field]: value }))
    if (collectFormErrors[field]) {
      setCollectFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateCollectForm = (): boolean => {
    const newErrors: Partial<typeof collectFormData> = {}

    if (collectFormData.collected_amount <= 0) {
      newErrors.collected_amount = 'Collected amount must be greater than 0'
    }

    if (!collectFormData.collected_date) {
      newErrors.collected_date = 'Collected date is required'
    }

    setCollectFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCollectForm()) {
      return
    }

    setCollectFormLoading(true)
    try {
      const collectData = {
        collected_amount: collectFormData.collected_amount,
        collected_date: collectFormData.collected_date
      }

      await api.post(`/api/v1/chits/${chitId}/collect`, collectData)
      setShowCollectForm(false)
      refreshData()
      alert('Chit collected successfully!')
    } catch (error: any) {
      console.error('Error collecting chit:', error)
      if (error.response?.data?.detail) {
        setCollectFormErrors({ collected_amount: error.response.data.detail })
      }
    } finally {
      setCollectFormLoading(false)
    }
  }

  const calculateProfit = () => {
    if (chit && formData.amount > 0) {
      const expectedAmount = chit.monthly_amount
      const profit = expectedAmount - formData.amount
      const profitPercentage = (profit / expectedAmount) * 100
      return { profit, profitPercentage }
    }
    return { profit: 0, profitPercentage: 0 }
  }

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  const getDaysPassedThisMonth = () => {
    if (!chit) return 0
    
    const startDate = new Date(chit.start_date)
    const endDate = new Date(formData.payment_date || new Date())
    
    // Calculate months difference
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                 (endDate.getMonth() - startDate.getMonth())
    
    let days = 0
    
    if (endDate.getDate() < startDate.getDate()) {
      // Case 1: Payment day < start day (e.g., 5 < 17)
      // Subtract 1 month and calculate days from previous month's anniversary
      months--
      
      // Calculate days from previous month's anniversary to payment date
      const prevAnniversary = new Date(endDate.getFullYear(), endDate.getMonth() - 1, startDate.getDate())
      const diffTime = endDate.getTime() - prevAnniversary.getTime()
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } else {
      // Case 2: Payment day >= start day (e.g., 19 >= 17)
      // Just calculate days from current month's anniversary
      days = endDate.getDate() - startDate.getDate()
    }
    
    return Math.max(0, days)
  }

  const getTotalDuration = () => {
    if (!chit) return { months: 0, days: 0 }
    
    const startDate = new Date(chit.start_date)
    const endDate = new Date(formData.payment_date || new Date())
    
    // Calculate months difference
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                 (endDate.getMonth() - startDate.getMonth())
    
    let days = 0
    
    if (endDate.getDate() < startDate.getDate()) {
      // Case 1: Payment day < start day (e.g., 5 < 17)
      // Subtract 1 month and calculate days from previous month's anniversary
      months--
      
      // Calculate days from previous month's anniversary to payment date
      const prevAnniversary = new Date(endDate.getFullYear(), endDate.getMonth() - 1, startDate.getDate())
      const diffTime = endDate.getTime() - prevAnniversary.getTime()
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } else {
      // Case 2: Payment day >= start day (e.g., 19 >= 17)
      // Just calculate days from current month's anniversary
      days = endDate.getDate() - startDate.getDate()
    }
    
    return { months: Math.max(0, months), days: Math.max(0, days) }
  }

  const getChitDuration = () => {
    if (!chit) return { months: 0, days: 0 }
    
    const startDate = new Date(chit.start_date)
    const endDate = new Date() // Current date
    
    // Calculate months difference
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                 (endDate.getMonth() - startDate.getMonth())
    
    let days = 0
    
    if (endDate.getDate() < startDate.getDate()) {
      // Case 1: Current day < start day (e.g., 5 < 17)
      // Subtract 1 month and calculate days from previous month's anniversary
      months--
      
      // Calculate days from previous month's anniversary to current date
      const prevAnniversary = new Date(endDate.getFullYear(), endDate.getMonth() - 1, startDate.getDate())
      const diffTime = endDate.getTime() - prevAnniversary.getTime()
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } else {
      // Case 2: Current day >= start day (e.g., 19 >= 17)
      // Just calculate days from current month's anniversary
      days = endDate.getDate() - startDate.getDate()
    }
    
    return { months: Math.max(0, months), days: Math.max(0, days) }
  }

  const handleInputChange = (field: keyof ChitPaymentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ChitPaymentFormData> = {}

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required'
    }

    // Description is optional, no validation needed

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setFormLoading(true)
    try {
      const paymentData = {
        source_type: 'chit',
        source_id: chitId,
        amount: formData.amount,
        payment_date: formData.payment_date,
        description: formData.description,
        payment_type: formData.payment_type,
        payment_status: formData.payment_status
      }

      await api.post('/api/v1/payments', paymentData)
      
      // Reset form
      setFormData({
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        description: '',
        payment_type: 'debit',
        payment_status: 'PAID'
      })
      setShowPaymentForm(false)
      refreshData()
    } catch (error: any) {
      console.error('Error creating chit payment:', error)
      if (error.response?.data?.detail) {
        setFormErrors({ description: error.response.data.detail })
      }
    } finally {
      setFormLoading(false)
    }
  }

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600'
    if (profit < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PARTIAL':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!chit) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chit not found</h3>
        <button
          onClick={() => router.push('/chit')}
          className="btn-secondary"
        >
          Back to Chits
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/chit')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chits
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{chit.chit_name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          
          {!chit?.is_closed && (
            <button
              onClick={() => handleCloseChit()}
              className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Close Chit
            </button>
          )}
          
          {!chit.is_collected && (
            <button
              onClick={() => handleCollectChit()}
              className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Collect
            </button>
          )}
          
          <button
            onClick={() => handleEditChit()}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          
          <button
            onClick={() => handleDeleteChit()}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Chit Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chit Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`card ${chit?.is_collected ? 'bg-green-50 border-green-200' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chit Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">To Whom</div>
                  <div className="font-medium">{chit.to_whom}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="font-medium">₹{chit.total_amount.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-medium">{chit.duration_months} months</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Monthly Amount</div>
                  <div className="font-medium">₹{chit.monthly_amount.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${chit.is_collected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`font-medium ${chit.is_collected ? 'text-green-600' : 'text-gray-600'}`}>
                    {chit.is_collected ? 'Collected' : 'Not Collected'}
                  </div>
                </div>
              </div>
              {chit.is_collected && chit.collected_amount && (
                <>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-sm text-gray-600">Collected Amount</div>
                      <div className="font-medium text-green-600">₹{chit.collected_amount.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-sm text-gray-600">Collected Date</div>
                      <div className="font-medium text-green-600">
                        {chit.collected_date ? new Date(chit.collected_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Start Date</div>
                  <div className="font-medium">{new Date(chit.start_date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5" />
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    chit.is_closed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {chit.is_closed ? 'Closed' : 'Active'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Duration Since Start</div>
                  <div className="font-medium">
                    {getChitDuration().months} month{getChitDuration().months !== 1 ? 's' : ''} {getChitDuration().days} day{getChitDuration().days !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collected Analysis - Only show if chit is collected */}
          {chit.is_collected && (
            <div className="card bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Collected Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Total Amount Paid</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    ₹{chit.total_payments.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Amount Received</span>
                  </div>
                  <span className="font-bold text-green-600">
                    ₹{chit.collected_amount?.toLocaleString() || '0'}
                  </span>
                </div>

                <div className="border-t border-green-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Net Profit</span>
                    </div>
                    <span className={`font-bold text-lg ${chit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{chit.net_profit.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Net Profit %</span>
                    </div>
                    <span className={`font-bold text-lg ${chit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {chit.net_profit_percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profit Summary */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Total Profit</span>
                </div>
                <span className={`font-bold ${getProfitColor(chit.total_profit)}`}>
                  ₹{chit.total_profit.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Profit %</span>
                </div>
                <span className={`font-bold ${getProfitColor(chit.total_profit)}`}>
                  {chit.profit_percentage.toFixed(2)}%
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Total Received</span>
                  <span className="font-medium">₹{chit.total_payments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected Total</span>
                  <span className="font-medium">₹{chit.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Months Completed</span>
                <span className="font-medium">{payments.length} of {chit.duration_months} months</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((payments.length / chit.duration_months) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {payments.length} payments completed • {chit.duration_months - payments.length} months remaining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Form */}
      {showPaymentForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Payment</h3>
            <button
              onClick={() => setShowPaymentForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter amount paid"
                />
                {formErrors.amount && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>
                )}
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => handleInputChange('payment_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.payment_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.payment_date && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.payment_date}</p>
                )}
              </div>
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
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Enter payment description..."
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
              )}
            </div>

            {/* Profit Calculation */}
            {chit && formData.amount > 0 && (
              <div className={`p-4 rounded-lg border ${
                calculateProfit().profit > 0 ? 'bg-green-50 border-green-200' : 
                calculateProfit().profit < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={`w-4 h-4 ${
                    calculateProfit().profit > 0 ? 'text-green-600' : 
                    calculateProfit().profit < 0 ? 'text-red-600' : 'text-gray-600'
                  }`} />
                  <span className={`font-medium ${
                    calculateProfit().profit > 0 ? 'text-green-900' : 
                    calculateProfit().profit < 0 ? 'text-red-900' : 'text-gray-900'
                  }`}>
                    Profit Calculation
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Expected Amount:</span>
                    <span>₹{formatIndianNumber(chit.monthly_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Amount:</span>
                    <span>₹{formatIndianNumber(formData.amount)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Profit/Loss:</span>
                    <span className={getProfitColor(calculateProfit().profit)}>
                      ₹{formatIndianNumber(calculateProfit().profit)} ({calculateProfit().profitPercentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {formLoading ? (
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
      )}

      {/* Payments History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
          {!showPaymentForm && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Payment
            </button>
          )}
        </div>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        ₹{payment.expected_amount?.toLocaleString() || chit.monthly_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.profit !== undefined ? (
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${getProfitColor(payment.profit)}`}>
                            ₹{payment.profit.toLocaleString()}
                          </span>
                          {payment.profit_percentage !== undefined && (
                            <span className={`text-xs ${getProfitColor(payment.profit)}`}>
                              {payment.profit_percentage.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.payment_status)}`}>
                        {payment.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 truncate max-w-xs block">
                        {payment.description || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start by adding the first payment for this chit.</p>
            {!showPaymentForm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="btn-primary"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Add Payment
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Chit Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Chit</h3>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Chit Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chit Name
                </label>
                <input
                  type="text"
                  value={editFormData.chit_name}
                  onChange={(e) => handleEditInputChange('chit_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    editFormErrors.chit_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Family Chit, Office Chit"
                />
                {editFormErrors.chit_name && (
                  <p className="text-red-500 text-sm mt-1">{editFormErrors.chit_name}</p>
                )}
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={editFormData.total_amount || ''}
                  onChange={(e) => handleEditInputChange('total_amount', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    editFormErrors.total_amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter total chit amount"
                />
                {editFormErrors.total_amount && (
                  <p className="text-red-500 text-sm mt-1">{editFormErrors.total_amount}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editFormData.duration_months || ''}
                  onChange={(e) => handleEditInputChange('duration_months', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    editFormErrors.duration_months ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter duration in months"
                />
                {editFormErrors.duration_months && (
                  <p className="text-red-500 text-sm mt-1">{editFormErrors.duration_months}</p>
                )}
              </div>

              {/* To Whom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Whom
                </label>
                <input
                  type="text"
                  value={editFormData.to_whom}
                  onChange={(e) => handleEditInputChange('to_whom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    editFormErrors.to_whom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter recipient name"
                />
                {editFormErrors.to_whom && (
                  <p className="text-red-500 text-sm mt-1">{editFormErrors.to_whom}</p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editFormData.start_date}
                  onChange={(e) => handleEditInputChange('start_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    editFormErrors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {editFormErrors.start_date && (
                  <p className="text-red-500 text-sm mt-1">{editFormErrors.start_date}</p>
                )}
              </div>

              {/* Monthly Amount Calculation */}
              {editFormData.total_amount > 0 && editFormData.duration_months > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">Calculated Monthly Amount</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    ₹{(editFormData.total_amount / editFormData.duration_months).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {editFormData.total_amount.toLocaleString()} ÷ {editFormData.duration_months} months
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={editFormLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editFormLoading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {editFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Chit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Chit Form Modal */}
      {showCollectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Collect Chit</h3>
              <button
                onClick={() => setShowCollectForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCollectSubmit} className="p-6 space-y-4">
              {/* Collected Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collected Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={collectFormData.collected_amount || ''}
                  onChange={(e) => handleCollectInputChange('collected_amount', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    collectFormErrors.collected_amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter collected amount"
                />
                {collectFormErrors.collected_amount && (
                  <p className="text-red-500 text-sm mt-1">{collectFormErrors.collected_amount}</p>
                )}
              </div>

              {/* Collected Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collected Date
                </label>
                <input
                  type="date"
                  value={collectFormData.collected_date}
                  onChange={(e) => handleCollectInputChange('collected_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    collectFormErrors.collected_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {collectFormErrors.collected_date && (
                  <p className="text-red-500 text-sm mt-1">{collectFormErrors.collected_date}</p>
                )}
              </div>

              {/* Chit Information */}
              {chit && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">Chit Information</span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div><strong>Chit Name:</strong> {chit.chit_name}</div>
                    <div><strong>Total Amount:</strong> ₹{formatIndianNumber(chit.total_amount)}</div>
                    <div><strong>Monthly Amount:</strong> ₹{formatIndianNumber(chit.monthly_amount)}</div>
                    <div><strong>To Whom:</strong> {chit.to_whom}</div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCollectForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={collectFormLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={collectFormLoading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {collectFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Collecting...
                    </>
                  ) : (
                    'Mark as Collected'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
