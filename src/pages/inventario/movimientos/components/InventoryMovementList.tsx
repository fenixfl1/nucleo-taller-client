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
import { InventoryMovement } from 'src/services/inventory-movements/inventory-movement.types'
import { useInventoryMovementStore } from 'src/store/inventory-movement.store'

interface InventoryMovementListProps {
  onChange?: (current: number, size: number) => void
  onView?: (movement: InventoryMovement) => void
}

const movementTypeLabels: Record<string, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
  ADJUSTMENT_IN: 'Ajuste +',
  ADJUSTMENT_OUT: 'Ajuste -',
  WORK_ORDER_CONSUMPTION: 'Consumo OT',
  WORK_ORDER_REVERSAL: 'Reversión OT',
  INTERNAL_PURCHASE_RECEIPT: 'Recepción orden interna',
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const formatMovementNo = (value?: string | null) =>
  `${value || ''}`.replace(/^MOV-/i, '')

const InventoryMovementList: React.FC<InventoryMovementListProps> = ({
  onChange,
  onView,
}) => {
  const { inventoryMovementList, metadata } = useInventoryMovementStore()

  const columnsMap: ColumnsMap<InventoryMovement> = {
    MOVEMENT_NO: {
      header: 'Movimiento',
      render: (value) => formatMovementNo(String(value)),
    },
    MOVEMENT_TYPE: {
      header: 'Tipo',
      render: (value) => movementTypeLabels[String(value)] || String(value),
    },
    MOVEMENT_DATE: {
      header: 'Fecha',
      render: (value) => formatDate(String(value)),
    },
    REFERENCE_SOURCE: 'Origen',
    NOTES: 'Notas',
    STATE: {
      header: 'Estado',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const renderItem: ListProps<InventoryMovement>['renderItem'] = (item) => (
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
        title={<CustomText>{formatMovementNo(item.MOVEMENT_NO)}</CustomText>}
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomText style={{ fontSize: 12 }}>
              {movementTypeLabels[item.MOVEMENT_TYPE] || item.MOVEMENT_TYPE}
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>
              {formatDate(item.MOVEMENT_DATE)}
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>
              {item.REFERENCE_SOURCE || 'MANUAL'}
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
      exportOptions={{ title: 'Movimientos de inventario', orientation: 'landscape' }}
      dataSource={inventoryMovementList}
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

export default InventoryMovementList
