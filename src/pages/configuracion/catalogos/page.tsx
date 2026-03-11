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
import { useGetWorkOrderServiceTypePaginationMutation } from 'src/services/work-order-service-types/useGetWorkOrderServiceTypePaginationMutation'
import { useUpdateWorkOrderServiceTypeMutation } from 'src/services/work-order-service-types/useUpdateWorkOrderServiceTypeMutation'
import { WorkOrderServiceType } from 'src/services/work-order-service-types/work-order-service-type.types'
import { useWorkOrderServiceTypeStore } from 'src/store/work-order-service-type.store'
import WorkOrderServiceTypeForm from './components/WorkOrderServiceTypeForm'
import WorkOrderServiceTypeList from './components/WorkOrderServiceTypeList'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
  },
}

const CatalogosPage: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [selectedItem, setSelectedItem] = useState<WorkOrderServiceType>()
  const [modalState, setModalState] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useWorkOrderServiceTypeStore()
  const { mutate: getPagination, isPending: isGetPending } =
    useGetWorkOrderServiceTypePaginationMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateWorkOrderServiceTypeMutation()

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
    [debounce, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  const handleChangeState = (record: WorkOrderServiceType) => {
    modal.confirm({
      title: 'Confirmación',
      content: 'Seguro que desea cambiar el estado del tipo de servicio?',
      onOk: async () => {
        try {
          await updateRow({
            SERVICE_TYPE_ID: record.SERVICE_TYPE_ID,
            STATE: record.STATE === 'A' ? 'I' : 'A',
          })

          notification.success({
            message: 'Operación exitosa',
            description: 'El estado fue actualizado correctamente.',
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
            createText={'Nuevo Tipo'}
            searchPlaceholder={'Buscar tipos de servicio...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedItem(undefined)
              setModalState(true)
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <WorkOrderServiceTypeList
            onChange={handleSearch}
            onUpdate={handleChangeState}
            onEdit={(record) => {
              setSelectedItem(record)
              setModalState(true)
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <WorkOrderServiceTypeForm
          open={modalState}
          serviceType={selectedItem}
          onClose={() => {
            setModalState(false)
            setSelectedItem(undefined)
          }}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>
    </>
  )
}

export default CatalogosPage
