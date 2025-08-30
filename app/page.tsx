'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="mobile-container">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-800 mb-2">
              UmaDevis Pride
            </h1>
            <p className="text-gray-600">
              Finance Management System
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  }

  return <Dashboard />
}
