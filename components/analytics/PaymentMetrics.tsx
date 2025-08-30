'use client'

import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle } from 'lucide-react'

interface PaymentMetricsProps {
  data: any
}

export default function PaymentMetrics({ data }: PaymentMetricsProps) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No payment data available</p>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Payments',
      value: data.total_payments,
      icon: CreditCard,
      color: 'primary',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(data.total_amount),
      icon: DollarSign,
      color: 'success',
      change: '+8.5%',
      changeType: 'positive'
    },
    {
      title: 'Average Payment',
      value: formatCurrency(data.average_payment),
      icon: TrendingUp,
      color: 'warning',
      change: '+5.2%',
      changeType: 'positive'
    },
    {
      title: 'Success Rate',
      value: `${data.payment_success_rate}%`,
      icon: TrendingUp,
      color: 'success',
      change: '+2.1%',
      changeType: 'positive'
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(data.pending_amount),
      icon: AlertCircle,
      color: 'danger',
      change: '-3.4%',
      changeType: 'negative'
    },
    {
      title: 'Largest Payment',
      value: formatCurrency(data.largest_payment),
      icon: DollarSign,
      color: 'primary',
      change: '+15.7%',
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Analytics</h2>
        <p className="text-gray-600">Detailed analysis of payment patterns and performance</p>
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
                  {metric.changeType === 'positive' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
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

      {/* Payment Trends Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Trends</h3>
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Payment trends chart will be displayed here</p>
            <p className="text-sm text-gray-400">Monthly payment volume and success rates</p>
          </div>
        </div>
      </div>

      {/* Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium text-gray-900">75%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-warning-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-medium text-gray-900">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-danger-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Failed</span>
              </div>
              <span className="text-sm font-medium text-gray-900">5%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Type Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Vehicle Rentals</span>
              </div>
              <span className="text-sm font-medium text-gray-900">60%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Interest Payments</span>
              </div>
              <span className="text-sm font-medium text-gray-900">30%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-warning-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Other</span>
              </div>
              <span className="text-sm font-medium text-gray-900">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
