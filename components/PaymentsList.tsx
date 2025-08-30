'use client'

import { useState, useEffect } from 'react'
import { Plus, Eye, Edit, CreditCard, Calendar, DollarSign } from 'lucide-react'
import { api } from '../lib/api'

interface Payment {
  id: number
  source_type: string
  source_id?: number
  payment_type: string
  payment_date: string
  amount: number
  description?: string
  payment_status: string
  created_at: string
}

export default function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await api.get('/api/v1/payments')
      setPayments(response.data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentTypeColor = (type: string) => {
    return type === 'credit' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Payment
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {payments.map((payment) => (
          <div key={payment.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">#{payment.id}</span>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getPaymentTypeColor(payment.payment_type)}`}>
                  {payment.payment_type === 'credit' ? 'Credit' : 'Debit'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.payment_status)}`}>
                  {payment.payment_status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Source: </span>
                <span className="font-medium capitalize">{payment.source_type}</span>
                {payment.source_id && (
                  <span className="text-gray-500"> #{payment.source_id}</span>
                )}
              </div>
              {payment.description && (
                <p className="text-sm text-gray-600">{payment.description}</p>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {payments.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payment records</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new payment record.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Payment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
