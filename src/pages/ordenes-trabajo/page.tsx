import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
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
import CustomRangePicker from 'src/components/custom/CustomRangePicker'
import { WorkOrder } from 'src/services/work-orders/work-order.types'
import { useGetWorkOrderPaginationMutation } from 'src/services/work-orders/useGetWorkOrderPaginationMutation'
import { useGetWorkOrderStatusListQuery } from 'src/services/work-orders/useGetWorkOrderStatusListQuery'
import { useWorkOrderStore } from 'src/store/work-order.store'
import WorkOrderDetailDrawer from './components/WorkOrderDetailDrawer'
import WorkOrderForm from './components/WorkOrderForm'
import WorkOrderList from './components/WorkOrderList'
import { useGetCustomerPaginationMutation } from 'src/services/customers/useGetCustomerPaginationMutation'
import { useCustomerStore } from 'src/store/customer.store'
import { useGetVehiclePaginationMutation } from 'src/services/vehicles/useGetVehiclePaginationMutation'
import { useVehicleStore } from 'src/store/vehicle.store'
import { useGetUserPaginationMutation } from 'src/services/users/useGetUserPaginationMutation'
import { useUserStore } from 'src/store/user.store'
import CustomCol from 'src/components/custom/CustomCol'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A'],
    STATUS_ID__IN: [],
    CUSTOMER_ID: undefined,
    VEHICLE_ID: undefined,
    TECHNICIAN_ID: undefined,
    PROMISED_RANGE: undefined,
    PROMISE_WINDOW: undefined,
  },
}

