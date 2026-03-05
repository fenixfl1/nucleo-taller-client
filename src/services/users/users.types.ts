export interface UserContact {
  CONTACT_ID: number
  TYPE: 'email' | 'phone' | 'whatsapp' | 'other'
  USAGE: 'personal' | 'emergency'
  VALUE: string
  IS_PRIMARY: boolean
}

export interface User {
  USER_ID: number
  NAME: string
  LAST_NAME: string
  AVATAR: string
  USERNAME: string
  IS_ACTIVE: boolean
  ROLES: string
  CREATED_AT: string
  STATE: string
  IDENTITY_DOCUMENT: string
  EMAIL: string
  PHONE: string
  BIRTH_DATE: string
  GENDER: string
  ADDRESS: string
  CONTACTS?: UserContact[]
  STAFF_ID: number
  ROLE_ID: number
}

export interface Business {
  BUSINESS_ID: number
  NAME: string
  LOGO?: string
  LOGO_URL?: string
  RNC: string
  PHONE: string
  ADDRESS: string
  STATE: string
  CREATED_AT?: Date
  CREATED_BY?: number
  UPDATED_AT?: Date
  UPDATED_BY?: number
}
