import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_CUSTOMER } from 'src/constants/routes'
import { Customer } from './customer.types'

interface UpdateCustomerPayload {
  CUSTOMER_ID?: number
  PERSON_ID?: number
  NAME?: string
  LAST_NAME?: string
  IDENTITY_DOCUMENT?: string
  BIRTH_DATE?: string | null
  GENDER?: 'M' | 'F' | 'O'
  ADDRESS?: string
  CONTACTS?: Array<{
    TYPE: 'email' | 'phone' | 'whatsapp' | 'other'
    USAGE?: 'personal' | 'emergency'
    VALUE: string
    IS_PRIMARY?: boolean
  }>
  STATE?: 'A' | 'I'
}

export function useUpdateCustomerMutation() {
  return useCustomMutation<Customer, UpdateCustomerPayload>({
    initialData: <Customer>{},
    mutationKey: ['customers', 'update-customer'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<Customer>(API_PATH_CREATE_UPDATE_CUSTOMER, payload)

      return data
    },
  })
}