const WorkOrdersPage: React.FC = () => {
  const [form] = Form.useForm()
  const location = useLocation()
  const navigate = useNavigate()
  const [modalState, setModalState] = useState(false)
  const [detailState, setDetailState] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder>()
  const [searchKey, setSearchKey] = useState('')
  const [searchCustomerKey, setSearchCustomerKey] = useState('')
  const [searchVehicleKey, setSearchVehicleKey] = useState('')
  const [searchTechnicianKey, setSearchTechnicianKey] = useState('')
  const debounce = useDebounce(searchKey)
  const debounceCustomer = useDebounce(searchCustomerKey)
  const debounceVehicle = useDebounce(searchVehicleKey)
  const debounceTechnician = useDebounce(searchTechnicianKey)

  const { metadata } = useWorkOrderStore()
  const { customerList } = useCustomerStore()
  const { vehicleList } = useVehicleStore()
  const { userList } = useUserStore()
  const { mutate: getWorkOrderPagination, isPending: isGetPending } =
    useGetWorkOrderPaginationMutation()
  const { mutate: getCustomerPagination, isPending: isGetCustomersPending } =
    useGetCustomerPaginationMutation()
  const { mutate: getVehiclePagination, isPending: isGetVehiclesPending } =
    useGetVehiclePaginationMutation()
  const { mutate: getUserPagination, isPending: isGetUsersPending } =
    useGetUserPaginationMutation()
  const { data: statusList = [], isLoading: isStatusListLoading } =
    useGetWorkOrderStatusListQuery()
  const watchedCustomerId = Form.useWatch(['FILTER', 'CUSTOMER_ID'], form)

  const statusOptions = useMemo(
    () =>
      statusList.map((status) => ({
        label: status.NAME,
        value: status.STATUS_ID,
      })),
    [statusList]
  )

  const customerOptions = useMemo(
    () =>
      customerList.map((customer) => ({
        label:
          `${customer.NAME} ${customer.LAST_NAME || ''} (${customer.IDENTITY_DOCUMENT || 'SIN DOC'})`.trim(),
        value: customer.PERSON_ID,
      })),
    [customerList]
  )

  const vehicleOptions = useMemo(
    () =>
      vehicleList.map((vehicle) => ({
        label: `${vehicle.PLATE || 'SIN PLACA'} - ${vehicle.BRAND} ${vehicle.MODEL}`,
        value: vehicle.VEHICLE_ID,
      })),
    [vehicleList]
  )

  const technicianOptions = useMemo(
    () =>
      userList.map((user) => ({
        label:
          `${user.NAME} ${user.LAST_NAME || ''} (@${user.USERNAME})`.trim(),
        value: user.STAFF_ID,
      })),
    [userList]
  )

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      if (modalState) return

      const { FILTER = initialFilter.FILTER } = form.getFieldsValue()
      const condition: AdvancedCondition[] = []
      const {
        STATE__IN,
        STATUS_ID__IN,
        CUSTOMER_ID,
        VEHICLE_ID,
        TECHNICIAN_ID,
        PROMISED_RANGE,
        PROMISE_WINDOW,
      } = FILTER

      if (debounce) {
        condition.push({
          value: debounce,
          field: 'FILTER',
          operator: 'LIKE',
        })
      }

      if (STATE__IN?.length) {
        condition.push({
          field: 'STATE',
          operator: 'IN',
          value: STATE__IN,
        })
      }

      if (STATUS_ID__IN?.length) {
        condition.push({
          field: 'STATUS_ID',
          operator: 'IN',
          value: STATUS_ID__IN,
        })
      }

      if (CUSTOMER_ID) {
        condition.push({
          field: 'CUSTOMER_ID',
          operator: '=',
          value: Number(CUSTOMER_ID),
        })
      }

      if (VEHICLE_ID) {
        condition.push({
          field: 'VEHICLE_ID',
          operator: '=',
          value: Number(VEHICLE_ID),
        })
      }

      if (TECHNICIAN_ID) {
        condition.push({
          field: 'TECHNICIAN_IDS',
          operator: 'LIKE',
          value: `,${Number(TECHNICIAN_ID)},`,
        })
      }

      if (PROMISED_RANGE?.length === 2) {
        condition.push({
          field: 'PROMISED_AT',
          operator: 'BETWEEN',
          value: [
            dayjs(PROMISED_RANGE[0]).startOf('day').toISOString(),
            dayjs(PROMISED_RANGE[1]).endOf('day').toISOString(),
          ],
        })
      }

      if (PROMISE_WINDOW) {
        const today = dayjs()
        const finalStatuses = ['ENTREGADA', 'CANCELADA']

        if (PROMISE_WINDOW === 'OVERDUE_GRACE') {
          condition.push(
            {
              field: 'PROMISED_AT',
              operator: '<=',
              value: today.subtract(1, 'day').endOf('day').toISOString(),
            },
            {
              field: 'STATUS_CODE',
              operator: 'NOT IN',
              value: finalStatuses,
            }
          )
        }

        if (PROMISE_WINDOW === 'TODAY') {
          condition.push(
            {
              field: 'PROMISED_AT',
              operator: 'BETWEEN',
              value: [
                today.startOf('day').toISOString(),
                today.endOf('day').toISOString(),
              ],
            },
            {
              field: 'STATUS_CODE',
              operator: 'NOT IN',
              value: finalStatuses,
            }
          )
        }

        if (PROMISE_WINDOW === 'NEXT_48H') {
          condition.push(
            {
              field: 'PROMISED_AT',
              operator: 'BETWEEN',
              value: [
                today.startOf('day').toISOString(),
                today.add(2, 'day').endOf('day').toISOString(),
              ],
            },
            {
              field: 'STATUS_CODE',
              operator: 'NOT IN',
              value: finalStatuses,
            }
          )
        }
      }

      getWorkOrderPagination({ page, size, condition })
    },
    [debounce, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  const handleSearchCustomers = useCallback(() => {
    const condition: AdvancedCondition[] = [
      { field: 'STATE', operator: '=', value: 'A' },
    ]

    if (debounceCustomer) {
      condition.push({
        field: 'FILTER',
        operator: 'LIKE',
        value: debounceCustomer,
      })
    }

    getCustomerPagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [debounceCustomer, getCustomerPagination])

  const handleSearchVehicles = useCallback(() => {
    const condition: AdvancedCondition[] = [
      { field: 'STATE', operator: '=', value: 'A' },
    ]

    if (watchedCustomerId) {
      condition.push({
        field: 'CUSTOMER_ID',
        operator: '=',
        value: Number(watchedCustomerId),
      })
    }

    if (debounceVehicle) {
      condition.push({
        field: 'FILTER',
        operator: 'LIKE',
        value: debounceVehicle,
      })
    }

    getVehiclePagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [debounceVehicle, getVehiclePagination, watchedCustomerId])

  const handleSearchTechnicians = useCallback(() => {
    const condition: AdvancedCondition[] = [
      { field: 'STATE', operator: '=', value: 'A' },
      { field: 'EMPLOYEE_TYPE', operator: '=', value: 'OPERACIONAL' },
    ]

    if (debounceTechnician) {
      condition.push({
        field: 'FILTER',
        operator: 'LIKE',
        value: debounceTechnician,
      })
    }

    getUserPagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [debounceTechnician, getUserPagination])

  useEffect(handleSearchCustomers, [handleSearchCustomers])
  useEffect(handleSearchVehicles, [handleSearchVehicles])
  useEffect(handleSearchTechnicians, [handleSearchTechnicians])

  useEffect(() => {
    const params = new URLSearchParams(location.search)

    if (params.get('action') !== 'create') {
      return
    }

    setSelectedWorkOrder(undefined)
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
    <CustomRow>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Estado registro'}
          name={['FILTER', 'STATE__IN']}
          labelCol={{ span: 24 }}
        >
          <CustomSelect
            placeholder={'Seleccionar estados'}
            mode={'multiple'}
            options={[
              { label: 'Activos', value: 'A' },
              { label: 'Inactivos', value: 'I' },
            ]}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24}>
        <CustomFormItem
          label={'Estado OT'}
          name={['FILTER', 'STATUS_ID__IN']}
          labelCol={{ span: 24 }}
        >
          <CustomSelect
            placeholder={'Seleccionar estados OT'}
            mode={'multiple'}
            options={statusOptions}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24}>
        <CustomFormItem
          label={'Cliente'}
          name={['FILTER', 'CUSTOMER_ID']}
          labelCol={{ span: 24 }}
        >
          <CustomSelect
            placeholder={'Seleccionar cliente'}
            showSearch
            onSearch={setSearchCustomerKey}
            options={customerOptions}
            allowClear
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24}>
        <CustomFormItem
          label={'Vehículo'}
          name={['FILTER', 'VEHICLE_ID']}
          labelCol={{ span: 24 }}
        >
          <CustomSelect
            placeholder={'Seleccionar vehículo'}
            showSearch
            onSearch={setSearchVehicleKey}
            options={vehicleOptions}
            allowClear
          />
        </CustomFormItem>
      </CustomCol>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Empleado'}
          name={['FILTER', 'TECHNICIAN_ID']}
          labelCol={{ span: 24 }}
        >
          <CustomSelect
            placeholder={'Seleccionar empleado'}
            showSearch
            onSearch={setSearchTechnicianKey}
            options={technicianOptions}
            allowClear
          />
        </CustomFormItem>
      </CustomCol>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Compromiso'}
          name={['FILTER', 'PROMISE_WINDOW']}
          labelCol={{ span: 24 }}
        >
          <CustomSelect
            style={{ minWidth: '18rem' }}
            placeholder={'Seleccionar ventana'}
            allowClear
            options={[
              { label: 'Vencidas (+24h de holgura)', value: 'OVERDUE_GRACE' },
              { label: 'Compromiso hoy', value: 'TODAY' },
              { label: 'Próximas 48 horas', value: 'NEXT_48H' },
            ]}
          />
        </CustomFormItem>
      </CustomCol>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Fecha promesa'}
          name={['FILTER', 'PROMISED_RANGE']}
          labelCol={{ span: 24 }}
        >
          <CustomRangePicker format={'YYYY-MM-DD'} allowClear />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )

  return (
    <>
      <CustomSpin
        spinning={
          isGetPending ||
          Boolean(isStatusListLoading) ||
          isGetCustomersPending ||
          isGetVehiclesPending ||
          isGetUsersPending
        }
      >
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nueva OT'}
            searchPlaceholder={'Buscar órdenes de trabajo...'}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedWorkOrder(undefined)
              setModalState(true)
            }}
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
