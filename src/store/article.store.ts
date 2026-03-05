import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { Article } from 'src/services/articles/article.types'

interface UseArticleStore {
  articleList: Article[]
  metadata: Metadata
  setArticleList: (payload: ReturnPayload<Article>) => void
}

export const useArticleStore = create<UseArticleStore>((set) => ({
  articleList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setArticleList: ({ data, metadata }) =>
    set({ articleList: data, metadata: metadata.pagination }),
}))
