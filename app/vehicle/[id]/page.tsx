'use client'

import { useParams } from 'next/navigation'
import VehicleDetails from '@/components/VehicleDetails'

export default function VehiclePage() {
  const params = useParams()
  const vehicleId = params.id as string

  return <VehicleDetails vehicleId={vehicleId} />
}
