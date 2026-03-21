import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Form } from 'antd'
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
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useServiceVehicleUsageStore } from 'src/store/service-vehicle-usage.store'
import { ServiceVehicleUsage } from 'src/services/service-vehicle-usages/service-vehicle-usage.types'
import ServiceVehicleUsageList from './components/ServiceVehicleUsageList'
import ServiceVehicleUsageForm from './components/ServiceVehicleUsageForm'
import { useGetServiceVehicleUsagePaginationMutation } from 'src/services/service-vehicle-usages/useGetServiceVehicleUsagePaginationMutation'
import { useUpdateServiceVehicleUsageMutation } from 'src/services/service-vehicle-usages/useUpdateServiceVehicleUsageMutation'
import { useGetServiceVehiclePaginationMutation } from 'src/services/service-vehicles/useGetServiceVehiclePaginationMutation'
import { useServiceVehicleStore } from 'src/store/service-vehicle.store'
import { useGetUserPaginationMutation } from 'src/services/users/useGetUserPaginationMutation'
import { useUserStore } from 'src/store/user.store'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
    STATUS__IN: ['EN_CURSO', 'FINALIZADA', 'CANCELADA'],
  },
}

const Page: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [selectedItem, setSelectedItem] = useState<ServiceVehicleUsage>()
  const [modalState, setModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useServiceVehicleUsageStore()
  const { serviceVehicleList } = useServiceVehicleStore()
  const { userList } = useUserStore()
  const { mutate: getPagination, isPending: isGetPending } =
    useGetServiceVehicleUsagePaginationMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateServiceVehicleUsageMutation()
  const { mutate: getServiceVehiclePagination } =
    useGetServiceVehiclePaginationMutation()
  const { mutate: getUserPagination } = useGetUserPaginationMutation()

  useEffect(() => {
    getServiceVehiclePagination({
      page: 1,
      size: 200,
      condition: [{ field: 'STATE', operator: 'IN', value: ['A', 'I'] }],
    })
    getUserPagination({
      page: 1,
      size: 200,
      condition: [
        { field: 'STATE', operator: 'IN', value: ['A'] },
        {
          field: 'EMPLOYEE_TYPE',
          operator: 'IN',
          value: ['OPERACIONAL', 'ADMINISTRATIVO'],
        },
      ],
    })
  }, [getServiceVehiclePagination, getUserPagination])

  const vehicleOptions = useMemo(() => serviceVehicleList, [serviceVehicleList])
  const employeeOptions = useMemo(() => userList, [userList])

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
      getPagination({ page, size, condition: [...condition, ...filter] })
    },
    [debounce, form, getPagination, metadata.currentPage, metadata.pageSize, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModal = () => setModalState((prev) => !prev)

  const handleUpdate = (item: ServiceVehicleUsage, patch: Partial<ServiceVehicleUsage>) => {
    const content = patch.STATUS
      ? 'Seguro que desea actualizar el estado operativo de la salida?'
      : 'Seguro que desea cambiar el estado del registro?'

    modal.confirm({
      title: 'Confirmación',
      content,
      onOk: async () => {
        try {
          await updateRow({
            SERVICE_VEHICLE_USAGE_ID: item.SERVICE_VEHICLE_USAGE_ID,
            STATUS: patch.STATUS,
            STATE: patch.STATE as 'A' | 'I' | undefined,
          })

          notification.success({
            message: 'Operación exitosa',
            description: 'La salida/uso fue actualizada con éxito.',
          })

          handleSearch()
        } catch (error) {
          errorHandler(error)
        }
      },
    })
  }

  const filterContent = (
    <CustomRow width={'100%'}>
      <CustomFormItem label={'Registro'} name={['FILTER', 'STATE__IN']} labelCol={{ span: 24 }}>
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

      <CustomFormItem label={'Estado'} name={['FILTER', 'STATUS__IN']} labelCol={{ span: 24 }}>
        <CustomSelect
          style={{ minWidth: '15rem' }}
          placeholder={'Seleccionar estado'}
          mode={'multiple'}
          options={[
            { label: 'En curso', value: 'EN_CURSO' },
            { label: 'Finalizadas', value: 'FINALIZADA' },
            { label: 'Canceladas', value: 'CANCELADA' },
          ]}
        />
      </CustomFormItem>

      <CustomFormItem label={'Vehículo'} name={['FILTER', 'SERVICE_VEHICLE_ID__IN']} labelCol={{ span: 24 }}>
        <CustomSelect
          style={{ minWidth: '18rem' }}
          placeholder={'Seleccionar vehículos'}
          mode={'multiple'}
          options={vehicleOptions.map((item) => ({
            label: `${item.NAME} · ${item.PLATE || item.VIN || `${item.BRAND} ${item.MODEL}`}`.trim(),
            value: item.SERVICE_VEHICLE_ID,
          }))}
        />
      </CustomFormItem>

      <CustomFormItem label={'Empleado'} name={['FILTER', 'STAFF_ID__IN']} labelCol={{ span: 24 }}>
        <CustomSelect
          style={{ minWidth: '18rem' }}
          placeholder={'Seleccionar empleados'}
          mode={'multiple'}
          options={employeeOptions.map((item) => ({
            label: `${item.NAME} ${item.LAST_NAME}${item.USERNAME ? ` (@${item.USERNAME})` : ''}`.trim(),
            value: item.STAFF_ID,
          }))}
        />
      </CustomFormItem>
    </CustomRow>
  )

  return (
    <>
      <CustomSpin spinning={isGetPending || isUpdatePending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nueva salida'}
            searchPlaceholder={'Buscar salidas o usos...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedItem(undefined)
              toggleModal()
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <ServiceVehicleUsageList
            onChange={handleSearch}
            onUpdate={handleUpdate}
            onEdit={(record) => {
              setSelectedItem(record)
              toggleModal()
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <ServiceVehicleUsageForm
          usage={selectedItem}
          vehicleOptions={vehicleOptions}
          employeeOptions={employeeOptions}
          open={modalState}
          onClose={toggleModal}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>
    </>
  )
}

export default Page
