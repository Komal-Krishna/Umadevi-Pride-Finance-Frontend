'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Car, DollarSign, CreditCard, BarChart3, Building, PiggyBank } from 'lucide-react'

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: TrendingUp, href: '/overview' },
  { id: 'vehicles', label: 'Vehicles', icon: Car, href: '/vehicles' },
  { id: 'outside-interest', label: 'Outside Interest', icon: DollarSign, href: '/outside_interest' },
  { id: 'loans', label: 'Loans', icon: Building, href: '/loans' },
  { id: 'chit', label: 'Chit', icon: PiggyBank, href: '/chit' },
  { id: 'payments', label: 'Payments', icon: CreditCard, href: '/payments' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="mt-8 px-4">
      <ul className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
