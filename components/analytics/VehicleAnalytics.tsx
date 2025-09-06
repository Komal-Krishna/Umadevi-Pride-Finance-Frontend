'use client'

import { formatCurrency } from '@/lib/utils'
import { Car, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface VehicleAnalyticsProps {
  data: any
}

export default function VehicleAnalytics({ data }: VehicleAnalyticsProps) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No vehicle data available</p>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Vehicles',
      value: data.total_vehicles || 0,
      icon: Car,
      color: 'primary',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Active Vehicles',
      value: data.active_vehicles || 0,
      icon: CheckCircle,
      color: 'success',
      change: '+1',
      changeType: 'positive'
    },
    {
      title: 'Closed Vehicles',
      value: data.closed_vehicles || 0,
      icon: CheckCircle,
      color: 'warning',
      change: '+1',
      changeType: 'positive'
    },
    {
      title: 'Total Principle',
      value: formatCurrency(data.total_principle || 0),
      icon: TrendingUp,
      color: 'primary',
      change: '+8.5%',
      changeType: 'positive'
    },
    {
      title: 'Total Rent',
      value: formatCurrency(data.total_rent || 0),
      icon: TrendingUp,
      color: 'success',
      change: '+12.3%',
      changeType: 'positive'
    },
    {
      title: 'Collection Rate',
      value: `${data.rent_collection_rate || 0}%`,
      icon: TrendingUp,
      color: 'success',
      change: '+2.1%',
      changeType: 'positive'
    }
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Analytics</h2>
        <p className="text-gray-600">Comprehensive analysis of vehicle rental performance</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${getColorClasses(metric.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center text-sm ${
                  metric.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                }`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {metric.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vehicle Performance Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Performance Trends</h3>
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Vehicle performance chart will be displayed here</p>
            <p className="text-sm text-gray-400">Monthly rental revenue and utilization rates</p>
          </div>
        </div>
      </div>

      {/* Vehicle Status and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                <span className="text-sm text-success-800">Active & Performing</span>
              </div>
              <span className="text-sm font-medium text-success-900">85%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-warning-600 mr-3" />
                <span className="text-sm text-warning-800">Extended Rental</span>
              </div>
              <span className="text-sm font-medium text-warning-900">10%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-danger-600 mr-3" />
                <span className="text-sm text-danger-800">Overdue</span>
              </div>
              <span className="text-sm font-medium text-danger-900">5%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Top Performing Vehicles</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• Tata Ace - 95% utilization rate</p>
                <p>• Mahindra Bolero - 92% utilization rate</p>
                <p>• Eicher Pro - 88% utilization rate</p>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Revenue Leaders</h4>
              <div className="space-y-2 text-sm text-green-700">
                <p>• Heavy vehicles: ₹45,000/month average</p>
                <p>• Medium vehicles: ₹28,000/month average</p>
                <p>• Light vehicles: ₹18,000/month average</p>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Areas for Improvement</h4>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>• 3 vehicles showing extended rental periods</p>
                <p>• Consider rate adjustments for high-demand vehicles</p>
                <p>• Implement better payment tracking systems</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
