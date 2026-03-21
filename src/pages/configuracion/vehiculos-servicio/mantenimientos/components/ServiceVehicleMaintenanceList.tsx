import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  StopOutlined,
} from '@ant-design/icons'
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
import { DISABLED_COLOR } from 'src/constants/colors'
import { ServiceVehicleMaintenance } from 'src/services/service-vehicle-maintenances/service-vehicle-maintenance.types'
import { useServiceVehicleMaintenanceStore } from 'src/store/service-vehicle-maintenance.store'

interface Props {
  onEdit?: (item: ServiceVehicleMaintenance) => void
  onUpdate?: (item: ServiceVehicleMaintenance, payload: Partial<ServiceVehicleMaintenance>) => void
  onChange?: (page: number, size: number) => void
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/D'

const priorityColor = {
  BAJA: 'default',
  MEDIA: 'warning',
  ALTA: 'error',
} as const

const statusColor = {
  PENDIENTE: 'default',
  EN_PROCESO: 'processing',
  COMPLETADO: 'success',
  CANCELADO: 'error',
} as const

const ServiceVehicleMaintenanceList: React.FC<Props> = ({
  onEdit,
  onUpdate,
  onChange,
}) => {
  const { maintenanceList, metadata } = useServiceVehicleMaintenanceStore()

  const columnsMap: ColumnsMap<ServiceVehicleMaintenance> = {
    SERVICE_VEHICLE_MAINTENANCE_ID: 'Código',
    VEHICLE_NAME: 'Vehículo',
    TITLE: 'Título',
    MAINTENANCE_TYPE: 'Tipo',
    PRIORITY: 'Prioridad',
    STATUS: 'Estado',
    SCHEDULED_AT: 'Programado',
    PERFORMED_AT: 'Realizado',
    STATE: {
      header: 'Registro',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const renderItem: ListProps<ServiceVehicleMaintenance>['renderItem'] = (item) => (
    <CustomListItem
      actions={[
        <CustomTooltip title={'Editar'} key={'edit'}>
          <CustomButton type={'link'} icon={<EditOutlined />} onClick={() => onEdit?.(item)} />
        </CustomTooltip>,
        item.STATUS !== 'COMPLETADO' && item.STATUS !== 'CANCELADO' ? (
          <CustomTooltip title={'Marcar completado'} key={'complete'}>
            <CustomButton
              type={'link'}
              icon={<CheckCircleOutlined />}
              onClick={() => onUpdate?.(item, { STATUS: 'COMPLETADO' })}
            />
          </CustomTooltip>
        ) : null,
        <CustomTooltip
          key={'state'}
          title={item.STATE === 'A' ? 'Inhabilitar' : 'Habilitar'}
        >
          <CustomButton
            onClick={() => onUpdate?.(item, { STATE: item.STATE === 'A' ? 'I' : 'A' })}
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
      ].filter(Boolean)}
    >
      <CustomListItemMeta
        title={<CustomText disabled={item.STATE === 'I'}>{item.TITLE}</CustomText>}
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              {item.VEHICLE_LABEL}
            </CustomText>
            <CustomTag color={statusColor[item.STATUS]}>
              <CustomText style={{ fontSize: 12 }}>{item.STATUS}</CustomText>
            </CustomTag>
            <CustomTag color={priorityColor[item.PRIORITY]}>
              <CustomText style={{ fontSize: 12 }}>{item.PRIORITY}</CustomText>
            </CustomTag>
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              Programado: {formatDate(item.SCHEDULED_AT)}
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
        title: 'Lista de mantenimientos de vehículos de servicio',
        orientation: 'landscape',
      }}
      dataSource={maintenanceList}
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

export default ServiceVehicleMaintenanceList
