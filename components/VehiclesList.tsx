'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Edit, Eye, Car, Calendar, User, DollarSign, Clock, AlertCircle, Trash2, MoreVertical, Search, Filter, ArrowUpDown, RefreshCw } from 'lucide-react'
import { api } from '../lib/api'
import VehicleForm from './VehicleForm'

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
  extended_days?: number
  total_payments: number
  pending_amount: number
}

export default function VehiclesList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  
  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'date' | 'status'>('status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchVehicles()
  }, [])

  // Refresh data when window regains focus (e.g., returning from other pages)
  useEffect(() => {
    let lastRefresh = 0
    const REFRESH_THROTTLE = 5000 // 5 seconds minimum between refreshes

    const handleFocus = () => {
      const now = Date.now()
      if (now - lastRefresh > REFRESH_THROTTLE) {
        fetchVehicles()
        lastRefresh = now
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now()
        if (now - lastRefresh > REFRESH_THROTTLE) {
          fetchVehicles()
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
      const vehicleToEdit = vehicles.find(v => v.id === parseInt(editId))
      if (vehicleToEdit) {
        setEditingVehicle(vehicleToEdit)
        setShowForm(true)
        // Remove the edit parameter from URL
        router.replace('/vehicles')
      }
    }
  }, [searchParams, vehicles, router])

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

  const fetchVehicles = async () => {
    try {
      setError(null)
      const response = await api.get('/api/v1/vehicles/getAll')
      setVehicles(response.data)
    } catch (error: any) {
      // Set user-friendly error message
      if (error.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check your internet connection and ensure the backend is running.')
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.')
      } else {
        setError(`Failed to load vehicles: ${error.response?.data?.detail || error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCloseVehicle = async (vehicleId: number) => {
    try {
      await api.post(`/api/v1/vehicles/close/${vehicleId}`)
      fetchVehicles() // Refresh the list
    } catch (error) {
      console.error('Error closing vehicle:', error)
    }
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await api.delete(`/api/v1/vehicles/delete/${vehicleId}`)
        fetchVehicles() // Refresh the list
      } catch (error) {
        console.error('Error deleting vehicle:', error)
      }
    }
  }

  // Filter and sort vehicles
  const getFilteredAndSortedVehicles = () => {
    let filtered = vehicles.filter(vehicle => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        vehicle.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.lend_to.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !vehicle.is_closed) ||
        (statusFilter === 'closed' && vehicle.is_closed)
      
      return matchesSearch && matchesStatus
    })

    // Sort vehicles
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.vehicle_name.localeCompare(b.vehicle_name)
          break
        case 'amount':
          comparison = a.principle_amount - b.principle_amount
          break
        case 'date':
          comparison = new Date(a.date_of_lending).getTime() - new Date(b.date_of_lending).getTime()
          break
        case 'status':
          // Active vehicles first, then closed vehicles
          if (a.is_closed !== b.is_closed) {
            comparison = a.is_closed ? 1 : -1
          } else {
            // If same status, sort by name
            comparison = a.vehicle_name.localeCompare(b.vehicle_name)
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

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    // Small delay to ensure the backend has processed the request
    setTimeout(() => {
      fetchVehicles() // Refresh the list
    }, 100)
    setEditingVehicle(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingVehicle(null)
  }

  const toggleDropdown = (vehicleId: number) => {
    setOpenDropdown(openDropdown === vehicleId ? null : vehicleId)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  const handleVehicleClick = (vehicleId: number) => {
    router.push(`/vehicle/${vehicleId}`)
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
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchVehicles()}
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
              Add New Vehicle
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
            onClick={() => fetchVehicles()}
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
        <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchVehicles()}
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
            Add New Vehicle
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
                placeholder="Search by vehicle name or borrower..."
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
              <option value="all">All Vehicles</option>
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
        {getFilteredAndSortedVehicles().map((vehicle) => (
          <div key={vehicle.id} className="card relative cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleVehicleClick(vehicle.id)}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{vehicle.vehicle_name}</h3>
                <p className="text-sm text-gray-600 capitalize">{vehicle.payment_frequency}</p>
              </div>
              <div className="flex flex-col items-end gap-2 dropdown-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown(vehicle.id)
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                
                <span className={`px-2 py-1 text-xs rounded-full ${
                  vehicle.is_closed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {vehicle.is_closed ? 'Closed' : 'Active'}
                </span>
                
                {/* Dropdown Options */}
                {openDropdown === vehicle.id && (
                  <div className="absolute top-0 right-0 mt-8 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10" onClick={(e) => e.stopPropagation()}>
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditVehicle(vehicle)
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
                          handleDeleteVehicle(vehicle.id)
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
                <span className="font-medium">₹{vehicle.principle_amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Rent: </span>
                <span className="font-medium">₹{vehicle.rent.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Lending Date: </span>
                <span>{new Date(vehicle.date_of_lending).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Lent to: </span>
                <span className="font-medium">{vehicle.lend_to}</span>
              </div>
              
              {/* Extended Days Display - Only show when closed */}
              {vehicle.is_closed && vehicle.extended_days !== undefined && vehicle.extended_days > 0 && (
                <div className="flex items-center gap-2 text-sm bg-orange-50 p-2 rounded-md">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-800 font-medium">
                    Extended: {vehicle.extended_days} days
                  </span>
                </div>
              )}

              {/* Payment Information */}
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Total Payments: </span>
                  <span className="font-medium text-green-600">₹{vehicle.total_payments.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">Pending Amount: </span>
                  <span className="font-medium text-red-600">₹{vehicle.pending_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Close Vehicle Button - Only show if not closed */}
              {!vehicle.is_closed && (
                <div className="mt-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCloseVehicle(vehicle.id)
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Close Vehicle
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {getFilteredAndSortedVehicles().length === 0 && (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          {vehicles.length === 0 ? (
            <>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicle records</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new vehicle record.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Vehicle
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
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

      {/* Vehicle Form Modal */}
      <VehicleForm
        isOpen={showForm}
        onClose={handleCloseForm}
        vehicle={editingVehicle}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
