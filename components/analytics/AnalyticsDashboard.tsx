'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { TrendingUp, BarChart3, PieChart, Activity, AlertTriangle } from 'lucide-react'
import RevenueChart from './RevenueChart'
import PaymentMetrics from './PaymentMetrics'
import VehicleAnalytics from './VehicleAnalytics'
import InterestAnalytics from './InterestAnalytics'
import CustomerAnalytics from './CustomerAnalytics'
import RiskAnalysis from './RiskAnalysis'
import toast from 'react-hot-toast'

interface AnalyticsData {
  summary: any
  performance_metrics: any
  payment_analysis: any
  vehicle_analytics: any
  interest_analytics: any
  customer_analytics: any
  recommendations: string[]
  alerts: string[]
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const response = await api.get('/analytics/dashboard')
      setAnalyticsData(response.data)
    } catch (error) {
      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

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

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue Analysis', icon: BarChart3 },
    { id: 'payments', label: 'Payment Metrics', icon: Activity },
    { id: 'vehicles', label: 'Vehicle Analytics', icon: TrendingUp },
    { id: 'interest', label: 'Interest Analytics', icon: PieChart },
    { id: 'customers', label: 'Customer Analytics', icon: Activity },
    { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AnalyticsOverview data={analyticsData} />
      case 'revenue':
        return <RevenueChart />
      case 'payments':
        return <PaymentMetrics data={analyticsData.payment_analysis} />
      case 'vehicles':
        return <VehicleAnalytics data={analyticsData.vehicle_analytics} />
      case 'interest':
        return <InterestAnalytics data={analyticsData.interest_analytics} />
      case 'customers':
        return <CustomerAnalytics data={analyticsData.customer_analytics} />
      case 'risk':
        return <RiskAnalysis data={analyticsData.performance_metrics?.risk_assessment} />
      default:
        return <AnalyticsOverview data={analyticsData} />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Analytics</h2>
        <p className="text-gray-600">Comprehensive analysis of your finance management system</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="inline-block w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  )
}

function AnalyticsOverview({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{data.summary.total_revenue?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary-50 text-primary-700">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.total_vehicles || '0'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-success-50 text-success-700">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.total_loans || '0'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-warning-50 text-warning-700">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.risk_score?.toFixed(1) || '0.0'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-danger-50 text-danger-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {data.recommendations.length > 0 ? (
              data.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-800">{rec}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recommendations at this time</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
          <div className="space-y-3">
            {data.alerts.length > 0 ? (
              data.alerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-sm text-red-800">{alert}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No alerts at this time</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Distribution</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
