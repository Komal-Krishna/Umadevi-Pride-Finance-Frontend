'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Lock,
  DollarSign, 
  Calendar, 
  Building, 
  Percent, 
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  RefreshCw,
  TrendingUp
} from 'lucide-react'
import { api } from '../../../lib/api'
import toast from 'react-hot-toast'
import Layout from '../../../components/Layout'
import LoanForm from '../../../components/LoanForm'

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
  updated_at?: string
  extended_days?: number
  total_payments: number
  pending_amount: number
}

interface Payment {
  id: number
  amount: number
  payment_type: string
  payment_date: string
  description?: string
  created_at: string
}

export default function LoanDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const loanId = params.id as string
  
  const [loan, setLoan] = useState<Loan | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    description: ''
  })

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails()
      fetchPayments()
    }
  }, [loanId])

  const fetchLoanDetails = async () => {
    try {
      setError(null)
      const response = await api.get(`/api/v1/loans/${loanId}`)
      setLoan(response.data)
    } catch (error: any) {
      console.error('Error fetching loan details:', error)
      setError('Failed to fetch loan details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await api.get(`/api/v1/loans/${loanId}/payments`)
      setPayments(response.data)
    } catch (error: any) {
      console.error('Error fetching payments:', error)
    }
  }

  const handleEditSuccess = () => {
    fetchLoanDetails()
    setShowEditForm(false)
  }

  const handleCloseLoan = async () => {
    if (!loan) return
    try {
      await api.post(`/api/v1/loans/${loan.id}/close`)
      toast.success('Loan closed successfully!')
      setShowCloseConfirm(false)
      fetchLoanDetails()
    } catch (error) {
      toast.error('Failed to close loan')
    }
  }

  const handleDeleteLoan = async () => {
    if (!loan) return
    try {
      await api.delete(`/api/v1/loans/${loan.id}`)
      toast.success('Loan deleted successfully!')
      setShowDeleteConfirm(false)
      router.push('/loans')
    } catch (error) {
      toast.error('Failed to delete loan')
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
      const lastThree = integerPart.slice(-3)
      const remaining = integerPart.slice(0, -3)
      const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
      integerPart = formattedRemaining + ',' + lastThree
    }
    
    return integerPart + (decimalPart ? '.' + decimalPart : '')
  }

  // Function to parse Indian formatted number back to float
  const parseIndianNumber = (value: string): number => {
    const cleanValue = value.replace(/,/g, '')
    return parseFloat(cleanValue) || 0
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateInterestAmount = () => {
    if (!loan) return 0
    
    const principleAmount = loan.principle_amount
    const interestRate = loan.interest_rate / 100
    
    let interestAmount = 0
    switch (loan.payment_frequency) {
      case 'daily':
        interestAmount = (principleAmount * interestRate) / 365
        break
      case 'weekly':
        interestAmount = (principleAmount * interestRate) / 52
        break
      case 'monthly':
        interestAmount = (principleAmount * interestRate) / 12
        break
      case 'quarterly':
        interestAmount = (principleAmount * interestRate) / 4
        break
      case 'yearly':
        interestAmount = principleAmount * interestRate
        break
      default:
        interestAmount = (principleAmount * interestRate) / 12
    }
    
    return Math.round(interestAmount)
  }

  const calculatePerDayAmount = () => {
    if (!loan) return 0
    
    const interestAmount = calculateInterestAmount()
    
    switch (loan.payment_frequency) {
      case 'daily':
        return interestAmount
      case 'weekly':
        return interestAmount / 7
      case 'monthly':
        return interestAmount / 30
      case 'quarterly':
        return interestAmount / 90
      case 'yearly':
        return interestAmount / 365
      default:
        return interestAmount / 30
    }
  }

  const getDaysPassedThisMonth = () => {
    if (!loan) return 0
    
    const startDate = new Date(loan.date_of_borrowing)
    const endDate = loan.is_closed && loan.closure_date 
      ? new Date(loan.closure_date) 
      : new Date()
    
    // Calculate months difference
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                 (endDate.getMonth() - startDate.getMonth())
    
    let days = 0
    
    if (endDate.getDate() < startDate.getDate()) {
      // Case 1: Present day < lending day (e.g., 5 < 17)
      // Subtract 1 month and calculate days from previous month's anniversary
      months--
      
      // Calculate days from previous month's anniversary to present date
      const prevAnniversary = new Date(endDate.getFullYear(), endDate.getMonth() - 1, startDate.getDate())
      const diffTime = endDate.getTime() - prevAnniversary.getTime()
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } else {
      // Case 2: Present day >= lending day (e.g., 19 >= 17)
      // Just calculate days from current month's anniversary
      days = endDate.getDate() - startDate.getDate()
    }
    
    return Math.max(0, days)
  }

  const calculateInterestTillDate = () => {
    if (!loan) return 0
    
    const perDayAmount = calculatePerDayAmount()
    const daysPassed = getDaysPassedThisMonth()
    return perDayAmount * daysPassed
  }

  const getDuration = () => {
    if (!loan) return { months: 0, days: 0 }
    
    const startDate = new Date(loan.date_of_borrowing)
    const endDate = loan.is_closed && loan.closure_date 
      ? new Date(loan.closure_date) 
      : new Date()
    
    // Calculate months difference
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                 (endDate.getMonth() - startDate.getMonth())
    
    let days = 0
    
    if (endDate.getDate() < startDate.getDate()) {
      // Case 1: Present day < lending day (e.g., 5 < 17)
      // Subtract 1 month and calculate days from previous month's anniversary
      months--
      
      // Calculate days from previous month's anniversary to present date
      const prevAnniversary = new Date(endDate.getFullYear(), endDate.getMonth() - 1, startDate.getDate())
      const diffTime = endDate.getTime() - prevAnniversary.getTime()
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } else {
      // Case 2: Present day >= lending day (e.g., 19 >= 17)
      // Just calculate days from current month's anniversary
      days = endDate.getDate() - startDate.getDate()
    }
    
    return { months: Math.max(0, months), days: Math.max(0, days) }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseIndianNumber(newPayment.amount)
    if (!newPayment.amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      const paymentData = {
        amount: amount,
        payment_type: 'debit', // Always debit for loans
        payment_date: newPayment.payment_date,
        description: newPayment.description || '',
        payment_status: 'PAID', // Set payment status as PAID for loan payments
        source_type: 'loan' // Required field for loan payments
      }

      await api.post(`/api/v1/loans/${loanId}/payments`, paymentData)
      toast.success('Payment added successfully!')
      
      setNewPayment({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        description: ''
      })
      
      setShowPaymentForm(false)
      fetchLoanDetails()
      fetchPayments()
    } catch (error: any) {
      console.error('Error adding payment:', error)
      
      // Handle different error response formats
      let errorMessage = 'Failed to add payment'
      
      if (error.response?.data) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors array
          errorMessage = error.response.data.detail.map((err: any) => err.msg || err.message || 'Validation error').join(', ')
        } else if (error.response.data.detail && typeof error.response.data.detail === 'object') {
          // Handle single validation error object
          errorMessage = error.response.data.detail.msg || error.response.data.detail.message || 'Validation error'
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        }
      }
      
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error || !loan) {
    return (
      <Layout title="Loan Details">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error || 'Loan not found'}</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/loans')}
              className="btn-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Loans
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={loan.lender_name}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/loans')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Loans
          </button>
          <button
            onClick={() => {
              fetchLoanDetails()
              fetchPayments()
            }}
            className="flex items-center text-blue-600 hover:text-blue-900"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          !loan.is_closed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {!loan.is_closed ? 'Active' : 'Closed'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Loan Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Lender Name</p>
                  <p className="font-medium text-gray-900">{loan.lender_name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Principle Amount</p>
                  <p className="font-medium text-gray-900">{formatCurrency(loan.principle_amount)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Percent className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Interest Rate</p>
                  <p className="font-medium text-gray-900">
                    {loan.interest_rate}% p.a. (₹{loan.interest_rate_indian})
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Date of Borrowing</p>
                  <p className="font-medium text-gray-900">{formatDate(loan.date_of_borrowing)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">
                    {getDuration().months} months {getDuration().days} days
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Lender Type</p>
                  <p className="font-medium text-gray-900 capitalize">{loan.lender_type}</p>
                </div>
              </div>
            </div>

            {/* Interest Amounts - Side by Side */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Interest */}
              <div className="flex items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Interest Amount ({loan.payment_frequency})</p>
                  <p className="text-lg font-bold text-blue-800">{formatCurrency(calculateInterestAmount())}</p>
                </div>
              </div>
              
              {/* Interest Till Date */}
              <div className="flex items-center bg-green-50 p-3 rounded-lg border border-green-200">
                <Calendar className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Interest till today</p>
                  <p className="text-lg font-bold text-green-800">{formatCurrency(calculateInterestTillDate())}</p>
                  <p className="text-xs text-green-600">
                    {getDaysPassedThisMonth()} days × {formatCurrency(calculatePerDayAmount())}/day
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payment Summary</h2>
              {!loan.is_closed && (
                <button
                  onClick={() => {
                    const monthlyInterest = calculateInterestAmount()
                    setNewPayment(prev => ({
                      ...prev,
                      amount: formatIndianNumber(monthlyInterest.toString())
                    }))
                    setShowPaymentForm(!showPaymentForm)
                  }}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total Paid</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(loan.total_payments)}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600">Principle Amount</p>
                <p className="text-xl font-bold text-orange-900">{formatCurrency(loan.principle_amount)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Profit</p>
                <p className="text-xl font-bold text-green-900">
                  {loan.principle_amount > 0 
                    ? Math.round((loan.total_payments / loan.principle_amount) * 100)
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
                      value={newPayment.amount}
                      onChange={(e) => {
                        const formatted = formatIndianNumber(e.target.value)
                        setNewPayment(prev => ({ ...prev, amount: formatted }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                      value={newPayment.payment_date}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, payment_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
              {loan.is_closed && (
                <span className="text-sm text-gray-500">Loan Closed</span>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Payment records will appear here once added.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full mr-3 bg-red-100 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Payment Made
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                        {payment.description && (
                          <p className="text-xs text-gray-600">{payment.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-red-600">
                      <p className="font-medium">
                        -{formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowEditForm(true)}
                className="w-full btn-primary text-left opacity-75 hover:opacity-100 transition-opacity"
                disabled={loan.is_closed}
              >
                Edit Loan Details
              </button>
              
              {!loan.is_closed && (
                <button 
                  onClick={() => setShowCloseConfirm(true)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-left opacity-75 hover:opacity-100 transition-opacity"
                >
                  Close Loan
                </button>
              )}
              
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-left opacity-75 hover:opacity-100 transition-opacity"
              >
                Delete Loan
              </button>
            </div>
          </div>

          {/* Status Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-sm font-medium ${
                  !loan.is_closed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {!loan.is_closed ? 'Active' : 'Closed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm text-gray-900">
                  {formatDate(loan.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">
                  {loan.updated_at ? formatDate(loan.updated_at) : 'Invalid Date'}
                </span>
              </div>
              {loan.is_closed && loan.closure_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Closed On</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(loan.closure_date)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="card">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-blue-600">Duration</h2>
            </div>
            <p className="text-2xl font-bold text-blue-800">
              {getDuration().months} months {getDuration().days} days
            </p>
          </div>

          {/* Back to Loans */}
          <div className="card">
            <button
              onClick={() => router.push('/loans')}
              className="w-full btn-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Loans
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <LoanForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleEditSuccess}
        editData={loan}
      />


      {/* Close Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Close Loan</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to close this loan? This action will mark the loan as closed and cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseLoan}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Close Loan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Loan</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this loan? This action cannot be undone and will permanently remove the loan and all its data.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLoan}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Loan
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}