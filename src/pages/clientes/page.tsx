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
import { useCustomerStore } from 'src/store/customer.store'
import CustomerList from './components/CustomerList'
import CustomerForm from './components/CustomerForm'
import { Customer } from 'src/services/customers/customer.types'
import { useGetCustomerPaginationMutation } from 'src/services/customers/useGetCustomerPaginationMutation'
import { useUpdateCustomerMutation } from 'src/services/customers/useUpdateCustomerMutation'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
  },
}

const CustomerPage: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>()
  const [modalState, setModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useCustomerStore()

  const { mutate: getCustomerPagination, isPending: isGetPending } =
    useGetCustomerPaginationMutation()
  const { mutateAsync: updateCustomer, isPending: isUpdatePending } =
    useUpdateCustomerMutation()

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
      getCustomerPagination({ page, size, condition: [...condition, ...filter] })
    },
    [debounce, form, getCustomerPagination, metadata, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModal = () => setModalState((prev) => !prev)

  const handleChangeState = (customer: Customer) => {
    modal.confirm({
      title: 'Confirmación',
      content: 'Seguro que desea cambiar el estado del cliente?',
      onOk: async () => {
        try {
          await updateCustomer({
            CUSTOMER_ID: customer.PERSON_ID,
            STATE: customer.STATE === 'A' ? 'I' : 'A',
          })

          notification.success({
            message: 'Operación exitosa',
            description: 'El estado del cliente fue actualizado con éxito.',
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
            createText={'Nuevo Cliente'}
            searchPlaceholder={'Buscar clientes...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedCustomer(undefined)
              toggleModal()
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <CustomerList
            onChange={handleSearch}
            onUpdate={handleChangeState}
            onEdit={(record) => {
              setSelectedCustomer(record)
              toggleModal()
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <CustomerForm
          customer={selectedCustomer}
          open={modalState}
          onClose={toggleModal}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>
    </>
  )
}

export default CustomerPage
