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
import { ServiceVehicle } from 'src/services/service-vehicles/service-vehicle.types'
import { useServiceVehicleStore } from 'src/store/service-vehicle.store'

interface ServiceVehicleListProps {
  onUpdate?: (serviceVehicle: ServiceVehicle) => void
  onEdit?: (serviceVehicle: ServiceVehicle) => void
  onChange?: (current: number, size: number) => void
}

const ServiceVehicleList: React.FC<ServiceVehicleListProps> = ({
  onEdit,
  onUpdate,
  onChange,
}) => {
  const { serviceVehicleList, metadata } = useServiceVehicleStore()

  const columnsMap: ColumnsMap<ServiceVehicle> = {
    SERVICE_VEHICLE_ID: 'Código',
    NAME: 'Nombre interno',
    PLATE: 'Placa',
    VIN: 'VIN',
    BRAND: 'Marca',
    MODEL: 'Modelo',
    YEAR: 'Año',
    STATE: {
      header: 'Estado',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
    CREATED_AT: 'F.Registro',
  }

  const renderItem: ListProps<ServiceVehicle>['renderItem'] = (item) => (
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
        title={
          <CustomText disabled={item.STATE === 'I'}>
            {`${item.NAME} - ${item.BRAND} ${item.MODEL}`.trim()}
          </CustomText>
        }
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              {item.PLATE || item.VIN || 'Sin placa/VIN'}
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
      exportOptions={{
        title: 'Lista de vehículos de servicio',
        orientation: 'landscape',
      }}
      dataSource={serviceVehicleList}
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

export default ServiceVehicleList
