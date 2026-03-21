import React, { useEffect } from 'react'
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
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import { useAppNotification } from 'src/context/NotificationContext'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { ServiceVehicle } from 'src/services/service-vehicles/service-vehicle.types'
import { useCreateServiceVehicleMutation } from 'src/services/service-vehicles/useCreateServiceVehicleMutation'
import { useUpdateServiceVehicleMutation } from 'src/services/service-vehicles/useUpdateServiceVehicleMutation'

interface ServiceVehicleFormProps {
  open?: boolean
  serviceVehicle?: ServiceVehicle
  onClose?: () => void
  onSuccess?: () => void
}

type ServiceVehicleFormValues = {
  NAME: string
  PLATE?: string
  VIN?: string
  BRAND: string
  MODEL: string
  YEAR?: number | null
  COLOR?: string
  ENGINE?: string
  NOTES?: string
}

const ServiceVehicleForm: React.FC<ServiceVehicleFormProps> = ({
  open,
  serviceVehicle,
  onClose,
  onSuccess,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<ServiceVehicleFormValues>()

  const { mutateAsync: createRow, isPending: isCreatePending } =
    useCreateServiceVehicleMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateServiceVehicleMutation()

  useEffect(() => {
    if (serviceVehicle) {
      form.setFieldsValue({
        NAME: serviceVehicle.NAME,
        PLATE: serviceVehicle.PLATE,
        VIN: serviceVehicle.VIN,
        BRAND: serviceVehicle.BRAND,
        MODEL: serviceVehicle.MODEL,
        YEAR: serviceVehicle.YEAR,
        COLOR: serviceVehicle.COLOR,
        ENGINE: serviceVehicle.ENGINE,
        NOTES: serviceVehicle.NOTES,
      })
      return
    }

    form.resetFields()
  }, [form, open, serviceVehicle])

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
        NAME: values.NAME?.trim(),
        PLATE: values.PLATE?.trim().toUpperCase() || '',
        VIN: values.VIN?.trim().toUpperCase() || '',
        BRAND: values.BRAND?.trim(),
        MODEL: values.MODEL?.trim(),
        COLOR: values.COLOR?.trim(),
        ENGINE: values.ENGINE?.trim(),
        NOTES: values.NOTES?.trim(),
      }

      let description = 'Vehículo de servicio registrado exitosamente.'

      if (serviceVehicle?.SERVICE_VEHICLE_ID) {
        await updateRow({
          ...payload,
          SERVICE_VEHICLE_ID: serviceVehicle.SERVICE_VEHICLE_ID,
        })
        description = 'Vehículo de servicio actualizado exitosamente.'
      } else {
        await createRow(payload)
      }

      notification({
        message: 'Operación exitosa',
        description,
      })
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
        title={'Formulario de vehículo de servicio'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin spinning={isCreatePending || isUpdatePending}>
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomDivider>
                <CustomTitle level={5}>Datos del vehículo</CustomTitle>
              </CustomDivider>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Nombre interno'}
                  name={'NAME'}
                  rules={[{ required: true }]}
                  {...labelColFullWidth}
                >
                  <CustomInput placeholder={'Ej. Camioneta taller 01'} />
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

export default ServiceVehicleForm
