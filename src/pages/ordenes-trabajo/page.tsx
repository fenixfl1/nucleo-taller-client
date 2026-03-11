import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Form } from 'antd'
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
import { WorkOrder } from 'src/services/work-orders/work-order.types'
import { useGetWorkOrderPaginationMutation } from 'src/services/work-orders/useGetWorkOrderPaginationMutation'
import { useGetWorkOrderStatusListQuery } from 'src/services/work-orders/useGetWorkOrderStatusListQuery'
import { useWorkOrderStore } from 'src/store/work-order.store'
import WorkOrderDetailDrawer from './components/WorkOrderDetailDrawer'
import WorkOrderForm from './components/WorkOrderForm'
import WorkOrderList from './components/WorkOrderList'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A'],
  },
}

const WorkOrdersPage: React.FC = () => {
  const [form] = Form.useForm()
  const [modalState, setModalState] = useState(false)
  const [detailState, setDetailState] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder>()
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useWorkOrderStore()
  const { mutate: getWorkOrderPagination, isPending: isGetPending } =
    useGetWorkOrderPaginationMutation()
  const { data: statusList = [], isLoading: isStatusListLoading } =
    useGetWorkOrderStatusListQuery()

  const statusOptions = useMemo(
    () =>
      statusList.map((status) => ({
        label: status.NAME,
        value: status.STATUS_ID,
      })),
    [statusList]
  )

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
      getWorkOrderPagination({
        page,
        size,
        condition: [...condition, ...filter],
      })
    },
    [debounce, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  const filterContent = (
    <CustomRow width={'100%'}>
      <CustomFormItem
        label={'Estado registro'}
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
        label={'Estado OT'}
        name={['FILTER', 'STATUS_ID__IN']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '20rem' }}
          placeholder={'Seleccionar estados OT'}
          mode={'multiple'}
          options={statusOptions}
        />
      </CustomFormItem>
    </CustomRow>
  )

  return (
    <>
      <CustomSpin spinning={isGetPending || Boolean(isStatusListLoading)}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nueva OT'}
            searchPlaceholder={'Buscar órdenes de trabajo...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedWorkOrder(undefined)
              setModalState(true)
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <WorkOrderList
            onChange={handleSearch}
            onEdit={(workOrder) => {
              setSelectedWorkOrder(workOrder)
              setModalState(true)
            }}
            onView={(workOrder) => {
              setSelectedWorkOrder(workOrder)
              setDetailState(true)
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <WorkOrderForm
          open={modalState}
          workOrderId={selectedWorkOrder?.WORK_ORDER_ID}
          onClose={() => {
            setModalState(false)
            setSelectedWorkOrder(undefined)
          }}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>

      <ConditionalComponent condition={detailState}>
        <WorkOrderDetailDrawer
          open={detailState}
          workOrderId={selectedWorkOrder?.WORK_ORDER_ID}
          onClose={() => {
            setDetailState(false)
            setSelectedWorkOrder(undefined)
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default WorkOrdersPage
