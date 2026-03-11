import { InboxOutlined, PlusOutlined } from '@ant-design/icons'
import { ListProps } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCheckbox from 'src/components/custom/CustomCheckbox'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import { ColumnsMap } from 'src/components/custom/CustomTable'
import CustomTag from 'src/components/custom/CustomTag'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import { InventoryReplenishment } from 'src/services/inventory-replenishment/inventory-replenishment.types'
import { useInventoryReplenishmentStore } from 'src/store/inventory-replenishment.store'

interface InventoryReplenishmentListProps {
  onChange?: (current: number, size: number) => void
  onCreateMovement?: (record: InventoryReplenishment) => void
  selectedArticleIds?: number[]
  onToggleSelection?: (record: InventoryReplenishment, checked: boolean) => void
}

const itemTypeLabels: Record<string, string> = {
  RADIADOR: 'Radiador',
  REPUESTO: 'Repuesto',
  MATERIAL: 'Material',
  INSUMO: 'Insumo',
  OTRO: 'Otro',
}

const formatNumber = (value?: number | null) => Number(value || 0).toFixed(2)

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY') : 'N/A'

const InventoryReplenishmentList: React.FC<InventoryReplenishmentListProps> = ({
  onChange,
  onCreateMovement,
  selectedArticleIds = [],
  onToggleSelection,
}) => {
  const { inventoryReplenishmentList, metadata } =
    useInventoryReplenishmentStore()

  const columnsMap: ColumnsMap<InventoryReplenishment> = {
    CODE: 'Referencia',
    NAME: 'Artículo',
    ITEM_TYPE: {
      header: 'Tipo',
      render: (value) => itemTypeLabels[String(value)] || String(value),
    },
    CURRENT_STOCK: {
      header: 'Stock actual',
      render: (value) => formatNumber(Number(value)),
    },
    MIN_STOCK: {
      header: 'Mínimo',
      render: (value) => formatNumber(Number(value)),
    },
    AVG_MONTHLY_CONSUMPTION: {
      header: 'Consumo prom.',
      render: (value) => formatNumber(Number(value)),
    },
    TARGET_STOCK: {
      header: 'Objetivo',
      render: (value) => formatNumber(Number(value)),
    },
    SUGGESTED_REPLENISHMENT: {
      header: 'Sugerido',
      render: (value) => formatNumber(Number(value)),
    },
    LAST_CONSUMPTION_DATE: {
      header: 'Últ. consumo',
      render: (value) => formatDate(String(value)),
    },
  }

  const renderItem: ListProps<InventoryReplenishment>['renderItem'] = (
    item
  ) => (
    <CustomListItem
      actions={[
        <CustomCheckbox
          key={'select'}
          checked={selectedArticleIds.includes(item.ARTICLE_ID)}
          disabled={!item.IS_ACTIONABLE || item.STATE !== 'A'}
          onChange={(event) => onToggleSelection?.(item, event.target.checked)}
        >
          Seleccionar
        </CustomCheckbox>,
        <CustomTooltip title={'Registrar entrada'} key={'replenish'}>
          <CustomButton
            type={'link'}
            icon={<PlusOutlined />}
            disabled={!item.IS_ACTIONABLE || item.STATE !== 'A'}
            onClick={() => onCreateMovement?.(item)}
          />
        </CustomTooltip>,
      ]}
    >
      <CustomListItemMeta
        avatar={<InboxOutlined />}
        title={<CustomText>{`${item.CODE} - ${item.NAME}`}</CustomText>}
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomText style={{ fontSize: 12 }}>
              {itemTypeLabels[item.ITEM_TYPE] || item.ITEM_TYPE}
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>
              Stock: {formatNumber(item.CURRENT_STOCK)}
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>
              Sugerido: {formatNumber(item.SUGGESTED_REPLENISHMENT)}
            </CustomText>
            <CustomTag color={item.IS_ACTIONABLE ? 'warning' : 'success'}>
              <CustomText style={{ fontSize: 12 }}>
                {item.IS_ACTIONABLE
                  ? 'Requiere reposición'
                  : 'Stock suficiente'}
              </CustomText>
            </CustomTag>
            {item.IS_BELOW_MINIMUM && (
              <CustomTag color={'error'}>
                <CustomText style={{ fontSize: 12 }}>Bajo mínimo</CustomText>
              </CustomTag>
            )}
            <CustomText style={{ fontSize: 12 }}>
              Ventana: {item.MONTH_WINDOW} meses
            </CustomText>
          </CustomSpace>
        }
      />
    </CustomListItem>
  )

  return (
    <CustomList
      columnsMap={columnsMap}
      exportOptions={{
        title: 'Sugerencias de reposición',
        orientation: 'landscape',
      }}
      dataSource={inventoryReplenishmentList}
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

export default InventoryReplenishmentList
