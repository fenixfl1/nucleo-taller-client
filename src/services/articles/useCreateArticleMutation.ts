import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_ARTICLE } from 'src/constants/routes'
import { Article, ArticleType } from './article.types'

interface CreateArticlePayload {
  CODE: string
  NAME: string
  ITEM_TYPE: ArticleType
  UNIT_MEASURE: string
  CATEGORY?: string
  MIN_STOCK?: number
  MAX_STOCK?: number | null
  CURRENT_STOCK?: number
  COST_REFERENCE?: number | null
  DESCRIPTION?: string
  STATE?: 'A' | 'I'
}

export function useCreateArticleMutation() {
  return useCustomMutation<Article, CreateArticlePayload>({
    initialData: <Article>{},
    mutationKey: ['articles', 'create-article'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<Article>(API_PATH_CREATE_UPDATE_ARTICLE, payload)

      return data
    },
  })
}
