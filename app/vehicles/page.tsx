'use client'

import { Suspense } from 'react'
import VehiclesList from '@/components/VehiclesList'
import Layout from '@/components/Layout'

export default function VehiclesPage() {
  return (
    <Layout title="Vehicles">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <VehiclesList />
      </Suspense>
    </Layout>
  )
}
