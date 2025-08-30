'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Eye, DollarSign, Calendar, User } from 'lucide-react'
import { api } from '../lib/api'

interface OutsideInterest {
  id: number
  to_whom: string
  category: string
  principle_amount: number
  interest_rate: number
  payment_frequency: string
  date_of_lending: string
  lend_to: string
  is_closed: boolean
  closure_date?: string
  created_at: string
}

export default function OutsideInterestList() {
  const [interests, setInterests] = useState<OutsideInterest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchInterests()
  }, [])

  const fetchInterests = async () => {
    try {
      const response = await api.get('/api/v1/outside-interest')
      setInterests(response.data)
    } catch (error) {
      console.error('Error fetching interests:', error)
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
        <h2 className="text-2xl font-bold text-gray-900">Outside Interest Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Interest
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {interests.map((interest) => (
          <div key={interest.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{interest.to_whom}</h3>
                <p className="text-sm text-gray-600">{interest.category}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                interest.is_closed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {interest.is_closed ? 'Closed' : 'Active'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-medium">₹{interest.principle_amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(interest.date_of_lending).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span>{interest.lend_to}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Interest Rate: </span>
                <span className="font-medium">{interest.interest_rate}%</span>
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

      {interests.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No outside interest records</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new record.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Interest
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
