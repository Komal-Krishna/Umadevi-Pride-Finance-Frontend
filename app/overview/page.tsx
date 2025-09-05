'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import DashboardOverview from '@/components/DashboardOverview'
import Layout from '@/components/Layout'

export default function OverviewPage() {
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

  return (
    <Layout title="Overview">
      <DashboardOverview summary={summary} loading={loading} />
    </Layout>
  )
}
