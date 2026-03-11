import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_ARTICLE } from 'src/constants/routes'
import { Article, ArticleCompatibility, ArticleType } from './article.types'

interface UpdateArticlePayload {
  ARTICLE_ID: number
  CODE?: string
  NAME?: string
  ITEM_TYPE?: ArticleType
  UNIT_MEASURE?: string
  CATEGORY?: string
  MIN_STOCK?: number
  MAX_STOCK?: number | null
  CURRENT_STOCK?: number
  COST_REFERENCE?: number | null
  DESCRIPTION?: string
  COMPATIBILITIES?: ArticleCompatibility[]
  STATE?: 'A' | 'I'
}

export function useUpdateArticleMutation() {
  return useCustomMutation<Article, UpdateArticlePayload>({
    initialData: <Article>{},
    mutationKey: ['articles', 'update-article'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<Article>(API_PATH_CREATE_UPDATE_ARTICLE, payload)

      return data
    },
  })
}
