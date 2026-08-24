import { MileageTrip, VehicleType } from '../types'

// Official Belgian Tax Authority (FOD Financiën / SPF Finances) Rates for 2026
export const BELGIAN_MILEAGE_RATES: Record<VehicleType, number> = {
  private_car: 0.4415, // Official legal deductible allowance per km (2025/2026 circular)
  company_car: 0.0, // Fuel/electricity paid by company
  ev_car: 0.4415,
  motorcycle: 0.4415,
  bicycle: 0.35, // Tax-free bicycle allowance (fietsvergoeding) up to max per km in Belgium
}

export function calculateTripAllowance(distanceKm: number, isRoundTrip: boolean, vehicleType: VehicleType): { totalDistanceKm: number; ratePerKm: number; totalAllowanceEur: number } {
  const totalDistanceKm = isRoundTrip ? distanceKm * 2 : distanceKm
  const ratePerKm = BELGIAN_MILEAGE_RATES[vehicleType] || 0.4415
  const totalAllowanceEur = Math.round(totalDistanceKm * ratePerKm * 100) / 100

  return {
    totalDistanceKm,
    ratePerKm,
    totalAllowanceEur,
  }
}
