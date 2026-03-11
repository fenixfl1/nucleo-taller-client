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
import { useInventoryMovementStore } from 'src/store/inventory-movement.store'
import { InventoryMovement } from 'src/services/inventory-movements/inventory-movement.types'
import { useGetInventoryMovementPaginationMutation } from 'src/services/inventory-movements/useGetInventoryMovementPaginationMutation'
import { useGetInventoryMovementTypeListQuery } from 'src/services/inventory-movements/useGetInventoryMovementTypeListQuery'
import InventoryMovementDetailDrawer from './components/InventoryMovementDetailDrawer'
import InventoryMovementForm from './components/InventoryMovementForm'
import InventoryMovementList from './components/InventoryMovementList'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A'],
  },
}

const InventoryMovementsPage: React.FC = () => {
  const [form] = Form.useForm()
  const [modalState, setModalState] = useState(false)
  const [detailState, setDetailState] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement>()
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useInventoryMovementStore()
  const { mutate: getInventoryMovementPagination, isPending: isGetPending } =
    useGetInventoryMovementPaginationMutation()
  const { data: movementTypes = [], isLoading: isTypeListLoading } =
    useGetInventoryMovementTypeListQuery()

  const movementTypeOptions = useMemo(
    () =>
      movementTypes.map((item) => ({
        label: item.NAME,
        value: item.CODE,
      })),
    [movementTypes]
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
      getInventoryMovementPagination({
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
        label={'Tipo'}
        name={['FILTER', 'MOVEMENT_TYPE__IN']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '20rem' }}
          placeholder={'Seleccionar tipos'}
          mode={'multiple'}
          options={movementTypeOptions}
        />
      </CustomFormItem>
    </CustomRow>
  )

  return (
    <>
      <CustomSpin spinning={isGetPending || Boolean(isTypeListLoading)}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nuevo Movimiento'}
            searchPlaceholder={'Buscar movimientos...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedMovement(undefined)
              setModalState(true)
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <InventoryMovementList
            onChange={handleSearch}
            onView={(movement) => {
              setSelectedMovement(movement)
              setDetailState(true)
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <InventoryMovementForm
          open={modalState}
          onClose={() => setModalState(false)}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>

      <ConditionalComponent condition={detailState}>
        <InventoryMovementDetailDrawer
          movementId={selectedMovement?.MOVEMENT_ID}
          open={detailState}
          onClose={() => {
            setDetailState(false)
            setSelectedMovement(undefined)
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default InventoryMovementsPage
