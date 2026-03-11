import { DeleteOutlined, EditOutlined, StopOutlined } from '@ant-design/icons'
import { ListProps } from 'antd'
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
import { DISABLED_COLOR } from 'src/constants/colors'
import { WorkOrderStatusCatalog } from 'src/services/work-order-statuses/work-order-status.types'
import { useWorkOrderStatusStore } from 'src/store/work-order-status.store'

interface WorkOrderStatusListProps {
  onEdit?: (statusRow: WorkOrderStatusCatalog) => void
  onUpdate?: (statusRow: WorkOrderStatusCatalog) => void
  onChange?: (current: number, size: number) => void
}

const WorkOrderStatusList: React.FC<WorkOrderStatusListProps> = ({
  onEdit,
  onUpdate,
  onChange,
}) => {
  const { workOrderStatusList, metadata } = useWorkOrderStatusStore()

  const columnsMap: ColumnsMap<WorkOrderStatusCatalog> = {
    CODE: 'Código',
    NAME: 'Nombre',
    DESCRIPTION: 'Descripción',
    ORDER_INDEX: 'Orden',
    IS_FINAL: {
      header: 'Final',
      render: (value) => (value ? 'Sí' : 'No'),
    },
    SCOPE: 'Alcance',
    STATE: {
      header: 'Estado',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const renderItem: ListProps<WorkOrderStatusCatalog>['renderItem'] = (item) => (
    <CustomListItem
      actions={[
        <CustomTooltip title={'Editar'} key={'edit'}>
          <CustomButton
            type={'link'}
            icon={<EditOutlined />}
            disabled={item.STATE === 'I'}
            onClick={() => onEdit?.(item)}
          />
        </CustomTooltip>,
        <CustomTooltip
          key={'state'}
          title={item.STATE === 'A' ? 'Inhabilitar' : 'Habilitar'}
        >
          <CustomButton
            onClick={() => onUpdate?.(item)}
            size={'large'}
            danger={item.STATE === 'A'}
            type={'link'}
            icon={
              item.STATE === 'A' ? (
                <DeleteOutlined />
              ) : (
                <StopOutlined style={{ color: DISABLED_COLOR }} />
              )
            }
          />
        </CustomTooltip>,
      ]}
    >
      <CustomListItemMeta
        title={<CustomText>{item.NAME}</CustomText>}
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomText style={{ fontSize: 12 }}>{item.CODE}</CustomText>
            <CustomText style={{ fontSize: 12 }}>Orden: {item.ORDER_INDEX}</CustomText>
            <CustomTag color={item.IS_FINAL ? 'success' : 'default'}>
              <CustomText style={{ fontSize: 12 }}>
                {item.IS_FINAL ? 'Final' : 'Intermedio'}
              </CustomText>
            </CustomTag>
            <CustomTag color={item.SCOPE === 'BASE' ? 'blue' : 'purple'}>
              <CustomText style={{ fontSize: 12 }}>{item.SCOPE}</CustomText>
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
      exportOptions={{ title: 'Estados OT', orientation: 'landscape' }}
      dataSource={workOrderStatusList}
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

export default WorkOrderStatusList
