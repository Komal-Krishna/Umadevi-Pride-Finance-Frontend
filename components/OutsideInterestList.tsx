'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Eye, DollarSign, Calendar, User, Percent, Trash2, Lock, MoreVertical } from 'lucide-react'
import { api } from '../lib/api'
import OutsideInterestForm from './OutsideInterestForm'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface OutsideInterest {
  id: number
  to_whom: string
  category: string
  principle_amount: number
  interest_rate_percentage: number
  interest_rate_indian: number
  payment_frequency: string
  date_of_lending: string
  lend_to: string
  is_closed: boolean
  closure_date?: string
  created_at: string
}

export default function OutsideInterestList() {
  const router = useRouter()
  const [interests, setInterests] = useState<OutsideInterest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingInterest, setEditingInterest] = useState<OutsideInterest | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [selectedInterest, setSelectedInterest] = useState<OutsideInterest | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [closing, setClosing] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  useEffect(() => {
    fetchInterests()
  }, [])

  // Refresh data when window regains focus (e.g., returning from other pages)
  useEffect(() => {
    const handleFocus = () => {
      fetchInterests()
    }

    // Only add event listener in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      return () => window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const fetchInterests = async () => {
    try {
      const response = await api.get('/api/v1/outside_interest')
      setInterests(response.data)
    } catch (error) {
      console.error('Error fetching interests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedInterest) return
    
    try {
      setDeleting(true)
      await api.delete(`/api/v1/outside_interest/${selectedInterest.id}`)
      toast.success('Interest record deleted successfully!')
      fetchInterests()
    } catch (error: any) {
      console.error('Error deleting interest:', error)
      toast.error('Failed to delete interest record')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
      setSelectedInterest(null)
    }
  }

  const handleClose = async () => {
    if (!selectedInterest) return
    
    try {
      setClosing(true)
      await api.post(`/api/v1/outside_interest/${selectedInterest.id}/close`)
      toast.success('Interest record closed successfully!')
      fetchInterests()
    } catch (error: any) {
      console.error('Error closing interest:', error)
      toast.error('Failed to close interest record')
    } finally {
      setClosing(false)
      setShowCloseModal(false)
      setSelectedInterest(null)
    }
  }

  const toggleDropdown = (interestId: number) => {
    setOpenDropdown(openDropdown === interestId ? null : interestId)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
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
          <div 
            key={interest.id} 
            className="card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/outside_interest/${interest.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{interest.to_whom}</h3>
                <p className="text-sm text-gray-600">{interest.category}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown(interest.id)
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                
                <span className={`px-2 py-1 text-xs rounded-full ${
                  interest.is_closed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {interest.is_closed ? 'Closed' : 'Active'}
                </span>
                
                {/* Dropdown Options */}
                {openDropdown === interest.id && (
                  <div className="absolute top-0 right-0 mt-8 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10" onClick={(e) => e.stopPropagation()}>
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingInterest(interest)
                          closeDropdown()
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      {!interest.is_closed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedInterest(interest)
                            setShowCloseModal(true)
                            closeDropdown()
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Close
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedInterest(interest)
                          setShowDeleteModal(true)
                          closeDropdown()
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-medium">₹{interest.principle_amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Percent className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{interest.interest_rate_percentage}% p.a.</span>
                <span className="text-gray-500 ml-1">(₹{interest.interest_rate_indian})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(interest.date_of_lending).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span>{interest.lend_to}</span>
              </div>
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

      {/* Form Modal */}
      {showForm && (
        <OutsideInterestForm
          onClose={() => {
            setShowForm(false)
            setEditingInterest(null)
          }}
          onSuccess={() => {
            fetchInterests()
            setShowForm(false)
            setEditingInterest(null)
          }}
          editData={editingInterest}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Interest Record</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this interest record? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex-1"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Close Interest Record</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to close this interest record? It will be marked as completed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="btn-secondary flex-1"
                disabled={closing}
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                className="btn-primary flex-1"
                disabled={closing}
              >
                {closing ? 'Closing...' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
