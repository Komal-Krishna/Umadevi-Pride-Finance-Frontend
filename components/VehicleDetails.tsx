'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, DollarSign, User, CreditCard, CheckCircle, XCircle, Plus, Clock, RefreshCw } from 'lucide-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import Layout from './Layout'

interface Vehicle {
  id: number
  vehicle_name: string
  principle_amount: number
  rent: number
  payment_frequency: string
  date_of_lending: string
  lend_to: string
  is_closed: boolean
  closure_date?: string
  created_at: string
  updated_at: string
}

interface Payment {
  id: number
  vehicle_id: number
  amount: number
  payment_date: string
  payment_type: string
  notes?: string
  created_at: string
}

interface VehicleDetailsProps {
  vehicleId: string
}

export default function VehicleDetails({ vehicleId }: VehicleDetailsProps) {
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [displayAmount, setDisplayAmount] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchVehicleDetails()
    fetchPayments()
  }, [vehicleId])

  // Refresh data when component becomes visible (e.g., returning from edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchVehicleDetails()
        fetchPayments()
      }
    }

    // Only add event listener in browser environment
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [vehicleId])

  const fetchVehicleDetails = async () => {
    try {
      const response = await api.get(`/api/v1/vehicles/${vehicleId}`)
      setVehicle(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Vehicle not found. Please check if the vehicle exists.')
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error('Failed to fetch vehicle details')
      }
      router.push('/vehicles')
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await api.get(`/api/v1/payments?vehicle_id=${vehicleId}`)
      // Map description field to notes for frontend compatibility
      const paymentsWithNotes = (response.data || []).map((payment: any) => ({
        ...payment,
        notes: payment.description || payment.notes
      }))
      // Sort payments by date in descending order (newest first)
      const sortedPayments = paymentsWithNotes.sort((a: any, b: any) => {
        return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      })
      setPayments(sortedPayments)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    if (!paymentDate) {
      toast.error('Please select a payment date')
      return
    }

    try {
      const paymentData = {
        vehicle_id: parseInt(vehicleId),
        amount: parseFloat(paymentAmount),
        payment_date: paymentDate,
        notes: paymentNotes
      }

      await api.post('/api/v1/payments/create', paymentData)
      
      toast.success('Payment recorded successfully!')
      setPaymentAmount('')
      setDisplayAmount('')
      setPaymentNotes('')
      setPaymentDate(new Date().toISOString().split('T')[0])
      setShowPaymentForm(false)
      
      // Small delay to ensure the backend has processed the request
      setTimeout(() => {
        fetchPayments() // Refresh payments list
      }, 100)
    } catch (error: any) {
      toast.error('Failed to record payment')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumberWithCommas = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '')
    
    // Split by decimal point
    const parts = numericValue.split('.')
    
    // Format the integer part with Indian commas
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    
    // Return formatted number
    if (parts.length > 1) {
      return `${integerPart}.${parts[1]}`
    }
    return integerPart
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = value.replace(/[^\d.]/g, '')
    
    setPaymentAmount(numericValue)
    setDisplayAmount(formatNumberWithCommas(value))
  }

  const handleCloseVehicle = async () => {
    if (!vehicle) return
    try {
      await api.post(`/api/v1/vehicles/close/${vehicle.id}`)
      toast.success('Vehicle closed successfully!')
      setShowCloseConfirm(false)
      fetchVehicleDetails() // Refresh vehicle details
    } catch (error) {
      toast.error('Failed to close vehicle')
    }
  }

  const handleDeleteVehicle = async () => {
    if (!vehicle) return
    try {
      await api.delete(`/api/v1/vehicles/delete/${vehicle.id}`)
      toast.success('Vehicle deleted successfully!')
      setShowDeleteConfirm(false)
      router.push('/vehicles') // Redirect to vehicles list
    } catch (error) {
      toast.error('Failed to delete vehicle')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }


  const getTotalPaid = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0)
  }

  const getPrincipleAmount = () => {
    if (!vehicle) return 0
    return vehicle.principle_amount
  }

  const getDuration = () => {
    if (!vehicle) return { months: 0, days: 0 }
    
    const startDate = new Date(vehicle.date_of_lending)
    const endDate = vehicle.is_closed && vehicle.closure_date 
      ? new Date(vehicle.closure_date) 
      : new Date()
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const months = Math.floor(diffDays / 30)
    const days = diffDays % 30
    
    return { months, days }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h2>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout title={vehicle.vehicle_name}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/vehicles')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Vehicles
          </button>
          <button
            onClick={() => {
              fetchVehicleDetails()
              fetchPayments()
            }}
            className="flex items-center text-blue-600 hover:text-blue-900"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          !vehicle.is_closed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {!vehicle.is_closed ? 'Active' : 'Closed'}
        </span>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vehicle Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Details */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Lent To</p>
                    <p className="font-medium text-gray-900">{vehicle.lend_to}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Principle Amount</p>
                    <p className="font-medium text-gray-900">{formatCurrency(vehicle.principle_amount)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                    <p className="font-medium text-gray-900">{formatCurrency(vehicle.rent)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Lending</p>
                    <p className="font-medium text-gray-900">{formatDate(vehicle.date_of_lending)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">
                      {(() => {
                        const duration = getDuration()
                        return `${duration.months} month${duration.months !== 1 ? 's' : ''} ${duration.days} day${duration.days !== 1 ? 's' : ''}`
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment Summary</h2>
                {!vehicle.is_closed && (
                  <button
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Total Paid</p>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(getTotalPaid())}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600">Principle Amount</p>
                  <p className="text-xl font-bold text-orange-900">{formatCurrency(getPrincipleAmount())}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Profit</p>
                  <p className="text-xl font-bold text-green-900">
                    {vehicle.principle_amount > 0 
                      ? Math.round((getTotalPaid() / vehicle.principle_amount) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              {/* Payment Form */}
              {showPaymentForm && (
                <form onSubmit={handlePaymentSubmit} className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Amount
                      </label>
                      <input
                        type="text"
                        value={displayAmount}
                        onChange={handleAmountChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Payment notes"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary">
                      Record Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Payment History */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
                {vehicle.is_closed && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Vehicle Closed
                  </span>
                )}
              </div>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payments recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 capitalize">{payment.payment_type}</p>
                        </div>
                      </div>
                      {payment.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-gray-600">Notes:</span> {payment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push(`/vehicles?edit=${vehicle.id}`)}
                  className="w-full btn-primary text-left opacity-75 hover:opacity-100 transition-opacity"
                >
                  Edit Vehicle Details
                </button>
                
                {!vehicle.is_closed && (
                  <button 
                    onClick={() => setShowCloseConfirm(true)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-left opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Close Vehicle
                  </button>
                )}
                
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-left opacity-75 hover:opacity-100 transition-opacity"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>

            {/* Vehicle Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    !vehicle.is_closed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {!vehicle.is_closed ? 'Active' : 'Closed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(vehicle.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{formatDate(vehicle.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Duration Card */}
            <div className="card bg-blue-50 border border-blue-200">
              <div className="text-center py-4">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-800">Duration</h3>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {(() => {
                    const duration = getDuration()
                    return `${duration.months} month${duration.months !== 1 ? 's' : ''} ${duration.days} day${duration.days !== 1 ? 's' : ''}`
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Confirmation Modal */}
        {showCloseConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Close Vehicle</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to close this vehicle? This action will mark the vehicle as closed and cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseVehicle}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Close Vehicle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Vehicle</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this vehicle? This action cannot be undone and will permanently remove the vehicle and all its data.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVehicle}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        )}
    </Layout>
  )
}
