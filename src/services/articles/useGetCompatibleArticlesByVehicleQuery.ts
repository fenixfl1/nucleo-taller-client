import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_COMPATIBLE_ARTICLES_BY_VEHICLE } from 'src/constants/routes'
import { Article } from './article.types'

export function useGetCompatibleArticlesByVehicleQuery(
  vehicleId?: number,
  enabled = true
) {
  return useQuery<Article[]>({
    enabled: Boolean(vehicleId) && enabled,
    queryKey: ['articles', 'compatible-by-vehicle', vehicleId],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<Article[]>(
        `${API_PATH_GET_COMPATIBLE_ARTICLES_BY_VEHICLE}${vehicleId}`
      )

      return data || []
    },
    staleTime: 60 * 1000,
  })
}
