import { DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import { DescriptionsProps } from 'antd'
import dayjs from 'dayjs'
import React, { useState } from 'react'
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
import { useGetOneDeliveryReceiptQuery } from 'src/services/delivery-receipts/useGetOneDeliveryReceiptQuery'
import { useGetOneWorkOrderQuery } from 'src/services/work-orders/useGetOneWorkOrderQuery'
import { downloadDeliveryReceiptPdf } from 'src/utils/delivery-receipt-pdf'
import DeliveryReceiptPreviewModal from './DeliveryReceiptPreviewModal'

interface DeliveryReceiptDetailDrawerProps {
  receiptId?: number
  open?: boolean
  onClose?: () => void
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const DeliveryReceiptDetailDrawer: React.FC<
  DeliveryReceiptDetailDrawerProps
> = ({ receiptId, open, onClose }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const {
    data: receipt,
    isLoading,
    isFetching,
  } = useGetOneDeliveryReceiptQuery(receiptId, Boolean(open))
  const {
    data: workOrder,
    isLoading: isWorkOrderLoading,
    isFetching: isWorkOrderFetching,
  } = useGetOneWorkOrderQuery(
    receipt?.WORK_ORDER_ID,
    Boolean(open && receipt?.WORK_ORDER_ID)
  )

  const items: DescriptionsProps['items'] = [
    { key: 'receipt-no', label: 'Comprobante', children: receipt?.RECEIPT_NO },
    { key: 'wo', label: 'Orden', children: receipt?.WORK_ORDER_NO },
    { key: 'customer', label: 'Cliente', children: receipt?.CUSTOMER_NAME },
    { key: 'vehicle', label: 'Vehículo', children: receipt?.VEHICLE_LABEL },
    {
      key: 'delivery-date',
      label: 'Fecha entrega',
      children: formatDate(receipt?.DELIVERY_DATE),
    },
    {
      key: 'delivered-by',
      label: 'Entregado por',
      children: receipt?.DELIVERED_BY_NAME,
    },
    {
      key: 'received-by',
      label: 'Recibido por',
      children: receipt?.RECEIVED_BY_NAME,
    },
    {
      key: 'document',
      label: 'Documento',
      children: receipt?.RECEIVED_BY_DOCUMENT || 'N/A',
    },
    {
      key: 'phone',
      label: 'Teléfono',
      children: receipt?.RECEIVED_BY_PHONE || 'N/A',
    },
    {
      key: 'state',
      label: 'Estado',
      children: (
        <CustomTag color={receipt?.STATE === 'A' ? 'success' : 'default'}>
          {receipt?.STATE === 'A' ? 'Activo' : 'Inactivo'}
        </CustomTag>
      ),
    },
    {
      key: 'observations',
      label: 'Observaciones',
      children: receipt?.OBSERVATIONS || 'N/A',
      span: 2,
    },
    {
      key: 'symptom',
      label: 'Síntoma',
      children: workOrder?.SYMPTOM || 'N/A',
      span: 2,
    },
    {
      key: 'work-performed',
      label: 'Trabajo realizado',
      children: workOrder?.WORK_PERFORMED || 'N/A',
      span: 2,
    },
  ]

  const handleCloseDrawer = () => {
    setPreviewOpen(false)
    onClose?.()
  }

  return (
    <CustomDrawer
      open={open}
      onClose={handleCloseDrawer}
      width={'50%'}
      closable={false}
      title={'Detalle de entrega'}
      extra={
        <CustomSpace direction="horizontal">
          <CustomButton
            icon={<EyeOutlined />}
            disabled={!receipt}
            onClick={() => setPreviewOpen(true)}
          >
            Vista previa
          </CustomButton>
          <CustomButton
            type={'primary'}
            icon={<DownloadOutlined />}
            disabled={!receipt}
            onClick={() =>
              receipt
                ? void downloadDeliveryReceiptPdf({ receipt, workOrder })
                : undefined
            }
          >
            PDF
          </CustomButton>
        </CustomSpace>
      }
    >
      <CustomSpin
        spinning={
          isLoading || isFetching || isWorkOrderLoading || isWorkOrderFetching
        }
      >
        <ConditionalComponent condition={Boolean(receipt)}>
          <CustomDescriptions column={2} items={items} />

          <ConditionalComponent
            condition={Boolean(workOrder?.CONSUMED_ITEMS?.length)}
          >
            <CustomDivider />
            <CustomTitle level={5}>Artículos consumidos</CustomTitle>
            <CustomList
              dataSource={workOrder?.CONSUMED_ITEMS || []}
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
                        Cantidad: {Number(item.QUANTITY || 0).toFixed(2)}
                        {item.UNIT_COST_REFERENCE !== null &&
                        item.UNIT_COST_REFERENCE !== undefined
                          ? ` | Costo Ref.: ${Number(item.UNIT_COST_REFERENCE).toFixed(2)}`
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

      <DeliveryReceiptPreviewModal
        open={previewOpen}
        receipt={receipt}
        workOrder={workOrder}
        onClose={() => setPreviewOpen(false)}
      />
    </CustomDrawer>
  )
}

export default DeliveryReceiptDetailDrawer
