import React, { useCallback, useEffect, useState } from 'react'
import { Form } from 'antd'
import { useLocation, useNavigate } from 'react-router'
import SearchBar from 'src/components/SearchBar'
import useDebounce from 'src/hooks/use-debounce'
import CustomCard from 'src/components/custom/CustomCard'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { AdvancedCondition } from 'src/types/general'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomRow from 'src/components/custom/CustomRow'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomSelect from 'src/components/custom/CustomSelect'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { useDeliveryReceiptStore } from 'src/store/delivery-receipt.store'
import { DeliveryReceipt } from 'src/services/delivery-receipts/delivery-receipt.types'
import { useGetDeliveryReceiptPaginationMutation } from 'src/services/delivery-receipts/useGetDeliveryReceiptPaginationMutation'
import DeliveryReceiptDetailDrawer from './components/DeliveryReceiptDetailDrawer'
import DeliveryReceiptForm from './components/DeliveryReceiptForm'
import DeliveryReceiptList from './components/DeliveryReceiptList'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A'],
  },
}

const DeliveriesPage: React.FC = () => {
  const [form] = Form.useForm()
  const location = useLocation()
  const navigate = useNavigate()
  const [modalState, setModalState] = useState(false)
  const [detailState, setDetailState] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<DeliveryReceipt>()
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useDeliveryReceiptStore()
  const { mutate: getDeliveryReceiptPagination, isPending: isGetPending } =
    useGetDeliveryReceiptPaginationMutation()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      if (modalState) return

      const { FILTER = initialFilter.FILTER } = form.getFieldsValue()
      const condition: AdvancedCondition[] = []

      if (debounce) {
        condition.push({
          value: debounce,
          field: 'FILTER',
          operator: 'LIKE',
        })
      }

      const filter = getConditionFromForm(FILTER)
      getDeliveryReceiptPagination({
        page,
        size,
        condition: [...condition, ...filter],
      })
    },
    [debounce, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  useEffect(() => {
    const params = new URLSearchParams(location.search)

    if (params.get('action') !== 'create') {
      return
    }

    setSelectedReceipt(undefined)
    setModalState(true)
    params.delete('action')
    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : '',
      },
      { replace: true }
    )
  }, [location.pathname, location.search, navigate])

  const filterContent = (
    <CustomRow width={'100%'}>
      <CustomFormItem
        label={'Estado'}
        name={['FILTER', 'STATE__IN']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '15rem' }}
          placeholder={'Seleccionar estados'}
          mode={'multiple'}
          options={[
            { label: 'Activos', value: 'A' },
            { label: 'Inactivos', value: 'I' },
          ]}
        />
      </CustomFormItem>
    </CustomRow>
  )

  return (
    <>
      <CustomSpin spinning={isGetPending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nueva Entrega'}
            searchPlaceholder={'Buscar comprobantes de entrega...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedReceipt(undefined)
              setModalState(true)
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <DeliveryReceiptList
            onChange={handleSearch}
            onView={(receipt) => {
              setSelectedReceipt(receipt)
              setDetailState(true)
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <DeliveryReceiptForm
          open={modalState}
          onClose={() => setModalState(false)}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>

      <ConditionalComponent condition={detailState}>
        <DeliveryReceiptDetailDrawer
          receiptId={selectedReceipt?.DELIVERY_RECEIPT_ID}
          open={detailState}
          onClose={() => {
            setDetailState(false)
            setSelectedReceipt(undefined)
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default DeliveriesPage
