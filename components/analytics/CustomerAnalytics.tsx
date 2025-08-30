'use client'

import { Users, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface CustomerAnalyticsProps {
  data: any
}

export default function CustomerAnalytics({ data }: CustomerAnalyticsProps) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No customer data available</p>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Customers',
      value: data.total_customers || 0,
      icon: Users,
      color: 'primary',
      change: '+3',
      changeType: 'positive'
    },
    {
      title: 'Active Customers',
      value: Math.round((data.total_customers || 0) * 0.85),
      icon: CheckCircle,
      color: 'success',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'At Risk',
      value: Math.round((data.total_customers || 0) * 0.12),
      icon: AlertTriangle,
      color: 'warning',
      change: '+1',
      changeType: 'negative'
    },
    {
      title: 'High Risk',
      value: Math.round((data.total_customers || 0) * 0.03),
      icon: AlertTriangle,
      color: 'danger',
      change: '0',
      changeType: 'neutral'
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

  const topCustomers = [
    { name: 'John Doe', total: '₹85,000', status: 'Excellent', risk: 'Low' },
    { name: 'Jane Smith', total: '₹72,000', status: 'Good', risk: 'Low' },
    { name: 'Mike Johnson', total: '₹68,000', status: 'Good', risk: 'Low' },
    { name: 'Sarah Wilson', total: '₹55,000', status: 'Fair', risk: 'Medium' },
    { name: 'David Brown', total: '₹48,000', status: 'Fair', risk: 'Medium' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Analytics</h2>
        <p className="text-gray-600">Comprehensive analysis of customer behavior and risk assessment</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Customer Performance Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Performance Trends</h3>
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Customer performance chart will be displayed here</p>
            <p className="text-sm text-gray-400">Customer payment history and risk trends</p>
          </div>
        </div>
      </div>

      {/* Top Customers and Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Customers</h3>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.total} total</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    customer.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                    customer.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {customer.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Risk: {customer.risk}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Risk Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                <span className="text-sm text-success-800">Low Risk</span>
              </div>
              <span className="text-sm font-medium text-success-900">85%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-warning-600 mr-3" />
                <span className="text-sm text-warning-800">Medium Risk</span>
              </div>
              <span className="text-sm font-medium text-warning-900">12%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-danger-600 mr-3" />
                <span className="text-sm text-danger-800">High Risk</span>
              </div>
              <span className="text-sm font-medium text-danger-900">3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Customer Retention</h4>
              <div className="text-sm text-blue-700">
                <p>• 92% customer retention rate</p>
                <p>• Top customers contribute 65% of revenue</p>
                <p>• Consider loyalty programs for top performers</p>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Payment Behavior</h4>
              <div className="text-sm text-green-700">
                <p>• 78% pay on time consistently</p>
                <p>• 15% pay within grace period</p>
                <p>• 7% require payment reminders</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Risk Management</h4>
              <div className="text-sm text-yellow-700">
                <p>• Monitor 3 medium-risk customers</p>
                <p>• Implement stricter terms for new customers</p>
                <p>• Regular payment status reviews</p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 mb-2">Growth Opportunities</h4>
              <div className="text-sm text-purple-700">
                <p>• Expand services for top customers</p>
                <p>• Referral programs for loyal customers</p>
                <p>• Cross-selling vehicle and loan services</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Activity Timeline */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Customer Activity</h3>
        <div className="space-y-3">
          {[
            { customer: 'John Doe', action: 'Payment received', amount: '₹15,000', time: '2 hours ago', status: 'success' },
            { customer: 'Jane Smith', action: 'Payment reminder sent', amount: '₹12,000', time: '4 hours ago', status: 'warning' },
            { customer: 'Mike Johnson', action: 'New vehicle rental', amount: '₹8,500', time: '6 hours ago', status: 'info' },
            { customer: 'Sarah Wilson', action: 'Payment overdue', amount: '₹18,000', time: '1 day ago', status: 'danger' },
            { customer: 'David Brown', action: 'Payment received', amount: '₹22,000', time: '1 day ago', status: 'success' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-success-500' :
                  activity.status === 'warning' ? 'bg-warning-500' :
                  activity.status === 'danger' ? 'bg-danger-500' : 'bg-primary-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.customer}</p>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{activity.amount}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
