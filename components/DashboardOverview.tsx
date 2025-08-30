'use client'

import { Car, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
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

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Vehicles',
      value: summary.total_vehicles,
      change: summary.active_vehicles,
      changeLabel: 'Active',
      icon: Car,
      color: 'primary',
    },
    {
      title: 'Outside Interest',
      value: summary.total_outside_interest,
      change: summary.active_outside_interest,
      changeLabel: 'Active',
      icon: DollarSign,
      color: 'success',
    },
    {
      title: 'Monthly Payments',
      value: formatCurrency(summary.total_payments_this_month),
      change: summary.total_payments_this_month > 0 ? 'positive' : 'negative',
      changeLabel: 'This Month',
      icon: TrendingUp,
      color: 'warning',
    },
    {
      title: 'Total Principle',
      value: formatCurrency(summary.total_principle_amount),
      change: summary.pending_payments,
      changeLabel: 'Pending',
      icon: AlertCircle,
      color: 'danger',
    },
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary-50 text-primary-700 border-primary-200'
      case 'success':
        return 'bg-success-50 text-success-700 border-success-200'
      case 'warning':
        return 'bg-warning-50 text-warning-700 border-warning-200'
      case 'danger':
        return 'bg-danger-50 text-danger-700 border-danger-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to your finance management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {typeof stat.change === 'number' ? (
                  <>
                    <span className="text-sm font-medium text-gray-900">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">{stat.changeLabel}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">{stat.changeLabel}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left">
              + Add New Vehicle
            </button>
            <button className="w-full btn-secondary text-left">
              + Add Outside Interest
            </button>
            <button className="w-full btn-secondary text-left">
              + Record Payment
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Connection</span>
              <CheckCircle className="h-5 w-5 text-success-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <CheckCircle className="h-5 w-5 text-success-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authentication</span>
              <CheckCircle className="h-5 w-5 text-success-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Dashboard accessed</p>
              <p className="text-xs text-gray-500">Just now</p>
            </div>
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">System login</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
