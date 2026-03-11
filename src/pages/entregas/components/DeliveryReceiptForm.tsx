import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Form, Modal } from 'antd'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomMaskedInput from 'src/components/custom/CustomMaskedInput'
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
import useDebounce from 'src/hooks/use-debounce'
import { DeliveryReceiptPayload } from 'src/services/delivery-receipts/delivery-receipt.types'
import { useCreateDeliveryReceiptMutation } from 'src/services/delivery-receipts/useCreateDeliveryReceiptMutation'
import { useGetWorkOrderPaginationMutation } from 'src/services/work-orders/useGetWorkOrderPaginationMutation'
import { useGetWorkOrderStatusListQuery } from 'src/services/work-orders/useGetWorkOrderStatusListQuery'
import { WorkOrder } from 'src/services/work-orders/work-order.types'
import { useWorkOrderStore } from 'src/store/work-order.store'
import { AdvancedCondition } from 'src/types/general'

type DeliveryReceiptFormValues = {
  WORK_ORDER_ID: number
  DELIVERY_DATE?: dayjs.Dayjs
  RECEIVED_BY_NAME: string
  RECEIVED_BY_DOCUMENT?: string
  RECEIVED_BY_PHONE?: string
  OBSERVATIONS?: string
}

interface DeliveryReceiptFormProps {
  open?: boolean
  onClose?: () => void
  onSuccess?: () => void
}

const DeliveryReceiptForm: React.FC<DeliveryReceiptFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<DeliveryReceiptFormValues>()
  const [searchWorkOrderKey, setSearchWorkOrderKey] = useState('')
  const debounceWorkOrder = useDebounce(searchWorkOrderKey)

  const { workOrderList } = useWorkOrderStore()
  const { data: statusList = [], isLoading: isStatusListLoading } =
    useGetWorkOrderStatusListQuery()
  const { mutate: getWorkOrderPagination, isPending: isGetWorkOrdersPending } =
    useGetWorkOrderPaginationMutation()
  const {
    mutateAsync: createDeliveryReceipt,
    isPending: isCreatePending,
  } = useCreateDeliveryReceiptMutation()

  const readyForDeliveryStatusId = useMemo(
    () => statusList.find((item) => item.CODE === 'LISTA_ENTREGA')?.STATUS_ID,
    [statusList]
  )

  const workOrderOptions = useMemo(
    () =>
      workOrderList.map((item) => ({
        value: item.WORK_ORDER_ID,
        label: `${item.ORDER_NO} - ${item.CUSTOMER_NAME} - ${item.VEHICLE_LABEL}`,
      })),
    [workOrderList]
  )

  const handleSearchWorkOrders = useCallback(() => {
    if (!open || !readyForDeliveryStatusId) return

    const condition: AdvancedCondition<WorkOrder>[] = [
      {
        field: 'STATUS_ID' as never,
        operator: '=',
        value: readyForDeliveryStatusId,
      },
      {
        field: 'STATE' as never,
        operator: '=',
        value: 'A',
      },
    ]

    if (debounceWorkOrder) {
      condition.push({
        field: 'FILTER' as never,
        operator: 'LIKE',
        value: debounceWorkOrder,
      })
    }

    getWorkOrderPagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [
    debounceWorkOrder,
    getWorkOrderPagination,
    open,
    readyForDeliveryStatusId,
  ])

  useEffect(handleSearchWorkOrders, [handleSearchWorkOrders])

  useEffect(() => {
    if (!open) return

    form.resetFields()
    form.setFieldsValue({
      DELIVERY_DATE: dayjs(),
    })
  }, [form, open])

  const handleCancel = () => {
    form.resetFields()
    setSearchWorkOrderKey('')
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

      const payload: DeliveryReceiptPayload = {
        WORK_ORDER_ID: Number(values.WORK_ORDER_ID),
        DELIVERY_DATE: values.DELIVERY_DATE
          ? values.DELIVERY_DATE.toISOString()
          : null,
        RECEIVED_BY_NAME: `${values.RECEIVED_BY_NAME || ''}`.trim(),
        RECEIVED_BY_DOCUMENT: `${values.RECEIVED_BY_DOCUMENT || ''}`.trim() || null,
        RECEIVED_BY_PHONE: `${values.RECEIVED_BY_PHONE || ''}`.trim() || null,
        OBSERVATIONS: `${values.OBSERVATIONS || ''}`.trim() || null,
      }

      await createDeliveryReceipt(payload)

      notification({
        message: 'Operación exitosa',
        description: 'Comprobante interno de entrega registrado correctamente.',
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
        title={'Formulario de entrega'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin
          spinning={
            isCreatePending ||
            isGetWorkOrdersPending ||
            Boolean(isStatusListLoading)
          }
        >
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomDivider>
                <CustomTitle level={5}>Comprobante interno</CustomTitle>
              </CustomDivider>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Orden de trabajo'}
                  name={'WORK_ORDER_ID'}
                  rules={[{ required: true }]}
                  {...labelColFullWidth}
                >
                  <CustomSelect
                    placeholder={'Seleccionar orden lista para entrega'}
                    onSearch={setSearchWorkOrderKey}
                    options={workOrderOptions}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Fecha entrega'} name={'DELIVERY_DATE'}>
                  <CustomDatePicker format={'YYYY-MM-DD'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Recibido por'}
                  name={'RECEIVED_BY_NAME'}
                  rules={[{ required: true }]}
                >
                  <CustomInput placeholder={'Nombre de quien recibe'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Documento'}
                  name={'RECEIVED_BY_DOCUMENT'}
                >
                  <CustomInput placeholder={'Documento'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Teléfono'} name={'RECEIVED_BY_PHONE'}>
                  <CustomMaskedInput placeholder={'(809) 000 0000'} type={'phone'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Observaciones'}
                  name={'OBSERVATIONS'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Observaciones de entrega'} />
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

export default DeliveryReceiptForm
