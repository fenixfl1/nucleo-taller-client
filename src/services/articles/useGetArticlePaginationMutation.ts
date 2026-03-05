import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { Article } from './article.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_ARTICLE_PAGINATION } from 'src/constants/routes'
import { useArticleStore } from 'src/store/article.store'

const initialData: ReturnPayload<Article> = {
  data: [],
  metadata: {
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalRows: 0,
      count: 0,
      pageSize: 15,
      links: undefined,
    },
  },
}

export function useGetArticlePaginationMutation() {
  const { setArticleList } = useArticleStore()

  return useCustomMutation<ReturnPayload<Article>, GetPayload<Article>>({
    initialData,
    mutationKey: ['articles', 'pagination'],
    onSuccess: setArticleList,
    onError: () => setArticleList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<Article[]>(
        getQueryString(API_PATH_GET_ARTICLE_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
