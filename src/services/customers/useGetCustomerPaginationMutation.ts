import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { GetPayload, ReturnPayload } from 'src/types/general'
import { Customer } from './customer.types'
import { getQueryString, postRequest } from '../api'
import { API_PATH_GET_CUSTOMER_PAGINATION } from 'src/constants/routes'
import { useCustomerStore } from 'src/store/customer.store'

const initialData: ReturnPayload<Customer> = {
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

export function useGetCustomerPaginationMutation() {
  const { setCustomerList } = useCustomerStore()

  return useCustomMutation<ReturnPayload<Customer>, GetPayload<Customer>>({
    initialData,
    mutationKey: ['customers', 'pagination'],
    onSuccess: setCustomerList,
    onError: () => setCustomerList(initialData),
    mutationFn: async ({ condition, page, size }) => {
      const { data } = await postRequest<Customer[]>(
        getQueryString(API_PATH_GET_CUSTOMER_PAGINATION, { page, size }),
        condition
      )

      return data || initialData
    },
  })
}
