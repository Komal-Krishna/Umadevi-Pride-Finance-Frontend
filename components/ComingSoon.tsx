'use client'

import { Clock, Construction } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description?: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 mb-6">
            {description || "This feature is currently under development and will be available soon."}
          </p>
        </div>
        
        <div className="flex items-center justify-center text-primary-600">
          <Clock className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Coming Soon</span>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            We're working hard to bring you the best experience. 
            Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  )
}
