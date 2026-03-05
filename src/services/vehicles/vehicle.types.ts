export interface Vehicle {
  VEHICLE_ID: number
  CUSTOMER_ID: number
  CUSTOMER_NAME: string
  PLATE: string
  VIN: string
  BRAND: string
  MODEL: string
  YEAR: number | null
  COLOR: string
  ENGINE: string
  NOTES: string
  STATE: string
  CREATED_AT?: string
}
