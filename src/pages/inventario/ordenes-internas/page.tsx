import React, { useCallback, useEffect, useState } from 'react'
import { Form } from 'antd'
import { useNavigate } from 'react-router-dom'
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
import { useInternalPurchaseOrderStore } from 'src/store/internal-purchase-order.store'
import { InternalPurchaseOrder } from 'src/services/internal-purchase-orders/internal-purchase-order.types'
import { useGetInternalPurchaseOrderPaginationMutation } from 'src/services/internal-purchase-orders/useGetInternalPurchaseOrderPaginationMutation'
import { buildActivityPath } from 'src/utils/activity-path'
import InternalPurchaseOrderList from './components/InternalPurchaseOrderList'
import InternalPurchaseOrderDetailDrawer from './components/InternalPurchaseOrderDetailDrawer'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A'],
  },
}

const statusOptions = [
  { label: 'Generada', value: 'GENERADA' },
  { label: 'Enviada', value: 'ENVIADA' },
  { label: 'Recibida', value: 'RECIBIDA' },
  { label: 'Cancelada', value: 'CANCELADA' },
]

const InternalPurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [detailState, setDetailState] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<InternalPurchaseOrder>()
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useInternalPurchaseOrderStore()
  const {
    mutate: getInternalPurchaseOrderPagination,
    isPending: isGetPending,
  } = useGetInternalPurchaseOrderPaginationMutation()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
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
      getInternalPurchaseOrderPagination({
        page,
        size,
        condition: [...condition, ...filter],
      })
    },
    [debounce]
  )

  useEffect(handleSearch, [handleSearch])

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

      <CustomFormItem
        label={'Situación'}
        name={['FILTER', 'STATUS__IN']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '15rem' }}
          placeholder={'Seleccionar estados internos'}
          mode={'multiple'}
          options={statusOptions}
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
            createText={'Ir a reposición'}
            searchPlaceholder={'Buscar órdenes internas...'}
            onSearch={setSearchKey}
            onCreate={() =>
              navigate(buildActivityPath('0-5-3', '/inventario/reposicion'))
            }
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <InternalPurchaseOrderList
            onChange={handleSearch}
            onView={(order) => {
              setSelectedOrder(order)
              setDetailState(true)
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={detailState}>
        <InternalPurchaseOrderDetailDrawer
          internalPurchaseOrderId={selectedOrder?.INTERNAL_PURCHASE_ORDER_ID}
          open={detailState}
          onSuccess={handleSearch}
          onClose={() => {
            setDetailState(false)
            setSelectedOrder(undefined)
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default InternalPurchaseOrdersPage
