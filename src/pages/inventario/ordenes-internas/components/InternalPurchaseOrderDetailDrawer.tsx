import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  InboxOutlined,
  RollbackOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { App, DescriptionsProps } from 'antd'
import dayjs from 'dayjs'
import React, { useCallback, useMemo, useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDescriptions from 'src/components/custom/CustomDescription'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomDrawer from 'src/components/custom/CustomDrawer'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTag from 'src/components/custom/CustomTag'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import {
  InternalPurchaseOrder,
  UpdateInternalPurchaseOrderStatusPayload,
} from 'src/services/internal-purchase-orders/internal-purchase-order.types'
import { useGetOneInternalPurchaseOrderQuery } from 'src/services/internal-purchase-orders/useGetOneInternalPurchaseOrderQuery'
import { useUpdateInternalPurchaseOrderStatusMutation } from 'src/services/internal-purchase-orders/useUpdateInternalPurchaseOrderStatusMutation'
import { downloadInternalPurchaseOrderPdf } from 'src/utils/internal-purchase-order-pdf'
import InventoryMovementDetailDrawer from '../../movimientos/components/InventoryMovementDetailDrawer'
import InternalPurchaseOrderPreviewModal from '../../reposicion/components/InternalPurchaseOrderPreviewModal'

interface InternalPurchaseOrderDetailDrawerProps {
  internalPurchaseOrderId?: number
  open?: boolean
  onClose?: () => void
  onSuccess?: () => void
}

const formatDate = (value?: string | Date | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const formatNumber = (value?: number | null) => Number(value || 0).toFixed(2)

const statusTagColor: Record<string, string> = {
  GENERADA: 'default',
  ENVIADA: 'processing',
  RECIBIDA: 'success',
  CANCELADA: 'error',
}

const InternalPurchaseOrderDetailDrawer: React.FC<
  InternalPurchaseOrderDetailDrawerProps
> = ({ internalPurchaseOrderId, open, onClose, onSuccess }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [movementDetailOpen, setMovementDetailOpen] = useState(false)
  const { modal, notification } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const {
    data: order,
    isLoading,
    isFetching,
    refetch,
  } = useGetOneInternalPurchaseOrderQuery(internalPurchaseOrderId, Boolean(open))
  const {
    mutateAsync: updateInternalPurchaseOrderStatus,
    isPending: isUpdatePending,
  } = useUpdateInternalPurchaseOrderStatusMutation()

  const handleStatusChange = useCallback(
    (payload: UpdateInternalPurchaseOrderStatusPayload, orderData?: InternalPurchaseOrder) => {
      if (!orderData) return

      const statusLabels: Record<UpdateInternalPurchaseOrderStatusPayload['STATUS'], string> = {
        GENERADA: 'marcar como generada',
        ENVIADA: 'marcar como enviada',
        RECIBIDA: 'registrar la recepción',
        CANCELADA: 'cancelar',
      }

      modal.confirm({
        title: 'Confirmación',
        content: `Seguro que desea ${statusLabels[payload.STATUS]} la orden interna ${orderData.ORDER_NO}?`,
        onOk: async () => {
          try {
            const updatedOrder = await updateInternalPurchaseOrderStatus(payload)
            await refetch()
            onSuccess?.()

            notification.success({
              message: 'Operación exitosa',
              description:
                updatedOrder.STATUS === 'RECIBIDA'
                  ? `La recepción fue registrada y generó la entrada ${updatedOrder.RECEIVED_MOVEMENT_NO || updatedOrder.RECEIVED_MOVEMENT_ID || ''}.`
                  : `La orden interna fue actualizada a ${updatedOrder.STATUS}.`,
            })
          } catch (error) {
            errorHandler(error)
          }
        },
      })
    },
    [errorHandler, modal, notification, onSuccess, refetch, updateInternalPurchaseOrderStatus]
  )

  const canMarkAsGenerated = order?.STATUS === 'ENVIADA'
  const canMarkAsSent = order?.STATUS === 'GENERADA'
  const canReceive =
    order?.STATUS === 'GENERADA' || order?.STATUS === 'ENVIADA'
  const canCancel =
    order?.STATUS === 'GENERADA' || order?.STATUS === 'ENVIADA'

  const items: DescriptionsProps['items'] = useMemo(
    () => [
      { key: 'order-no', label: 'Orden', children: order?.ORDER_NO },
      {
        key: 'status',
        label: 'Estado',
        children: (
          <CustomTag color={statusTagColor[order?.STATUS || ''] || 'default'}>
            {order?.STATUS || 'N/A'}
          </CustomTag>
        ),
      },
      { key: 'source', label: 'Origen', children: order?.SOURCE || 'N/A' },
      {
        key: 'order-date',
        label: 'Fecha',
        children: formatDate(order?.ORDER_DATE),
      },
      {
        key: 'estimated-total',
        label: 'Monto estimado',
        children: `RD$ ${formatNumber(order?.ESTIMATED_TOTAL)}`,
      },
      {
        key: 'received-movement',
        label: 'Entrada generada',
        children:
          order?.RECEIVED_MOVEMENT_NO ||
          order?.RECEIVED_MOVEMENT_ID ||
          'N/A',
      },
      {
        key: 'sent-at',
        label: 'Enviada el',
        children: formatDate(order?.SENT_AT),
      },
      {
        key: 'received-at',
        label: 'Recibida el',
        children: formatDate(order?.RECEIVED_AT),
      },
      {
        key: 'cancelled-at',
        label: 'Cancelada el',
        children: formatDate(order?.CANCELLED_AT),
      },
      {
        key: 'state',
        label: 'Registro',
        children: (
          <CustomTag color={order?.STATE === 'A' ? 'success' : 'default'}>
            {order?.STATE === 'A' ? 'Activo' : 'Inactivo'}
          </CustomTag>
        ),
      },
      {
        key: 'notes',
        label: 'Notas',
        children: order?.NOTES || 'N/A',
        span: 2,
      },
    ],
    [order]
  )

  return (
    <>
      <CustomDrawer
        open={open}
        onClose={onClose}
        width={'50%'}
        closable={false}
        title={'Detalle de orden interna'}
        extra={
          <CustomSpace direction={'horizontal'} width={'auto'}>
            <CustomButton
              icon={<EyeOutlined />}
              disabled={!order}
              onClick={() => setPreviewOpen(true)}
            >
              Vista previa
            </CustomButton>
            <CustomButton
              type={'primary'}
              icon={<DownloadOutlined />}
            disabled={!order}
            onClick={() =>
              order ? void downloadInternalPurchaseOrderPdf(order) : undefined
            }
          >
            PDF
          </CustomButton>
          </CustomSpace>
        }
      >
        <CustomSpin spinning={isLoading || isFetching || isUpdatePending}>
          <ConditionalComponent condition={Boolean(order)}>
            <CustomDescriptions column={2} items={items} />

            <ConditionalComponent
              condition={
                Boolean(order?.RECEIVED_MOVEMENT_ID) ||
                canMarkAsGenerated ||
                canMarkAsSent ||
                canReceive ||
                canCancel
              }
            >
              <CustomDivider />
              <CustomTitle level={5}>Acciones</CustomTitle>
              <CustomSpace direction={'horizontal'} width={'auto'} wrap>
                <ConditionalComponent condition={canMarkAsGenerated}>
                  <CustomButton
                    icon={<RollbackOutlined />}
                    onClick={() =>
                      handleStatusChange(
                        {
                          INTERNAL_PURCHASE_ORDER_ID:
                            order?.INTERNAL_PURCHASE_ORDER_ID || 0,
                          STATUS: 'GENERADA',
                        },
                        order
                      )
                    }
                  >
                    Volver a generada
                  </CustomButton>
                </ConditionalComponent>

                <ConditionalComponent condition={canMarkAsSent}>
                  <CustomButton
                    icon={<SendOutlined />}
                    onClick={() =>
                      handleStatusChange(
                        {
                          INTERNAL_PURCHASE_ORDER_ID:
                            order?.INTERNAL_PURCHASE_ORDER_ID || 0,
                          STATUS: 'ENVIADA',
                        },
                        order
                      )
                    }
                  >
                    Marcar enviada
                  </CustomButton>
                </ConditionalComponent>

                <ConditionalComponent condition={canReceive}>
                  <CustomButton
                    type={'primary'}
                    icon={<InboxOutlined />}
                    onClick={() =>
                      handleStatusChange(
                        {
                          INTERNAL_PURCHASE_ORDER_ID:
                            order?.INTERNAL_PURCHASE_ORDER_ID || 0,
                          STATUS: 'RECIBIDA',
                        },
                        order
                      )
                    }
                  >
                    Registrar recepción
                  </CustomButton>
                </ConditionalComponent>

                <ConditionalComponent condition={canCancel}>
                  <CustomButton
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() =>
                      handleStatusChange(
                        {
                          INTERNAL_PURCHASE_ORDER_ID:
                            order?.INTERNAL_PURCHASE_ORDER_ID || 0,
                          STATUS: 'CANCELADA',
                        },
                        order
                      )
                    }
                  >
                    Cancelar
                  </CustomButton>
                </ConditionalComponent>

                <ConditionalComponent condition={Boolean(order?.RECEIVED_MOVEMENT_ID)}>
                  <CustomButton
                    icon={<CheckCircleOutlined />}
                    onClick={() => setMovementDetailOpen(true)}
                  >
                    Ver entrada
                  </CustomButton>
                </ConditionalComponent>
              </CustomSpace>
            </ConditionalComponent>

            <ConditionalComponent condition={Boolean(order?.LINES?.length)}>
              <CustomDivider />
              <CustomTitle level={5}>Líneas</CustomTitle>
              <CustomList
                dataSource={order?.LINES || []}
                renderItem={(item) => (
                  <CustomListItem>
                    <CustomListItemMeta
                      title={
                        <CustomText>
                          {item.ARTICLE_CODE} - {item.ARTICLE_NAME}
                        </CustomText>
                      }
                      description={
                        <CustomText style={{ fontSize: 12 }}>
                          Cantidad: {formatNumber(item.QUANTITY)}
                          {item.UNIT_COST_REFERENCE !== null
                            ? ` | Costo Ref.: ${formatNumber(item.UNIT_COST_REFERENCE)}`
                            : ''}
                          {item.NOTES ? ` | ${item.NOTES}` : ''}
                        </CustomText>
                      }
                    />
                  </CustomListItem>
                )}
              />
            </ConditionalComponent>
          </ConditionalComponent>
        </CustomSpin>

        <InternalPurchaseOrderPreviewModal
          open={previewOpen}
          order={order}
          onClose={() => setPreviewOpen(false)}
        />
      </CustomDrawer>

      <ConditionalComponent condition={Boolean(order?.RECEIVED_MOVEMENT_ID) && movementDetailOpen}>
        <InventoryMovementDetailDrawer
          movementId={order?.RECEIVED_MOVEMENT_ID || undefined}
          open={movementDetailOpen}
          onClose={() => setMovementDetailOpen(false)}
        />
      </ConditionalComponent>
    </>
  )
}

export default InternalPurchaseOrderDetailDrawer
