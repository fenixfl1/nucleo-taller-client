import React, { useCallback, useEffect, useState } from 'react'
import { Form, Modal } from 'antd'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import { useAppNotification } from 'src/context/NotificationContext'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { Customer } from 'src/services/customers/customer.types'
import { useGetCustomerPaginationMutation } from 'src/services/customers/useGetCustomerPaginationMutation'
import { useCreateVehicleMutation } from 'src/services/vehicles/useCreateVehicleMutation'
import { useUpdateVehicleMutation } from 'src/services/vehicles/useUpdateVehicleMutation'
import { Vehicle } from 'src/services/vehicles/vehicle.types'
import { useCustomerStore } from 'src/store/customer.store'
import { AdvancedCondition } from 'src/types/general'
import useDebounce from 'src/hooks/use-debounce'

interface VehicleFormProps {
  open?: boolean
  vehicle?: Vehicle
  onClose?: () => void
  onSuccess?: () => void
  onSaved?: (vehicle: Vehicle) => void
  defaultCustomerId?: number
  disableCustomerSelection?: boolean
}

type VehicleFormValues = {
  CUSTOMER_ID: number
  PLATE?: string
  VIN?: string
  BRAND: string
  MODEL: string
  YEAR?: number | null
  COLOR?: string
  ENGINE?: string
  NOTES?: string
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  open,
  vehicle,
  onClose,
  onSuccess,
  onSaved,
  defaultCustomerId,
  disableCustomerSelection = false,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<VehicleFormValues>()
  const [searchCustomerKey, setSearchCustomerKey] = useState('')
  const debounceCustomer = useDebounce(searchCustomerKey)

  const { customerList } = useCustomerStore()

  const { mutate: getCustomerPagination, isPending: isGetCustomersPending } =
    useGetCustomerPaginationMutation()
  const { mutateAsync: createVehicle, isPending: isCreatePending } =
    useCreateVehicleMutation()
  const { mutateAsync: updateVehicle, isPending: isUpdatePending } =
    useUpdateVehicleMutation()

  const handleSearchCustomers = useCallback(() => {
    const condition: AdvancedCondition<Customer>[] = [
      {
        field: 'STATE' as never,
        operator: '=',
        value: 'A',
      },
    ]

    if (debounceCustomer) {
      condition.push({
        field: ['NAME', 'LAST_NAME', 'IDENTITY_DOCUMENT'] as never,
        operator: 'LIKE',
        value: debounceCustomer,
      })
    }

    getCustomerPagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [debounceCustomer, getCustomerPagination])

  useEffect(handleSearchCustomers, [handleSearchCustomers])

  useEffect(() => {
    if (vehicle) {
      form.setFieldsValue({
        CUSTOMER_ID: vehicle.CUSTOMER_ID,
        PLATE: vehicle.PLATE,
        VIN: vehicle.VIN,
        BRAND: vehicle.BRAND,
        MODEL: vehicle.MODEL,
        YEAR: vehicle.YEAR,
        COLOR: vehicle.COLOR,
        ENGINE: vehicle.ENGINE,
        NOTES: vehicle.NOTES,
      })
      return
    }

    form.resetFields()
    form.setFieldsValue({
      CUSTOMER_ID: defaultCustomerId,
    })
  }, [defaultCustomerId, form, vehicle, open])

  const handleCancel = () => {
    form.resetFields()
    onClose?.()
  }

  const handleClose = () => {
    modal.confirm({
      onOk: handleCancel,
      title: 'Confirmación',
      content:
        'Si cierra la ventana perderá cualquier información que haya introducido.',
    })
  }

  const handleFinish = async () => {
    try {
      const values = await form.validateFields()

      const payload = {
        ...values,
        PLATE: values.PLATE?.trim().toUpperCase() || '',
        VIN: values.VIN?.trim().toUpperCase() || '',
        BRAND: values.BRAND?.trim(),
        MODEL: values.MODEL?.trim(),
        COLOR: values.COLOR?.trim(),
        ENGINE: values.ENGINE?.trim(),
        NOTES: values.NOTES?.trim(),
      }

      let description = 'Vehículo registrado exitosamente.'
      let savedVehicle: Vehicle

      if (vehicle?.VEHICLE_ID) {
        savedVehicle = await updateVehicle({
          ...payload,
          VEHICLE_ID: vehicle.VEHICLE_ID,
        })
        description = 'Vehículo actualizado exitosamente.'
      } else {
        savedVehicle = await createVehicle(payload)
      }

      notification({
        message: 'Operación exitosa',
        description,
      })
      onSaved?.(savedVehicle)
      onSuccess?.()
      handleCancel()
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <>
      <CustomModal
        width={'65%'}
        closable
        title={'Formulario de vehículo'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin
          spinning={isCreatePending || isUpdatePending || isGetCustomersPending}
        >
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomDivider>
                <CustomTitle level={5}>Datos del Vehículo</CustomTitle>
              </CustomDivider>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Cliente'}
                  name={'CUSTOMER_ID'}
                  rules={[{ required: true }]}
                  {...labelColFullWidth}
                >
                  <CustomSelect
                    disabled={disableCustomerSelection}
                    placeholder={'Seleccionar cliente'}
                    onSearch={setSearchCustomerKey}
                    options={customerList.map((customer) => ({
                      value: customer.PERSON_ID,
                      label:
                        `${customer.NAME} ${customer.LAST_NAME || ''}`.trim(),
                    }))}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Placa'} name={'PLATE'} uppercase>
                  <CustomInput placeholder={'Placa'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'VIN / Chasis'} name={'VIN'} uppercase>
                  <CustomInput placeholder={'VIN o chasis'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Marca'}
                  name={'BRAND'}
                  rules={[{ required: true }]}
                >
                  <CustomInput placeholder={'Marca'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Modelo'}
                  name={'MODEL'}
                  rules={[{ required: true }]}
                >
                  <CustomInput placeholder={'Modelo'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Año'} name={'YEAR'}>
                  <CustomInputNumber
                    style={{ width: '100%' }}
                    format={{ format: 'default' }}
                    min={1900}
                    max={2100}
                    precision={0}
                    placeholder={'Año'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Color'} name={'COLOR'}>
                  <CustomInput placeholder={'Color'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Motor'} name={'ENGINE'}>
                  <CustomInput placeholder={'Motor'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Notas'}
                  name={'NOTES'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Observaciones del vehículo'} />
                </CustomFormItem>
              </CustomCol>
            </CustomRow>
          </CustomForm>
        </CustomSpin>
      </CustomModal>
      {contextHolder}
    </>
  )
}

export default VehicleForm
