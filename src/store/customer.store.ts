import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { Customer } from 'src/services/customers/customer.types'

interface UseCustomerStore {
  customerList: Customer[]
  metadata: Metadata
  setCustomerList: (payload: ReturnPayload<Customer>) => void
}

export const useCustomerStore = create<UseCustomerStore>((set) => ({
  customerList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setCustomerList: ({ data, metadata }) =>
    set({ customerList: data, metadata: metadata.pagination }),
}))
