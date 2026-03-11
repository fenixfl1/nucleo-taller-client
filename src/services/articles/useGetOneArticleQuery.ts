import { useQuery } from '@tanstack/react-query'
import { getRequest } from '../api'
import { API_PATH_GET_ONE_ARTICLE } from 'src/constants/routes'
import { Article } from './article.types'

export function useGetOneArticleQuery(articleId?: number, enabled = true) {
  return useQuery<Article>({
    enabled: Boolean(articleId) && enabled,
    queryKey: ['articles', 'get-one-article', articleId],
    queryFn: async () => {
      const {
        data: { data },
      } = await getRequest<Article>(`${API_PATH_GET_ONE_ARTICLE}${articleId}`)

      return data
    },
  })
}
