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
import { useVehicleStore } from 'src/store/vehicle.store'
import { Vehicle } from 'src/services/vehicles/vehicle.types'
import VehicleList from './components/VehicleList'
import VehicleForm from './components/VehicleForm'
import { useGetVehiclePaginationMutation } from 'src/services/vehicles/useGetVehiclePaginationMutation'
import { useUpdateVehicleMutation } from 'src/services/vehicles/useUpdateVehicleMutation'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
  },
}

const VehiclePage: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>()
  const [modalState, setModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useVehicleStore()

  const { mutate: getVehiclePagination, isPending: isGetPending } =
    useGetVehiclePaginationMutation()
  const { mutateAsync: updateVehicle, isPending: isUpdatePending } =
    useUpdateVehicleMutation()

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
      getVehiclePagination({ page, size, condition: [...condition, ...filter] })
    },
    [debounce, form, getVehiclePagination, metadata, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModal = () => setModalState((prev) => !prev)

  const handleChangeState = (vehicle: Vehicle) => {
    modal.confirm({
      title: 'Confirmación',
      content: 'Seguro que desea cambiar el estado del vehículo?',
      onOk: async () => {
        try {
          await updateVehicle({
            VEHICLE_ID: vehicle.VEHICLE_ID,
            STATE: vehicle.STATE === 'A' ? 'I' : 'A',
          })

          notification.success({
            message: 'Operación exitosa',
            description: 'El estado del vehículo fue actualizado con éxito.',
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
            createText={'Nuevo Vehículo'}
            searchPlaceholder={'Buscar vehículos...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedVehicle(undefined)
              toggleModal()
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <VehicleList
            onChange={handleSearch}
            onUpdate={handleChangeState}
            onEdit={(record) => {
              setSelectedVehicle(record)
              toggleModal()
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <VehicleForm
          vehicle={selectedVehicle}
          open={modalState}
          onClose={toggleModal}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>
    </>
  )
}

export default VehiclePage
