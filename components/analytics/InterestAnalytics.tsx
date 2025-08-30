'use client'

import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, Percent, AlertCircle, CheckCircle } from 'lucide-react'

interface InterestAnalyticsProps {
  data: any
}

export default function InterestAnalytics({ data }: InterestAnalyticsProps) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No interest data available</p>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Loans',
      value: data.total_loans || 0,
      icon: DollarSign,
      color: 'primary',
      change: '+1',
      changeType: 'positive'
    },
    {
      title: 'Active Loans',
      value: data.active_loans || 0,
      icon: CheckCircle,
      color: 'success',
      change: '+1',
      changeType: 'positive'
    },
    {
      title: 'Closed Loans',
      value: data.closed_loans || 0,
      icon: CheckCircle,
      color: 'warning',
      change: '0',
      changeType: 'neutral'
    },
    {
      title: 'Total Principle',
      value: formatCurrency(data.total_principle || 0),
      icon: TrendingUp,
      color: 'primary',
      change: '+15.2%',
      changeType: 'positive'
    },
    {
      title: 'Interest Earned',
      value: formatCurrency(data.total_interest_earned || 0),
      icon: Percent,
      color: 'success',
      change: '+18.7%',
      changeType: 'positive'
    },
    {
      title: 'Collection Rate',
      value: `${data.interest_collection_rate || 0}%`,
      icon: TrendingUp,
      color: 'success',
      change: '+3.2%',
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interest Analytics</h2>
        <p className="text-gray-600">Comprehensive analysis of interest-based lending performance</p>
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
                  metric.changeType === 'positive' ? 'text-success-600' : 
                  metric.changeType === 'negative' ? 'text-danger-600' : 'text-gray-600'
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

      {/* Interest Rate Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interest Rate Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Rate</span>
              <span className="text-lg font-bold text-gray-900">{data.average_interest_rate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Highest Rate</span>
              <span className="text-lg font-bold text-gray-900">{data.highest_interest_rate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lowest Rate</span>
              <span className="text-lg font-bold text-gray-900">{data.lowest_interest_rate || 0}%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
              <span className="text-sm text-success-800">Performing Loans</span>
              <span className="text-sm font-medium text-success-900">85%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
              <span className="text-sm text-warning-800">At Risk</span>
              <span className="text-sm font-medium text-warning-900">12%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
              <span className="text-sm text-danger-800">Defaulted</span>
              <span className="text-sm font-medium text-danger-900">3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Trends Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interest Earnings Trends</h3>
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <Percent className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Interest earnings chart will be displayed here</p>
            <p className="text-sm text-gray-400">Monthly interest collection and trends</p>
          </div>
        </div>
      </div>

      {/* Loan Category Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Category Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Business Loans</h4>
            <div className="text-2xl font-bold text-blue-900 mb-1">₹45,000</div>
            <div className="text-xs text-blue-600">Average Principle</div>
            <div className="text-xs text-blue-600">12.5% avg rate</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">Personal Loans</h4>
            <div className="text-2xl font-bold text-green-900 mb-1">₹28,000</div>
            <div className="text-xs text-green-600">Average Principle</div>
            <div className="text-xs text-green-600">15.2% avg rate</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Other Loans</h4>
            <div className="text-2xl font-bold text-yellow-900 mb-1">₹18,000</div>
            <div className="text-xs text-yellow-600">Average Principle</div>
            <div className="text-xs text-yellow-600">13.8% avg rate</div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
        <div className="space-y-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">Low Risk Loans</h4>
            <div className="text-sm text-green-700">
              <p>• 75% of loans are performing well</p>
              <p>• Average collection rate: 88.7%</p>
              <p>• Most borrowers have good payment history</p>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Medium Risk Areas</h4>
            <div className="text-sm text-yellow-700">
              <p>• 3 loans showing delayed payments</p>
              <p>• Consider stricter payment terms</p>
              <p>• Monitor high-interest rate loans</p>
            </div>
          </div>

          <div className="p-3 bg-red-50 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">High Risk Alerts</h4>
            <div className="text-sm text-red-700">
              <p>• 1 loan in default status</p>
              <p>• Immediate action required</p>
              <p>• Consider legal recovery process</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
