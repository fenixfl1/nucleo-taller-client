import React, { useCallback, useEffect, useState } from 'react'
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
import { useServiceVehicleStore } from 'src/store/service-vehicle.store'
import { ServiceVehicle } from 'src/services/service-vehicles/service-vehicle.types'
import ServiceVehicleList from './components/ServiceVehicleList'
import ServiceVehicleForm from './components/ServiceVehicleForm'
import { useGetServiceVehiclePaginationMutation } from 'src/services/service-vehicles/useGetServiceVehiclePaginationMutation'
import { useUpdateServiceVehicleMutation } from 'src/services/service-vehicles/useUpdateServiceVehicleMutation'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
  },
}

const Page: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [selectedItem, setSelectedItem] = useState<ServiceVehicle>()
  const [modalState, setModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useServiceVehicleStore()
  const { mutate: getPagination, isPending: isGetPending } =
    useGetServiceVehiclePaginationMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateServiceVehicleMutation()

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

  const handleChangeState = (serviceVehicle: ServiceVehicle) => {
    modal.confirm({
      title: 'Confirmación',
      content: 'Seguro que desea cambiar el estado del vehículo de servicio?',
      onOk: async () => {
        try {
          await updateRow({
            SERVICE_VEHICLE_ID: serviceVehicle.SERVICE_VEHICLE_ID,
            STATE: serviceVehicle.STATE === 'A' ? 'I' : 'A',
          })

          notification.success({
            message: 'Operación exitosa',
            description:
              'El estado del vehículo de servicio fue actualizado con éxito.',
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
      <CustomSpin spinning={isGetPending || isUpdatePending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nuevo vehículo'}
            searchPlaceholder={'Buscar vehículos de servicio...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedItem(undefined)
              toggleModal()
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <ServiceVehicleList
            onChange={handleSearch}
            onUpdate={handleChangeState}
            onEdit={(record) => {
              setSelectedItem(record)
              toggleModal()
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <ServiceVehicleForm
          serviceVehicle={selectedItem}
          open={modalState}
          onClose={toggleModal}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>
    </>
  )
}

export default Page
