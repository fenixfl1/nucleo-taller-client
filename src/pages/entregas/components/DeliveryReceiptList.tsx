import { EyeOutlined } from '@ant-design/icons'
import { ListProps } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import { ColumnsMap } from 'src/components/custom/CustomTable'
import CustomTag from 'src/components/custom/CustomTag'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import { DeliveryReceipt } from 'src/services/delivery-receipts/delivery-receipt.types'
import { useDeliveryReceiptStore } from 'src/store/delivery-receipt.store'

interface DeliveryReceiptListProps {
  onChange?: (current: number, size: number) => void
  onView?: (receipt: DeliveryReceipt) => void
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const DeliveryReceiptList: React.FC<DeliveryReceiptListProps> = ({
  onChange,
  onView,
}) => {
  const { deliveryReceiptList, metadata } = useDeliveryReceiptStore()

  const columnsMap: ColumnsMap<DeliveryReceipt> = {
    RECEIPT_NO: 'Comprobante',
    WORK_ORDER_NO: 'OT',
    CUSTOMER_NAME: 'Cliente',
    VEHICLE_LABEL: 'Vehículo',
    DELIVERY_DATE: {
      header: 'Fecha',
      render: (value) => formatDate(String(value)),
    },
    RECEIVED_BY_NAME: 'Recibido por',
    STATE: {
      header: 'Estado',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const renderItem: ListProps<DeliveryReceipt>['renderItem'] = (item) => (
    <CustomListItem
      actions={[
        <CustomTooltip title={'Ver detalle'} key={'view'}>
          <CustomButton
            type={'link'}
            icon={<EyeOutlined />}
            onClick={() => onView?.(item)}
          />
        </CustomTooltip>,
      ]}
    >
      <CustomListItemMeta
        title={
          <CustomText>
            {item.RECEIPT_NO} - {item.WORK_ORDER_NO}
          </CustomText>
        }
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomText style={{ fontSize: 12 }}>{item.CUSTOMER_NAME}</CustomText>
            <CustomText style={{ fontSize: 12 }}>{item.VEHICLE_LABEL}</CustomText>
            <CustomText style={{ fontSize: 12 }}>
              {formatDate(item.DELIVERY_DATE)}
            </CustomText>
            <CustomTag color={item.STATE === 'A' ? 'success' : 'default'}>
              <CustomText style={{ fontSize: 12 }}>
                {item.STATE === 'A' ? 'Activo' : 'Inactivo'}
              </CustomText>
            </CustomTag>
          </CustomSpace>
        }
      />
    </CustomListItem>
  )

  return (
    <CustomList
      columnsMap={columnsMap}
      exportOptions={{ title: 'Comprobantes internos de entrega' }}
      dataSource={deliveryReceiptList}
      renderItem={renderItem}
      pagination={{
        current: metadata.currentPage,
        onChange,
        pageSize: metadata.pageSize,
        pageSizeOptions: [5, 10, 15, 20, 25, 50, 75, 100],
        showSizeChanger: true,
        total: Number(metadata.totalRows ?? 0),
      }}
    />
  )
}

export default DeliveryReceiptList
