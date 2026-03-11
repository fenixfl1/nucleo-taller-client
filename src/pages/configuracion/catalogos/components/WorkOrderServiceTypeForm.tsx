import React, { useEffect } from 'react'
import { Form, Modal } from 'antd'
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
  WorkOrderServiceType,
  WorkOrderServiceTypePayload,
} from 'src/services/work-order-service-types/work-order-service-type.types'
import { useCreateWorkOrderServiceTypeMutation } from 'src/services/work-order-service-types/useCreateWorkOrderServiceTypeMutation'
import { useUpdateWorkOrderServiceTypeMutation } from 'src/services/work-order-service-types/useUpdateWorkOrderServiceTypeMutation'

interface WorkOrderServiceTypeFormProps {
  open?: boolean
  serviceType?: WorkOrderServiceType
  onClose?: () => void
  onSuccess?: () => void
}

const WorkOrderServiceTypeForm: React.FC<WorkOrderServiceTypeFormProps> = ({
  open,
  serviceType,
  onClose,
  onSuccess,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<WorkOrderServiceTypePayload>()

  const { mutateAsync: createRow, isPending: isCreatePending } =
    useCreateWorkOrderServiceTypeMutation()
  const { mutateAsync: updateRow, isPending: isUpdatePending } =
    useUpdateWorkOrderServiceTypeMutation()

  useEffect(() => {
    if (serviceType) {
      form.setFieldsValue({
        CODE: serviceType.CODE,
        NAME: serviceType.NAME,
        DESCRIPTION: serviceType.DESCRIPTION,
        ORDER_INDEX: serviceType.ORDER_INDEX,
      })
      return
    }

    form.resetFields()
    form.setFieldsValue({ ORDER_INDEX: 0 })
  }, [form, open, serviceType])

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

      const payload: WorkOrderServiceTypePayload = {
        CODE: `${values.CODE || ''}`.trim().toUpperCase(),
        NAME: `${values.NAME || ''}`.trim(),
        DESCRIPTION: `${values.DESCRIPTION || ''}`.trim() || null,
        ORDER_INDEX: Number(values.ORDER_INDEX || 0),
      }

      let description = 'Tipo de servicio registrado exitosamente.'

      if (serviceType?.SERVICE_TYPE_ID) {
        await updateRow({
          ...payload,
          SERVICE_TYPE_ID: serviceType.SERVICE_TYPE_ID,
        })
        description = 'Tipo de servicio actualizado exitosamente.'
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
        title={'Formulario de tipo de servicio'}
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

export default WorkOrderServiceTypeForm
