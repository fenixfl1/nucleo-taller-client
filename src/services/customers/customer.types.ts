export interface CustomerContact {
  CONTACT_ID: number
  TYPE: 'email' | 'phone' | 'whatsapp' | 'other'
  USAGE: 'personal' | 'emergency'
  VALUE: string
  IS_PRIMARY: boolean
}

export interface Customer {
  PERSON_ID: number
  STAFF_ID: number
  NAME: string
  LAST_NAME: string
  IDENTITY_DOCUMENT: string
  BIRTH_DATE?: string
  GENDER: string
  ADDRESS: string
  EMAIL: string
  PHONE: string
  CONTACTS: CustomerContact[]
  USER_ID: number | null
  STATE: string
  CREATED_AT?: string
}

export interface IdentityDocumentValidationResult {
  identityDocument: string
  isValidFormat: boolean
  isInUse: boolean
}
