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
import { WorkOrderServiceType } from 'src/services/work-order-service-types/work-order-service-type.types'
import { useWorkOrderServiceTypeStore } from 'src/store/work-order-service-type.store'

interface WorkOrderServiceTypeListProps {
  onEdit?: (serviceType: WorkOrderServiceType) => void
  onUpdate?: (serviceType: WorkOrderServiceType) => void
  onChange?: (current: number, size: number) => void
}

const WorkOrderServiceTypeList: React.FC<WorkOrderServiceTypeListProps> = ({
  onEdit,
  onUpdate,
  onChange,
}) => {
  const { workOrderServiceTypeList, metadata } = useWorkOrderServiceTypeStore()

  const columnsMap: ColumnsMap<WorkOrderServiceType> = {
    CODE: 'Código',
    NAME: 'Nombre',
    DESCRIPTION: 'Descripción',
    BASE_PRICE: {
      header: 'Precio base',
      render: (value) => Number(value || 0).toFixed(2),
    },
    ORDER_INDEX: 'Orden',
    SCOPE: 'Alcance',
    STATE: {
      header: 'Estado',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const renderItem: ListProps<WorkOrderServiceType>['renderItem'] = (item) => (
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
            <CustomText style={{ fontSize: 12 }}>
              Precio base: {Number(item.BASE_PRICE || 0).toFixed(2)}
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>Orden: {item.ORDER_INDEX}</CustomText>
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
      exportOptions={{ title: 'Servicios OT', orientation: 'landscape' }}
      dataSource={workOrderServiceTypeList}
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

export default WorkOrderServiceTypeList
