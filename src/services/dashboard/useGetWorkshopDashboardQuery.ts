import { useQuery } from '@tanstack/react-query'
import {
  API_PATH_GET_DASHBOARD_SUMMARY,
} from 'src/constants/routes'
import { getRequest } from 'src/services/api'
import {
  WorkshopDashboardSnapshot,
  WorkshopDashboardSummary,
} from './dashboard.types'

const EMPTY_SUMMARY: WorkshopDashboardSummary = {
  activeCustomers: 0,
  activeVehicles: 0,
  activeServiceVehicles: 0,
  activeArticles: 0,
  activeWorkOrders: 0,
  readyForDelivery: 0,
  totalDeliveries: 0,
  availableServiceVehicles: 0,
  pendingServiceVehicleMaintenance: 0,
  overdueServiceVehicleMaintenance: 0,
  totalServiceVehicleUsageHours: 0,
  totalServiceVehicleUsageKilometers: 0,
}

const EMPTY_DASHBOARD: WorkshopDashboardSnapshot = {
  summary: EMPTY_SUMMARY,
  inProgressOrders: [],
  readyForDeliveryOrders: [],
  recentMovements: [],
  recentDeliveries: [],
  recentServiceVehicles: [],
  fleetMaintenanceAlerts: [],
  fleetUsageSummary: [],
  fleetAvailability: [],
}

export function useGetWorkshopDashboardQuery() {
  return useQuery<WorkshopDashboardSnapshot>({
    queryKey: ['dashboard', 'workshop-snapshot'],
    queryFn: async () => {
      const { data } = await getRequest<WorkshopDashboardSnapshot>(
        API_PATH_GET_DASHBOARD_SUMMARY
      )

      return data?.data || EMPTY_DASHBOARD
    },
    staleTime: 60 * 1000,
    initialData: EMPTY_DASHBOARD,
  })
}
