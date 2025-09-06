'use client'

import { Suspense, use } from 'react'
import OutsideInterestDetails from '@/components/OutsideInterestDetails'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading interest details...</p>
      </div>
    </div>
  )
}

export default function OutsideInterestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OutsideInterestDetails interestId={resolvedParams.id} />
    </Suspense>
  )
}
