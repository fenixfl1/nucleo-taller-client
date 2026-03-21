import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { User } from './users.types'
import { postRequest } from '../api'
import { API_PATH_CREATE_UPDATE_USER } from 'src/constants/routes'

interface CreateUserPayload {
  NAME: string
  LAST_NAME: string
  IDENTITY_DOCUMENT: string
  BIRTH_DATE?: string | null
  GENDER: 'M' | 'F' | 'O'
  ADDRESS?: string
  CONTACTS?: Array<{
    TYPE: 'email' | 'phone' | 'whatsapp' | 'other'
    USAGE?: 'personal' | 'emergency'
    VALUE: string
    IS_PRIMARY?: boolean
  }>
  USERNAME: string
  ROLE_ID: number
  EMPLOYEE_TYPE: 'OPERACIONAL' | 'ADMINISTRATIVO'
}

export function useCreateUserMutation() {
  return useCustomMutation<User, CreateUserPayload>({
    initialData: <User>{},
    mutationKey: ['users', 'create-user'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<User>(API_PATH_CREATE_UPDATE_USER, payload)

      return data
    },
  })
}
