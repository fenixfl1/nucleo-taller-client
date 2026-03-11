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
import { InternalPurchaseOrder } from 'src/services/internal-purchase-orders/internal-purchase-order.types'
import { useInternalPurchaseOrderStore } from 'src/store/internal-purchase-order.store'

interface InternalPurchaseOrderListProps {
  onChange?: (current: number, size: number) => void
  onView?: (order: InternalPurchaseOrder) => void
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

const InternalPurchaseOrderList: React.FC<InternalPurchaseOrderListProps> = ({
  onChange,
  onView,
}) => {
  const { internalPurchaseOrderList, metadata } = useInternalPurchaseOrderStore()

  const columnsMap: ColumnsMap<InternalPurchaseOrder> = {
    ORDER_NO: 'Orden',
    ORDER_DATE: {
      header: 'Fecha',
      render: (value) => formatDate(String(value)),
    },
    STATUS: 'Estado',
    SOURCE: 'Origen',
    LINE_COUNT: 'Líneas',
    ESTIMATED_TOTAL: {
      header: 'Monto estimado',
      render: (value) => formatNumber(Number(value)),
    },
    STATE: {
      header: 'Registro',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const renderItem: ListProps<InternalPurchaseOrder>['renderItem'] = (item) => (
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
        title={<CustomText>{item.ORDER_NO}</CustomText>}
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomText style={{ fontSize: 12 }}>
              {formatDate(item.ORDER_DATE)}
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>
              Líneas: {Number(item.LINE_COUNT || 0)}
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>
              RD$ {formatNumber(item.ESTIMATED_TOTAL)}
            </CustomText>
            <CustomTag color={statusTagColor[item.STATUS || ''] || 'default'}>
              <CustomText style={{ fontSize: 12 }}>
                {item.STATUS || 'N/A'}
              </CustomText>
            </CustomTag>
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
      exportOptions={{ title: 'Ordenes internas de compra' }}
      dataSource={internalPurchaseOrderList}
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

export default InternalPurchaseOrderList
