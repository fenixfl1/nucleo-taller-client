import React, { useEffect } from 'react'
import dayjs from 'dayjs'
import { Form, Modal } from 'antd'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
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
import { ServiceVehicle } from 'src/services/service-vehicles/service-vehicle.types'
import { User } from 'src/services/users/users.types'
import {
  ServiceVehicleUsage,
  ServiceVehicleUsageStatus,
} from 'src/services/service-vehicle-usages/service-vehicle-usage.types'
import { useCreateServiceVehicleUsageMutation } from 'src/services/service-vehicle-usages/useCreateServiceVehicleUsageMutation'
import { useUpdateServiceVehicleUsageMutation } from 'src/services/service-vehicle-usages/useUpdateServiceVehicleUsageMutation'

interface ServiceVehicleUsageFormProps {
  open?: boolean
  usage?: ServiceVehicleUsage
  vehicleOptions?: ServiceVehicle[]
  employeeOptions?: User[]
  onClose?: () => void
  onSuccess?: () => void
}

type ServiceVehicleUsageFormValues = {
  SERVICE_VEHICLE_ID: number
  STAFF_ID?: number | null
  STATUS: ServiceVehicleUsageStatus
  PURPOSE: string
  ORIGIN?: string
  DESTINATION?: string
  STARTED_AT: dayjs.Dayjs
  ENDED_AT?: dayjs.Dayjs
  ODOMETER_START?: number | null
  ODOMETER_END?: number | null
  NOTES?: string
}

const statusOptions = [
  { label: 'En curso', value: 'EN_CURSO' },
  { label: 'Finalizada', value: 'FINALIZADA' },
  { label: 'Cancelada', value: 'CANCELADA' },
]

const ServiceVehicleUsageForm: React.FC<ServiceVehicleUsageFormProps> = ({
  open,
  usage,
  vehicleOptions = [],
  employeeOptions = [],
  onClose,
  onSuccess,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<ServiceVehicleUsageFormValues>()
  const watchedStatus = Form.useWatch('STATUS', form)

  const { mutateAsync: createRow, isPending: isCreatePending } =
    useCreateServiceVehicleUsageMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateServiceVehicleUsageMutation()

  useEffect(() => {
    if (usage) {
      form.setFieldsValue({
        SERVICE_VEHICLE_ID: usage.SERVICE_VEHICLE_ID,
        STAFF_ID: usage.STAFF_ID ?? undefined,
        STATUS: usage.STATUS,
        PURPOSE: usage.PURPOSE,
        ORIGIN: usage.ORIGIN,
        DESTINATION: usage.DESTINATION,
        STARTED_AT: usage.STARTED_AT ? dayjs(usage.STARTED_AT) : dayjs(),
        ENDED_AT: usage.ENDED_AT ? dayjs(usage.ENDED_AT) : undefined,
        ODOMETER_START: usage.ODOMETER_START,
        ODOMETER_END: usage.ODOMETER_END,
        NOTES: usage.NOTES,
      })
      return
    }

    form.resetFields()
    form.setFieldsValue({
      STATUS: 'EN_CURSO',
      STARTED_AT: dayjs(),
    })
  }, [form, open, usage])

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
        PURPOSE: values.PURPOSE?.trim(),
        ORIGIN: values.ORIGIN?.trim() || null,
        DESTINATION: values.DESTINATION?.trim() || null,
        NOTES: values.NOTES?.trim() || null,
        STARTED_AT: values.STARTED_AT.toISOString(),
        ENDED_AT:
          values.STATUS === 'EN_CURSO'
            ? null
            : values.ENDED_AT
            ? values.ENDED_AT.toISOString()
            : null,
      }

      let description = 'Salida/uso registrado correctamente.'

      if (usage?.SERVICE_VEHICLE_USAGE_ID) {
        await updateRow({
          ...payload,
          SERVICE_VEHICLE_USAGE_ID: usage.SERVICE_VEHICLE_USAGE_ID,
        })
        description = 'Salida/uso actualizado correctamente.'
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
        width={'72%'}
        closable
        title={'Formulario de salida / uso'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin spinning={isCreatePending || isUpdatePending}>
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomDivider>
                <CustomTitle level={5}>Datos de la salida</CustomTitle>
              </CustomDivider>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Vehículo'}
                  name={'SERVICE_VEHICLE_ID'}
                  rules={[{ required: true }]}
                >
                  <CustomSelect
                    placeholder={'Seleccionar vehículo'}
                    options={vehicleOptions.map((item) => ({
                      label:
                        `${item.NAME} · ${item.PLATE || item.VIN || `${item.BRAND} ${item.MODEL}`}`.trim(),
                      value: item.SERVICE_VEHICLE_ID,
                    }))}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Empleado'} name={'STAFF_ID'}>
                  <CustomSelect
                    placeholder={'Seleccionar empleado'}
                    options={employeeOptions.map((item) => ({
                      label: `${item.NAME} ${item.LAST_NAME}${item.USERNAME ? ` (@${item.USERNAME})` : ''}`.trim(),
                      value: item.STAFF_ID,
                    }))}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Estado'} name={'STATUS'}>
                  <CustomSelect options={statusOptions} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Propósito'}
                  name={'PURPOSE'}
                  rules={[{ required: true }]}
                  {...labelColFullWidth}
                >
                  <CustomInput placeholder={'Motivo de la salida o uso'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Origen'} name={'ORIGIN'}>
                  <CustomInput placeholder={'Origen'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Destino'} name={'DESTINATION'}>
                  <CustomInput placeholder={'Destino'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Inicio'}
                  name={'STARTED_AT'}
                  rules={[{ required: true }]}
                >
                  <CustomDatePicker format={'YYYY-MM-DD HH:mm'} showTime />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Fin'} name={'ENDED_AT'}>
                  <CustomDatePicker
                    format={'YYYY-MM-DD HH:mm'}
                    showTime
                    disabled={watchedStatus === 'EN_CURSO'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Odómetro inicio'} name={'ODOMETER_START'}>
                  <CustomInputNumber
                    style={{ width: '100%' }}
                    format={{ format: 'default' }}
                    min={0}
                    precision={0}
                    placeholder={'0'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Odómetro fin'} name={'ODOMETER_END'}>
                  <CustomInputNumber
                    style={{ width: '100%' }}
                    format={{ format: 'default' }}
                    min={0}
                    precision={0}
                    placeholder={'0'}
                    disabled={watchedStatus === 'EN_CURSO'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Notas'}
                  name={'NOTES'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Observaciones del uso'} />
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

export default ServiceVehicleUsageForm
