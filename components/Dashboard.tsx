'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { LogOut, Menu, X, TrendingUp, Car, DollarSign, CreditCard, BarChart3, Building, PiggyBank } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardOverview from './DashboardOverview'
import VehiclesList from './VehiclesList'
import ComingSoon from './ComingSoon'

type TabType = 'overview' | 'vehicles' | 'outside-interest' | 'loans' | 'payments' | 'analytics' | 'chiti'

export default function Dashboard() {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardSummary()
  }, [])

  const fetchDashboardSummary = async () => {
    try {
      const response = await api.get('/dashboard/summary')
      setSummary(response.data)
    } catch (error) {
      // Silently handle error since dashboard summary is not critical
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'outside-interest', label: 'Outside Interest', icon: DollarSign },
    { id: 'loans', label: 'Loans', icon: Building },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'chiti', label: 'Chiti', icon: PiggyBank },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview summary={summary} loading={loading} />
      case 'vehicles':
        return <VehiclesList />
      case 'outside-interest':
        return <ComingSoon title="Outside Interest Management" description="Manage outside interest investments and track their performance." />
      case 'loans':
        return <ComingSoon title="Loans Management" description="Track and manage all loan activities and repayments." />
      case 'payments':
        return <ComingSoon title="Payments Management" description="Monitor payment schedules and transaction history." />
      case 'analytics':
        return <ComingSoon title="Analytics Dashboard" description="Comprehensive analytics and insights for your finance management." />
      case 'chiti':
        return <ComingSoon title="Chiti Management" description="Manage chiti fund activities and member contributions." />
      default:
        return <DashboardOverview summary={summary} loading={loading} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="desktop-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <h1 className="text-xl font-semibold text-gray-900 ml-2 md:ml-0">
                UmaDevis Pride
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg md:shadow-none border-r border-gray-200 transform transition-transform duration-200 ease-in-out`}>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => {
                        setActiveTab(tab.id as TabType)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="desktop-container">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
