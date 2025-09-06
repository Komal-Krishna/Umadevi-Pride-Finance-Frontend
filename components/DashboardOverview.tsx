'use client'

import { Car, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DashboardOverviewProps {
  summary: any
  loading: boolean
}

export default function DashboardOverview({ summary, loading }: DashboardOverviewProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to your finance management dashboard</p>
      </div>

      {/* Available Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700">Vehicles Management</p>
              <p className="text-lg font-bold text-primary-900 mt-1">Available Now</p>
            </div>
            <div className="p-3 rounded-full bg-primary-100">
              <Car className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-primary-600">Fully functional vehicle management system</p>
          </div>
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Outside Interest</p>
              <p className="text-lg font-bold text-gray-900 mt-1">Coming Soon</p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Track outside investments and performance</p>
          </div>
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Loans Management</p>
              <p className="text-lg font-bold text-gray-900 mt-1">Coming Soon</p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Manage loan activities and repayments</p>
          </div>
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Payments</p>
              <p className="text-lg font-bold text-gray-900 mt-1">Coming Soon</p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Monitor payment schedules and history</p>
          </div>
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Analytics</p>
              <p className="text-lg font-bold text-gray-900 mt-1">Coming Soon</p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Comprehensive analytics and insights</p>
          </div>
        </div>

        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Chit Management</p>
              <p className="text-lg font-bold text-gray-900 mt-1">Coming Soon</p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Manage chit fund activities</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left">
              + Add New Vehicle
            </button>
            <button className="w-full btn-secondary text-left opacity-50 cursor-not-allowed">
              + Add Outside Interest (Coming Soon)
            </button>
            <button className="w-full btn-secondary text-left opacity-50 cursor-not-allowed">
              + Record Payment (Coming Soon)
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vehicles Module</span>
              <CheckCircle className="h-5 w-5 text-success-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Outside Interest</span>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Loans</span>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payments</span>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Analytics</span>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Chit</span>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Getting Started</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-bold text-blue-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Start with Vehicles</p>
              <p className="text-xs text-blue-700">The vehicles module is fully functional. Add your first vehicle to get started.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-bold text-gray-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Explore Other Features</p>
              <p className="text-xs text-gray-700">Other modules are coming soon. Check back regularly for updates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
