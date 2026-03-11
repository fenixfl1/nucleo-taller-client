import React, { useCallback, useEffect, useState } from 'react'
import { Form } from 'antd'
import SearchBar from 'src/components/SearchBar'
import useDebounce from 'src/hooks/use-debounce'
import CustomCard from 'src/components/custom/CustomCard'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { AdvancedCondition } from 'src/types/general'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomRow from 'src/components/custom/CustomRow'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomSelect from 'src/components/custom/CustomSelect'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { useActivityLogStore } from 'src/store/activity-log.store'
import { ActivityLogEntry } from 'src/services/activity-logs/activity-log.types'
import { useGetActivityLogPaginationMutation } from 'src/services/activity-logs/useGetActivityLogPaginationMutation'
import ActivityLogList from './components/ActivityLogList'
import ActivityLogDetailDrawer from './components/ActivityLogDetailDrawer'

const initialFilter = {
  FILTER: {},
}

const actionOptions = [
  { label: 'Inserciones', value: 'INSERT' },
  { label: 'Actualizaciones', value: 'UPDATE' },
  { label: 'Eliminaciones', value: 'DELETE' },
]

const ActivityLogPage: React.FC = () => {
  const [form] = Form.useForm()
  const [detailState, setDetailState] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry>()
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useActivityLogStore()
  const { mutate: getActivityLogPagination, isPending: isGetPending } =
    useGetActivityLogPaginationMutation()

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
      getActivityLogPagination({
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
        label={'Acción'}
        name={['FILTER', 'ACTION__IN']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '15rem' }}
          placeholder={'Seleccionar acciones'}
          mode={'multiple'}
          options={actionOptions}
        />
      </CustomFormItem>

      <CustomFormItem
        label={'Entidad'}
        name={['FILTER', 'MODEL__LIKE']}
        labelCol={{ span: 24 }}
      >
        <CustomInput placeholder={'Ej. WorkOrder'} />
      </CustomFormItem>
    </CustomRow>
  )

  return (
    <>
      <CustomSpin spinning={isGetPending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Actualizar'}
            searchPlaceholder={'Buscar en bitácora...'}
            onSearch={setSearchKey}
            onCreate={() => handleSearch(1, metadata.pageSize)}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch(1, metadata.pageSize)}
          />

          <ActivityLogList
            onChange={handleSearch}
            onView={(activityLog) => {
              setSelectedLog(activityLog)
              setDetailState(true)
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={detailState}>
        <ActivityLogDetailDrawer
          activityLogId={selectedLog?.ID}
          open={detailState}
          onClose={() => {
            setDetailState(false)
            setSelectedLog(undefined)
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default ActivityLogPage
