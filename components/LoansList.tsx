'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Eye, DollarSign, Calendar, Building, User } from 'lucide-react'
import { api } from '../lib/api'

interface Loan {
  id: number
  lender_name: string
  lender_type: string
  principle_amount: number
  interest_rate: number
  payment_frequency: string
  date_of_borrowing: string
  is_closed: boolean
  closure_date?: string
  created_at: string
}

export default function LoansList() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchLoans()
  }, [])

  // Refresh data when window regains focus (e.g., returning from other pages)
  useEffect(() => {
    const handleFocus = () => {
      fetchLoans()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchLoans = async () => {
    try {
      const response = await api.get('/api/v1/loans')
      setLoans(response.data)
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setLoading(false)
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Loan Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Loan
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => (
          <div key={loan.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{loan.lender_name}</h3>
                <p className="text-sm text-gray-600 capitalize">{loan.lender_type}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                loan.is_closed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {loan.is_closed ? 'Closed' : 'Active'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-medium">₹{loan.principle_amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(loan.date_of_borrowing).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="capitalize">{loan.lender_type}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Interest Rate: </span>
                <span className="font-medium">{loan.interest_rate}%</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Payment Frequency: </span>
                <span className="font-medium capitalize">{loan.payment_frequency}</span>
              </div>
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

      {loans.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No loan records</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new loan record.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Loan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
