'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Eye, DollarSign, Calendar, User, Percent, Trash2, Lock, MoreVertical, Search, Filter, ArrowUpDown, RefreshCw, Building } from 'lucide-react'
import { api } from '../lib/api'
import LoanForm from './LoanForm'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

interface Loan {
  id: number
  lender_name: string
  lender_type: string
  principle_amount: number
  interest_rate: number
  interest_rate_indian: number
  payment_frequency: string
  date_of_borrowing: string
  is_closed: boolean
  closure_date?: string
  created_at: string
  extended_days?: number
  total_payments: number
  pending_amount: number
}

export default function LoansList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [closing, setClosing] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  
  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'date' | 'status'>('status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchLoans()
  }, [])

  // Refresh data when window regains focus (e.g., returning from other pages)
  useEffect(() => {
    let lastRefresh = 0
    const REFRESH_THROTTLE = 5000 // 5 seconds minimum between refreshes

    const handleFocus = () => {
      const now = Date.now()
      if (now - lastRefresh > REFRESH_THROTTLE) {
        fetchLoans()
        lastRefresh = now
      }
    }

    // Only add event listener in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      return () => window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Handle edit URL parameter
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && loans.length > 0 && !showForm) {
      const loanToEdit = loans.find(loan => loan.id === parseInt(editId))
      if (loanToEdit) {
        setEditingLoan(loanToEdit)
        setShowForm(true)
      }
    }
  }, [searchParams, loans])

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

  const fetchLoans = async () => {
    try {
      setError(null)
      const response = await api.get('/api/v1/loans')
      setLoans(response.data)
    } catch (error: any) {
      console.error('Error fetching loans:', error)
      setError('Failed to fetch loans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredAndSortedLoans = () => {
    let filtered = loans

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.lender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.lender_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => 
        statusFilter === 'active' ? !loan.is_closed : loan.is_closed
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      // Default sort: active first, then closed
      if (sortBy === 'status') {
        if (a.is_closed !== b.is_closed) {
          return a.is_closed ? 1 : -1
        }
      }

      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.lender_name.localeCompare(b.lender_name)
          break
        case 'amount':
          comparison = a.principle_amount - b.principle_amount
          break
        case 'date':
          comparison = new Date(a.date_of_borrowing).getTime() - new Date(b.date_of_borrowing).getTime()
          break
        case 'status':
          // Already handled above
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }

  const handleDelete = async () => {
    if (!selectedLoan) return
    
    try {
      setDeleting(true)
      await api.delete(`/api/v1/loans/${selectedLoan.id}`)
      toast.success('Loan record deleted successfully!')
      fetchLoans()
    } catch (error: any) {
      console.error('Error deleting loan:', error)
      toast.error('Failed to delete loan record')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
      setSelectedLoan(null)
    }
  }

  const handleCloseLoan = async (loanId: number) => {
    try {
      await api.post(`/api/v1/loans/${loanId}/close`)
      toast.success('Loan record closed successfully!')
      fetchLoans()
    } catch (error: any) {
      console.error('Error closing loan:', error)
      toast.error('Failed to close loan record')
    }
  }

  const handleClose = async () => {
    if (!selectedLoan) return
    
    try {
      setClosing(true)
      await api.post(`/api/v1/loans/${selectedLoan.id}/close`)
      toast.success('Loan record closed successfully!')
      fetchLoans()
    } catch (error: any) {
      console.error('Error closing loan:', error)
      toast.error('Failed to close loan record')
    } finally {
      setClosing(false)
      setShowCloseModal(false)
      setSelectedLoan(null)
    }
  }

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    // Small delay to ensure the backend has processed the request
    setTimeout(() => {
      fetchLoans() // Refresh the list
    }, 100)
    setEditingLoan(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingLoan(null)
    // Clear the edit parameter from URL to prevent form from reopening
    const url = new URL(window.location.href)
    url.searchParams.delete('edit')
    window.history.replaceState({}, '', url.toString())
  }

  const toggleDropdown = (loanId: number) => {
    setOpenDropdown(openDropdown === loanId ? null : loanId)
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
        <h2 className="text-2xl font-bold text-gray-900">Loans Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Loan
        </button>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search loans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'closed')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'amount' | 'date' | 'status')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="status">Status</option>
            <option value="name">Name</option>
            <option value="amount">Amount</option>
            <option value="date">Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            <ArrowUpDown className={`w-4 h-4 ${sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchLoans}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {getFilteredAndSortedLoans().map((loan) => (
          <div 
            key={loan.id} 
            className="card relative cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/loans/${loan.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{loan.lender_name}</h3>
                <p className="text-sm text-gray-600 capitalize">{loan.lender_type}</p>
              </div>
              <div className="flex flex-col items-end gap-2 dropdown-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown(loan.id)
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                
                <span className={`px-2 py-1 text-xs rounded-full ${
                  loan.is_closed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {loan.is_closed ? 'Closed' : 'Active'}
                </span>
                
                {/* Dropdown Options */}
                {openDropdown === loan.id && (
                  <div className="absolute top-0 right-0 mt-8 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10" onClick={(e) => e.stopPropagation()}>
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditLoan(loan)
                          closeDropdown()
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      {!loan.is_closed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCloseLoan(loan.id)
                            closeDropdown()
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-100"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Close
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLoan(loan)
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
                <span className="font-medium">₹{loan.principle_amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Percent className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{loan.interest_rate}% p.a.</span>
                <span className="text-gray-500 ml-1">(₹{loan.interest_rate_indian})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(loan.date_of_borrowing).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="capitalize">{loan.payment_frequency}</span>
              </div>
              
              
              {/* Close Loan Button - Only show if not closed */}
              {!loan.is_closed && (
                <div className="mt-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCloseLoan(loan.id)
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Close Loan
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {getFilteredAndSortedLoans().length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {loans.length === 0 ? 'No loan records' : 'No loans match your search'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {loans.length === 0 ? 'Get started by creating a new record.' : 'Try adjusting your search or filter criteria.'}
          </p>
          {loans.length === 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Loan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <LoanForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        editData={editingLoan}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Loan Record</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this loan record? This action cannot be undone.
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
              <h3 className="text-lg font-semibold text-gray-900">Close Loan Record</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to close this loan record? It will be marked as completed.
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