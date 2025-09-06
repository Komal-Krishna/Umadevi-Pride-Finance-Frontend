'use client'

import { Suspense } from 'react'
import OutsideInterestList from '@/components/OutsideInterestList'
import Layout from '@/components/Layout'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  )
}

export default function OutsideInterestPage() {
  return (
    <Layout title="Outside Interest">
      <Suspense fallback={<LoadingFallback />}>
        <OutsideInterestList />
      </Suspense>
    </Layout>
  )
}
