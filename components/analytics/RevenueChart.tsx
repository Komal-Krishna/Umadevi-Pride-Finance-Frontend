'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { TrendingUp, BarChart3, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RevenueChart() {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('12')

  useEffect(() => {
    fetchRevenueData()
  }, [period])

  const fetchRevenueData = async () => {
    try {
      const response = await api.get(`/analytics/revenue-trends?period=${period}`)
      setChartData(response.data)
    } catch (error) {
      toast.error('Failed to fetch revenue data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Revenue Analysis</h2>
          <p className="text-gray-600">Track revenue trends and performance over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input-field w-24"
          >
            <option value="6">6M</option>
            <option value="12">12M</option>
            <option value="24">24M</option>
          </select>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹2,45,000</p>
            </div>
            <div className="p-3 rounded-full bg-primary-50 text-primary-700">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +12.5% from last period
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vehicle Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹1,85,000</p>
            </div>
            <div className="p-3 rounded-full bg-success-50 text-success-700">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +8.3% from last period
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Interest Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹60,000</p>
            </div>
            <div className="p-3 rounded-full bg-warning-50 text-warning-700">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-success-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +15.2% from last period
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
        <div className="h-96 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Revenue trends chart will be displayed here</p>
            <p className="text-sm text-gray-400">Monthly revenue breakdown by source</p>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h3>
          <div className="space-y-3">
            {[
              { month: 'January', revenue: '₹22,500', change: '+5.2%' },
              { month: 'February', revenue: '₹24,800', change: '+10.2%' },
              { month: 'March', revenue: '₹21,200', change: '-2.1%' },
              { month: 'April', revenue: '₹26,500', change: '+25.0%' },
              { month: 'May', revenue: '₹28,100', change: '+6.0%' },
              { month: 'June', revenue: '₹25,900', change: '-7.8%' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">{item.revenue}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.change.startsWith('+') 
                      ? 'bg-success-100 text-success-700' 
                      : 'bg-danger-100 text-danger-700'
                  }`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Vehicle Rentals</span>
              </div>
              <span className="text-sm font-medium text-gray-900">75.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Interest Income</span>
              </div>
              <span className="text-sm font-medium text-gray-900">24.5%</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Growth Insights</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Vehicle revenue shows consistent growth trend</p>
              <p>• Interest income increased by 15.2% this period</p>
              <p>• Peak revenue in April due to seasonal demand</p>
              <p>• Overall growth rate: 12.5% vs last period</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
