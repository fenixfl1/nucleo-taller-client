export type ArticleType = 'RADIADOR' | 'REPUESTO' | 'MATERIAL' | 'INSUMO' | 'OTRO'

export interface ArticleCompatibility {
  ARTICLE_COMPATIBILITY_ID?: number
  BRAND: string
  MODEL: string
  YEAR_FROM?: number | null
  YEAR_TO?: number | null
  ENGINE?: string
  NOTES?: string
}

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
  COMPATIBILITY_COUNT: number
  COMPATIBILITIES?: ArticleCompatibility[]
  STATE: string
  CREATED_AT?: string
}
