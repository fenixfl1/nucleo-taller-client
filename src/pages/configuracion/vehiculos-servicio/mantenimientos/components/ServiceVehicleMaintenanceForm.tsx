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
import {
  ServiceVehicleMaintenance,
  ServiceVehicleMaintenancePriority,
  ServiceVehicleMaintenanceStatus,
  ServiceVehicleMaintenanceType,
} from 'src/services/service-vehicle-maintenances/service-vehicle-maintenance.types'
import { useCreateServiceVehicleMaintenanceMutation } from 'src/services/service-vehicle-maintenances/useCreateServiceVehicleMaintenanceMutation'
import { useUpdateServiceVehicleMaintenanceMutation } from 'src/services/service-vehicle-maintenances/useUpdateServiceVehicleMaintenanceMutation'

interface ServiceVehicleMaintenanceFormProps {
  open?: boolean
  maintenance?: ServiceVehicleMaintenance
  vehicleOptions?: ServiceVehicle[]
  onClose?: () => void
  onSuccess?: () => void
}

type ServiceVehicleMaintenanceFormValues = {
  SERVICE_VEHICLE_ID: number
  MAINTENANCE_TYPE: ServiceVehicleMaintenanceType
  PRIORITY: ServiceVehicleMaintenancePriority
  STATUS: ServiceVehicleMaintenanceStatus
  TITLE: string
  DESCRIPTION?: string
  SCHEDULED_AT?: dayjs.Dayjs
  PERFORMED_AT?: dayjs.Dayjs
  ODOMETER?: number | null
  COST_REFERENCE?: number | null
  NOTES?: string
}

const typeOptions = [
  { label: 'Preventivo', value: 'PREVENTIVO' },
  { label: 'Correctivo', value: 'CORRECTIVO' },
  { label: 'Inspección', value: 'INSPECCION' },
  { label: 'Cambio de pieza', value: 'CAMBIO_PIEZA' },
  { label: 'Otro', value: 'OTRO' },
]

const priorityOptions = [
  { label: 'Baja', value: 'BAJA' },
  { label: 'Media', value: 'MEDIA' },
  { label: 'Alta', value: 'ALTA' },
]

const statusOptions = [
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'En proceso', value: 'EN_PROCESO' },
  { label: 'Completado', value: 'COMPLETADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
]

const ServiceVehicleMaintenanceForm: React.FC<
  ServiceVehicleMaintenanceFormProps
> = ({ open, maintenance, vehicleOptions = [], onClose, onSuccess }) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<ServiceVehicleMaintenanceFormValues>()

  const { mutateAsync: createRow, isPending: isCreatePending } =
    useCreateServiceVehicleMaintenanceMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateServiceVehicleMaintenanceMutation()

  useEffect(() => {
    if (maintenance) {
      form.setFieldsValue({
        SERVICE_VEHICLE_ID: maintenance.SERVICE_VEHICLE_ID,
        MAINTENANCE_TYPE: maintenance.MAINTENANCE_TYPE,
        PRIORITY: maintenance.PRIORITY,
        STATUS: maintenance.STATUS,
        TITLE: maintenance.TITLE,
        DESCRIPTION: maintenance.DESCRIPTION,
        SCHEDULED_AT: maintenance.SCHEDULED_AT
          ? dayjs(maintenance.SCHEDULED_AT)
          : undefined,
        PERFORMED_AT: maintenance.PERFORMED_AT
          ? dayjs(maintenance.PERFORMED_AT)
          : undefined,
        ODOMETER: maintenance.ODOMETER,
        COST_REFERENCE: maintenance.COST_REFERENCE,
        NOTES: maintenance.NOTES,
      })
      return
    }

    form.resetFields()
    form.setFieldsValue({
      MAINTENANCE_TYPE: 'PREVENTIVO',
      PRIORITY: 'MEDIA',
      STATUS: 'PENDIENTE',
    })
  }, [form, maintenance, open])

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
        TITLE: values.TITLE?.trim(),
        DESCRIPTION: values.DESCRIPTION?.trim() || null,
        NOTES: values.NOTES?.trim() || null,
        SCHEDULED_AT: values.SCHEDULED_AT
          ? values.SCHEDULED_AT.toISOString()
          : null,
        PERFORMED_AT: values.PERFORMED_AT
          ? values.PERFORMED_AT.toISOString()
          : null,
      }

      let description = 'Mantenimiento registrado correctamente.'

      if (maintenance?.SERVICE_VEHICLE_MAINTENANCE_ID) {
        await updateRow({
          ...payload,
          SERVICE_VEHICLE_MAINTENANCE_ID:
            maintenance.SERVICE_VEHICLE_MAINTENANCE_ID,
        })
        description = 'Mantenimiento actualizado correctamente.'
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
        width={'70%'}
        closable
        title={'Formulario de mantenimiento'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin spinning={isCreatePending || isUpdatePending}>
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomDivider>
                <CustomTitle level={5}>Datos del mantenimiento</CustomTitle>
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
                <CustomFormItem label={'Tipo'} name={'MAINTENANCE_TYPE'}>
                  <CustomSelect options={typeOptions} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Prioridad'} name={'PRIORITY'}>
                  <CustomSelect options={priorityOptions} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Estado'} name={'STATUS'}>
                  <CustomSelect options={statusOptions} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Título'}
                  name={'TITLE'}
                  rules={[{ required: true }]}
                  {...labelColFullWidth}
                >
                  <CustomInput placeholder={'Resumen del mantenimiento'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Fecha programada'} name={'SCHEDULED_AT'}>
                  <CustomDatePicker format={'YYYY-MM-DD HH:mm'} showTime />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Fecha realizada'} name={'PERFORMED_AT'}>
                  <CustomDatePicker format={'YYYY-MM-DD HH:mm'} showTime />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Kilometraje'} name={'ODOMETER'}>
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
                <CustomFormItem label={'Costo ref.'} name={'COST_REFERENCE'}>
                  <CustomInputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    step={0.01}
                    placeholder={'0.00'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Descripción'}
                  name={'DESCRIPTION'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Detalle del mantenimiento'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Notas'}
                  name={'NOTES'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Observaciones adicionales'} />
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

export default ServiceVehicleMaintenanceForm
