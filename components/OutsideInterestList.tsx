'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Eye, DollarSign, Calendar, User, Percent, Trash2, Lock, MoreVertical, Search, Filter, ArrowUpDown, RefreshCw, AlertCircle, Clock } from 'lucide-react'
import { api } from '../lib/api'
import OutsideInterestForm from './OutsideInterestForm'
import { useRouter, useSearchParams } from 'next/navigation'
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
  extended_days?: number
  total_payments: number
  pending_amount: number
}

export default function OutsideInterestList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [interests, setInterests] = useState<OutsideInterest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingInterest, setEditingInterest] = useState<OutsideInterest | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [selectedInterest, setSelectedInterest] = useState<OutsideInterest | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [closing, setClosing] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  
  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'date' | 'status'>('status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchInterests()
  }, [])

  // Refresh data when window regains focus (e.g., returning from other pages)
  useEffect(() => {
    let lastRefresh = 0
    const REFRESH_THROTTLE = 5000 // 5 seconds minimum between refreshes

    const handleFocus = () => {
      const now = Date.now()
      if (now - lastRefresh > REFRESH_THROTTLE) {
        fetchInterests()
        lastRefresh = now
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now()
        if (now - lastRefresh > REFRESH_THROTTLE) {
          fetchInterests()
          lastRefresh = now
        }
      }
    }

    // Only add event listeners in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      return () => {
        window.removeEventListener('focus', handleFocus)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [])

  useEffect(() => {
    // Check if there's an edit parameter in the URL
    const editId = searchParams.get('edit')
    if (editId) {
      const interestToEdit = interests.find(i => i.id === parseInt(editId))
      if (interestToEdit) {
        setEditingInterest(interestToEdit)
        setShowForm(true)
        // Remove the edit parameter from URL
        router.replace('/outside_interest')
      }
    }
  }, [searchParams, interests, router])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const target = event.target as Element
        if (!target.closest('.dropdown-container')) {
          closeDropdown()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const fetchInterests = async () => {
    try {
      setError(null)
      const response = await api.get('/api/v1/outside_interest/')
      setInterests(response.data)
    } catch (error: any) {
      // Set user-friendly error message
      if (error.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check your internet connection and ensure the backend is running.')
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.')
      } else {
        setError(`Failed to load outside interest records: ${error.response?.data?.detail || error.message}`)
      }
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

  // Filter and sort interests
  const getFilteredAndSortedInterests = () => {
    let filtered = interests.filter(interest => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        interest.to_whom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interest.lend_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interest.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !interest.is_closed) ||
        (statusFilter === 'closed' && interest.is_closed)
      
      return matchesSearch && matchesStatus
    })

    // Sort interests
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.to_whom.localeCompare(b.to_whom)
          break
        case 'amount':
          comparison = a.principle_amount - b.principle_amount
          break
        case 'date':
          comparison = new Date(a.date_of_lending).getTime() - new Date(b.date_of_lending).getTime()
          break
        case 'status':
          // Active interests first, then closed interests
          if (a.is_closed !== b.is_closed) {
            comparison = a.is_closed ? 1 : -1
          } else {
            // If same status, sort by name
            comparison = a.to_whom.localeCompare(b.to_whom)
          }
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }

  const handleSortChange = (newSortBy: 'name' | 'amount' | 'date' | 'status') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }

  const handleEditInterest = (interest: OutsideInterest) => {
    setEditingInterest(interest)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    // Small delay to ensure the backend has processed the request
    setTimeout(() => {
      fetchInterests() // Refresh the list
    }, 100)
    setEditingInterest(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingInterest(null)
  }

  const handleInterestClick = (interestId: number) => {
    router.push(`/outside_interest/${interestId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Outside Interest Management</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchInterests()}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Interest
            </button>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Connection Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchInterests()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Outside Interest Management</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchInterests()}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Interest
          </button>
        </div>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, borrower, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'closed')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Interests</option>
              <option value="active">Active Only</option>
              <option value="closed">Closed Only</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                setSortBy(newSortBy as 'name' | 'amount' | 'date' | 'status')
                setSortOrder(newSortOrder as 'asc' | 'desc')
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="status-asc">Status (Active First)</option>
              <option value="status-desc">Status (Closed First)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="date-desc">Date (Newest First)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {getFilteredAndSortedInterests().map((interest) => (
          <div key={interest.id} className="card relative cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleInterestClick(interest.id)}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{interest.to_whom}</h3>
                <p className="text-sm text-gray-600 capitalize">{interest.category}</p>
              </div>
              <div className="flex flex-col items-end gap-2 dropdown-container">
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
                          handleEditInterest(interest)
                          closeDropdown()
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
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
                <span className="text-gray-600">Principle: </span>
                <span className="font-medium">₹{interest.principle_amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Percent className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Rate: </span>
                <span className="font-medium">{interest.interest_rate_percentage}% p.a.</span>
                <span className="text-gray-500 ml-1">(₹{interest.interest_rate_indian})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Lending Date: </span>
                <span>{new Date(interest.date_of_lending).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Lent to: </span>
                <span className="font-medium">{interest.lend_to}</span>
              </div>
              
              {/* Extended Days Display - Only show when closed */}
              {interest.is_closed && interest.extended_days !== undefined && interest.extended_days > 0 && (
                <div className="flex items-center gap-2 text-sm bg-orange-50 p-2 rounded-md">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-800 font-medium">
                    Extended: {interest.extended_days} days
                  </span>
                </div>
              )}

              {/* Payment Information */}
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Total Payments: </span>
                  <span className="font-medium text-green-600">₹{interest.total_payments.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">Pending Amount: </span>
                  <span className="font-medium text-red-600">₹{interest.pending_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Close Interest Button - Only show if not closed */}
              {!interest.is_closed && (
                <div className="mt-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedInterest(interest)
                      setShowCloseModal(true)
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Close Interest
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {getFilteredAndSortedInterests().length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          {interests.length === 0 ? (
            <>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No outside interest records</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new record.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Interest
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No interests found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setSortBy('status')
                    setSortOrder('asc')
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear Filters
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <OutsideInterestForm
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
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
