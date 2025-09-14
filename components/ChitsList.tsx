'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw, Users, Calendar, DollarSign, TrendingUp, Percent, CreditCard, ArrowRight } from 'lucide-react'
import { api } from '../lib/api'
import ChitForm from './ChitForm'
import ChitPaymentForm from './ChitPaymentForm'

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
  payments_count: number
  net_profit: number
  net_profit_percentage: number
}

export default function ChitsList() {
  const [chits, setChits] = useState<Chit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchChits()
  }, [])

  const fetchChits = async () => {
    try {
      const response = await api.get('/api/v1/chits')
      setChits(response.data)
    } catch (error) {
      console.error('Error fetching chits:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (isClosedStatus: boolean) => {
    return isClosedStatus 
      ? 'bg-gray-100 text-gray-800' 
      : 'bg-green-100 text-green-800'
  }

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600'
    if (profit < 0) return 'text-red-600'
    return 'text-gray-600'
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Chit Management</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchChits()}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowPaymentForm(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Add Payment
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Chit
          </button>
        </div>
      </div>


      {/* Chits Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chits.map((chit) => (
          <div 
            key={chit.id} 
            className={`card hover:shadow-lg transition-shadow cursor-pointer ${chit.is_collected ? 'bg-green-50 border-green-200' : ''}`}
            onClick={() => router.push(`/chit/${chit.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {chit.chit_name}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>To: {chit.to_whom}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(chit.is_closed)}`}>
                  {chit.is_closed ? 'Closed' : 'Active'}
                </span>
                {chit.is_collected && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Collected
                  </span>
                )}
              </div>
            </div>

            {/* Chit Details */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Total Amount:</span>
                </div>
                <span className="font-semibold">₹{chit.total_amount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Monthly:</span>
                </div>
                <span className="font-semibold">₹{chit.monthly_amount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="font-semibold">{chit.duration_months} months</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Start Date:</span>
                <span className="font-semibold">{new Date(chit.start_date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Profit Information */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Total Profit:</span>
                <span className={`font-bold ${getProfitColor(chit.total_profit)}`}>
                  ₹{chit.total_profit.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Profit %:</span>
                <span className={`font-bold ${getProfitColor(chit.total_profit)}`}>
                  {chit.profit_percentage.toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Received:</span>
                <span className="font-medium">₹{chit.total_payments.toLocaleString()}</span>
              </div>
            </div>

            {/* Collected Analysis - Only show if chit is collected */}
            {chit.is_collected && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xs font-medium text-green-800 mb-2">Collected Analysis</div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Amount Received:</span>
                    <span className="font-medium text-green-600">₹{chit.collected_amount?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Net Profit:</span>
                    <span className={`font-bold ${chit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{chit.net_profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Net Profit %:</span>
                    <span className={`font-bold ${chit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {chit.net_profit_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Empty State */}
      {chits.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No chit records</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first chit fund.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Chit
            </button>
          </div>
        </div>
      )}

      {/* Chit Form Modal */}
      {showForm && (
        <ChitForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchChits()
            setShowForm(false)
          }}
        />
      )}

      {/* Chit Payment Form Modal */}
      {showPaymentForm && (
        <ChitPaymentForm
          onClose={() => setShowPaymentForm(false)}
          onSuccess={() => {
            fetchChits()
            setShowPaymentForm(false)
          }}
        />
      )}
    </div>
  )
}
