'use client'

import { Suspense } from 'react'
import LoansList from '@/components/LoansList'
import Layout from '@/components/Layout'

export default function LoansPage() {
  return (
    <Layout title="Loans">
      <Suspense fallback={<div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>}>
        <LoansList />
      </Suspense>
    </Layout>
  )
}
