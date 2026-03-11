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
import { useGetWorkOrderStatusPaginationMutation } from 'src/services/work-order-statuses/useGetWorkOrderStatusPaginationMutation'
import { useUpdateWorkOrderStatusMutation } from 'src/services/work-order-statuses/useUpdateWorkOrderStatusMutation'
import { WorkOrderStatusCatalog } from 'src/services/work-order-statuses/work-order-status.types'
import { useWorkOrderStatusStore } from 'src/store/work-order-status.store'
import WorkOrderStatusForm from './components/WorkOrderStatusForm'
import WorkOrderStatusList from './components/WorkOrderStatusList'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
  },
}

const protectedCodes = [
  'CREADA',
  'DIAGNOSTICO',
  'REPARACION',
  'LISTA_ENTREGA',
  'ENTREGADA',
  'CANCELADA',
]

const EstadosOtPage: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [selectedItem, setSelectedItem] = useState<WorkOrderStatusCatalog>()
  const [modalState, setModalState] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useWorkOrderStatusStore()
  const { mutate: getPagination, isPending: isGetPending } =
    useGetWorkOrderStatusPaginationMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateWorkOrderStatusMutation()

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

  const handleChangeState = (record: WorkOrderStatusCatalog) => {
    if (protectedCodes.includes(record.CODE)) {
      notification.warning({
        message: 'Operación no permitida',
        description:
          'Los estados protegidos del sistema no pueden inactivarse.',
      })
      return
    }

    modal.confirm({
      title: 'Confirmación',
      content: 'Seguro que desea cambiar el estado del estado OT?',
      onOk: async () => {
        try {
          await updateRow({
            STATUS_ID: record.STATUS_ID,
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
            createText={'Nuevo Estado'}
            searchPlaceholder={'Buscar estados OT...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedItem(undefined)
              setModalState(true)
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <WorkOrderStatusList
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
        <WorkOrderStatusForm
          open={modalState}
          statusRow={selectedItem}
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

export default EstadosOtPage
