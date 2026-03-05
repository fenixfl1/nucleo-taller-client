export type ArticleType = 'RADIADOR' | 'REPUESTO' | 'MATERIAL' | 'INSUMO' | 'OTRO'

export interface Article {
  ARTICLE_ID: number
  CODE: string
  NAME: string
  ITEM_TYPE: ArticleType
  UNIT_MEASURE: string
  CATEGORY: string
  MIN_STOCK: number
  MAX_STOCK: number | null
  CURRENT_STOCK: number
  COST_REFERENCE: number | null
  DESCRIPTION: string
  STATE: string
  CREATED_AT?: string
}
