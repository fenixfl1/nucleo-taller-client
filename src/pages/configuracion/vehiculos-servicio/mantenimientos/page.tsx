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
import { useServiceVehicleMaintenanceStore } from 'src/store/service-vehicle-maintenance.store'
import { ServiceVehicleMaintenance } from 'src/services/service-vehicle-maintenances/service-vehicle-maintenance.types'
import ServiceVehicleMaintenanceList from './components/ServiceVehicleMaintenanceList'
import ServiceVehicleMaintenanceForm from './components/ServiceVehicleMaintenanceForm'
import { useGetServiceVehicleMaintenancePaginationMutation } from 'src/services/service-vehicle-maintenances/useGetServiceVehicleMaintenancePaginationMutation'
import { useUpdateServiceVehicleMaintenanceMutation } from 'src/services/service-vehicle-maintenances/useUpdateServiceVehicleMaintenanceMutation'
import { useGetServiceVehiclePaginationMutation } from 'src/services/service-vehicles/useGetServiceVehiclePaginationMutation'
import { useServiceVehicleStore } from 'src/store/service-vehicle.store'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
    STATUS__IN: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'],
  },
}

const Page: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [selectedItem, setSelectedItem] = useState<ServiceVehicleMaintenance>()
  const [modalState, setModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useServiceVehicleMaintenanceStore()
  const { serviceVehicleList } = useServiceVehicleStore()
  const { mutate: getPagination, isPending: isGetPending } =
    useGetServiceVehicleMaintenancePaginationMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateServiceVehicleMaintenanceMutation()
  const { mutate: getServiceVehiclePagination } =
    useGetServiceVehiclePaginationMutation()

  useEffect(() => {
    getServiceVehiclePagination({
      page: 1,
      size: 200,
      condition: [
        { field: 'STATE', operator: 'IN', value: ['A', 'I'] },
      ],
    })
  }, [getServiceVehiclePagination])

  const vehicleOptions = useMemo(() => serviceVehicleList, [serviceVehicleList])

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

  const handleUpdate = (item: ServiceVehicleMaintenance, patch: Partial<ServiceVehicleMaintenance>) => {
    const content = patch.STATUS
      ? 'Seguro que desea actualizar el estado operativo del mantenimiento?'
      : 'Seguro que desea cambiar el estado del registro?'

    modal.confirm({
      title: 'Confirmación',
      content,
      onOk: async () => {
        try {
          await updateRow({
            SERVICE_VEHICLE_MAINTENANCE_ID: item.SERVICE_VEHICLE_MAINTENANCE_ID,
            STATUS: patch.STATUS,
            STATE: patch.STATE as 'A' | 'I' | undefined,
          })

          notification.success({
            message: 'Operación exitosa',
            description: 'El mantenimiento fue actualizado con éxito.',
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
            { label: 'Pendiente', value: 'PENDIENTE' },
            { label: 'En proceso', value: 'EN_PROCESO' },
            { label: 'Completado', value: 'COMPLETADO' },
            { label: 'Cancelado', value: 'CANCELADO' },
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
    </CustomRow>
  )

  return (
    <>
      <CustomSpin spinning={isGetPending || isUpdatePending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nuevo mantenimiento'}
            searchPlaceholder={'Buscar mantenimientos...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedItem(undefined)
              toggleModal()
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <ServiceVehicleMaintenanceList
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
        <ServiceVehicleMaintenanceForm
          maintenance={selectedItem}
          vehicleOptions={vehicleOptions}
          open={modalState}
          onClose={toggleModal}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>
    </>
  )
}

export default Page
