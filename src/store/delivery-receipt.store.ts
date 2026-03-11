import { create } from 'zustand'
import { Metadata, ReturnPayload } from 'src/types/general'
import { DeliveryReceipt } from 'src/services/delivery-receipts/delivery-receipt.types'

interface UseDeliveryReceiptStore {
  deliveryReceipt: DeliveryReceipt
  deliveryReceiptList: DeliveryReceipt[]
  metadata: Metadata
  setDeliveryReceipt: (deliveryReceipt: DeliveryReceipt) => void
  setDeliveryReceiptList: (payload: ReturnPayload<DeliveryReceipt>) => void
}

export const useDeliveryReceiptStore = create<UseDeliveryReceiptStore>((set) => ({
  deliveryReceipt: <DeliveryReceipt>{},
  deliveryReceiptList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setDeliveryReceipt: (deliveryReceipt) => set({ deliveryReceipt }),
  setDeliveryReceiptList: ({ data, metadata }) =>
    set({ deliveryReceiptList: data, metadata: metadata.pagination }),
}))
