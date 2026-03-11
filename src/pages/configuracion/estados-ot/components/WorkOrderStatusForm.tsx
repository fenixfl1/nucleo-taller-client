import React, { useEffect } from 'react'
import { Form, Modal } from 'antd'
import CustomCheckbox from 'src/components/custom/CustomCheckbox'
import CustomCol from 'src/components/custom/CustomCol'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomModal from 'src/components/custom/CustomModal'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import { useAppNotification } from 'src/context/NotificationContext'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import {
  WorkOrderStatusCatalog,
  WorkOrderStatusCatalogPayload,
} from 'src/services/work-order-statuses/work-order-status.types'
import { useCreateWorkOrderStatusMutation } from 'src/services/work-order-statuses/useCreateWorkOrderStatusMutation'
import { useUpdateWorkOrderStatusMutation } from 'src/services/work-order-statuses/useUpdateWorkOrderStatusMutation'

interface WorkOrderStatusFormProps {
  open?: boolean
  statusRow?: WorkOrderStatusCatalog
  onClose?: () => void
  onSuccess?: () => void
}

const protectedCodes = [
  'CREADA',
  'DIAGNOSTICO',
  'REPARACION',
  'LISTA_ENTREGA',
  'ENTREGADA',
  'CANCELADA',
]

const WorkOrderStatusForm: React.FC<WorkOrderStatusFormProps> = ({
  open,
  statusRow,
  onClose,
  onSuccess,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<WorkOrderStatusCatalogPayload>()

  const { mutateAsync: createRow, isPending: isCreatePending } =
    useCreateWorkOrderStatusMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateWorkOrderStatusMutation()

  const isProtected = protectedCodes.includes(statusRow?.CODE || '')

  useEffect(() => {
    if (statusRow) {
      form.setFieldsValue({
        CODE: statusRow.CODE,
        NAME: statusRow.NAME,
        DESCRIPTION: statusRow.DESCRIPTION,
        ORDER_INDEX: statusRow.ORDER_INDEX,
        IS_FINAL: statusRow.IS_FINAL,
      })
      return
    }

    form.resetFields()
    form.setFieldsValue({ ORDER_INDEX: 0, IS_FINAL: false })
  }, [form, open, statusRow])

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

      const payload: WorkOrderStatusCatalogPayload = {
        CODE: `${values.CODE || ''}`.trim().toUpperCase(),
        NAME: `${values.NAME || ''}`.trim(),
        DESCRIPTION: `${values.DESCRIPTION || ''}`.trim() || null,
        ORDER_INDEX: Number(values.ORDER_INDEX || 0),
        IS_FINAL: Boolean(values.IS_FINAL),
      }

      let description = 'Estado OT registrado exitosamente.'

      if (statusRow?.STATUS_ID) {
        await updateRow({
          ...payload,
          STATUS_ID: statusRow.STATUS_ID,
        })
        description = 'Estado OT actualizado exitosamente.'
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
        width={'60%'}
        closable
        title={'Formulario de estado OT'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin spinning={isCreatePending || isUpdatePending}>
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Código'}
                  name={'CODE'}
                  rules={[{ required: true }]}
                  uppercase
                  readonly={isProtected}
                >
                  <CustomInput placeholder={'Código'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Nombre'}
                  name={'NAME'}
                  rules={[{ required: true }]}
                >
                  <CustomInput placeholder={'Nombre'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Orden'} name={'ORDER_INDEX'}>
                  <CustomInputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={0}
                    placeholder={'0'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Es final'}
                  name={'IS_FINAL'}
                  valuePropName={'checked'}
                  readonly={isProtected}
                >
                  <CustomCheckbox />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Descripción'}
                  name={'DESCRIPTION'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Descripción'} />
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

export default WorkOrderStatusForm
