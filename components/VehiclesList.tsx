'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Eye, Car, Calendar, User, DollarSign, Clock, AlertCircle, Trash2 } from 'lucide-react'
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/v1/vehicles')
      setVehicles(response.data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseVehicle = async (vehicleId: number) => {
    try {
      await api.post(`/api/v1/vehicles/${vehicleId}/close`)
      fetchVehicles() // Refresh the list
    } catch (error) {
      console.error('Error closing vehicle:', error)
    }
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await api.delete(`/api/v1/vehicles/${vehicleId}`)
        fetchVehicles() // Refresh the list
      } catch (error) {
        console.error('Error deleting vehicle:', error)
      }
    }
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    fetchVehicles() // Refresh the list
    setEditingVehicle(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingVehicle(null)
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
        <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Vehicle
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{vehicle.vehicle_name}</h3>
                <p className="text-sm text-gray-600 capitalize">{vehicle.payment_frequency}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                vehicle.is_closed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {vehicle.is_closed ? 'Closed' : 'Active'}
              </span>
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
              
              {/* Extended Days Display */}
              {!vehicle.is_closed && vehicle.extended_days !== undefined && vehicle.extended_days > 0 && (
                <div className="flex items-center gap-2 text-sm bg-yellow-50 p-2 rounded-md">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">
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
            </div>

            <div className="flex gap-2 mt-4">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex-1 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View
              </button>
              {!vehicle.is_closed && (
                <button 
                  onClick={() => handleEditVehicle(vehicle)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex-1 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
              {!vehicle.is_closed && (
                <button 
                  onClick={() => handleCloseVehicle(vehicle.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex-1 flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Close
                </button>
              )}
              <button 
                onClick={() => handleDeleteVehicle(vehicle.id)}
                className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex-1 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
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
