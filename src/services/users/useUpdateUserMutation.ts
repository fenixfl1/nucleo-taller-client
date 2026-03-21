import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { User } from './users.types'
import { putRequest } from '../api'
import { API_PATH_CREATE_UPDATE_USER } from 'src/constants/routes'

interface UpdateUserPayload {
  USER_ID: number
  USERNAME?: string
  ROLE_ID?: number
  EMPLOYEE_TYPE?: 'OPERACIONAL' | 'ADMINISTRATIVO'
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
  STATE?: string
  AVATAR?: string | null
}

export function useUpdateUserMutation() {
  return useCustomMutation<User, UpdateUserPayload>({
    initialData: <User>{},
    mutationKey: ['user', 'update-user'],
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await putRequest<User>(API_PATH_CREATE_UPDATE_USER, payload)

      return data
    },
  })
}
