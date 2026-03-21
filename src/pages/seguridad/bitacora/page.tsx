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
import CustomInput from 'src/components/custom/CustomInput'
import CustomSelect from 'src/components/custom/CustomSelect'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { useActivityLogStore } from 'src/store/activity-log.store'
import { ActivityLogEntry } from 'src/services/activity-logs/activity-log.types'
import { useGetActivityLogPaginationMutation } from 'src/services/activity-logs/useGetActivityLogPaginationMutation'
import { useGetUserPaginationMutation } from 'src/services/users/useGetUserPaginationMutation'
import { useUserStore } from 'src/store/user.store'
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

const employeeTypeOptions = [
  { label: 'Operacional', value: 'OPERACIONAL' },
  { label: 'Administrativo', value: 'ADMINISTRATIVO' },
]

const ActivityLogPage: React.FC = () => {
  const [form] = Form.useForm()
  const [detailState, setDetailState] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry>()
  const [searchKey, setSearchKey] = useState('')
  const [searchEmployeeKey, setSearchEmployeeKey] = useState('')
  const debounce = useDebounce(searchKey)
  const debounceEmployee = useDebounce(searchEmployeeKey)

  const { metadata } = useActivityLogStore()
  const { userList } = useUserStore()
  const { mutate: getActivityLogPagination, isPending: isGetPending } =
    useGetActivityLogPaginationMutation()
  const { mutate: getUserPagination, isPending: isGetUsersPending } =
    useGetUserPaginationMutation()
  const watchedEmployeeTypes = Form.useWatch(['FILTER', 'EMPLOYEE_TYPE__IN'], form)

  const employeeOptions = useMemo(
    () =>
      userList.map((user) => ({
        label: `${user.NAME} ${user.LAST_NAME || ''} (@${user.USERNAME})`.trim(),
        value: user.STAFF_ID,
      })),
    [userList]
  )

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

  const handleSearchEmployees = useCallback(() => {
    const condition: AdvancedCondition[] = [
      { field: 'STATE', operator: 'IN', value: ['A'] },
    ]

    if (debounceEmployee) {
      condition.push({
        field: 'FILTER',
        operator: 'LIKE',
        value: debounceEmployee,
      })
    }

    if (watchedEmployeeTypes?.length) {
      condition.push({
        field: 'EMPLOYEE_TYPE',
        operator: 'IN',
        value: watchedEmployeeTypes,
      })
    }

    getUserPagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [debounceEmployee, getUserPagination, watchedEmployeeTypes])

  useEffect(handleSearchEmployees, [handleSearchEmployees])

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

      <CustomFormItem
        label={'Tipo de empleado'}
        name={['FILTER', 'EMPLOYEE_TYPE__IN']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '15rem' }}
          placeholder={'Seleccionar tipos'}
          mode={'multiple'}
          options={employeeTypeOptions}
        />
      </CustomFormItem>

      <CustomFormItem
        label={'Empleado'}
        name={['FILTER', 'STAFF_ID']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '18rem' }}
          placeholder={'Seleccionar empleado'}
          showSearch
          onSearch={setSearchEmployeeKey}
          options={employeeOptions}
          allowClear
          loading={isGetUsersPending}
          filterOption={false}
        />
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
