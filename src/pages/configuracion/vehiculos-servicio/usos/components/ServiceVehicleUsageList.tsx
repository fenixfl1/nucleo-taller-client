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
import { ServiceVehicleUsage } from 'src/services/service-vehicle-usages/service-vehicle-usage.types'
import { useServiceVehicleUsageStore } from 'src/store/service-vehicle-usage.store'

interface Props {
  onEdit?: (item: ServiceVehicleUsage) => void
  onUpdate?: (item: ServiceVehicleUsage, payload: Partial<ServiceVehicleUsage>) => void
  onChange?: (page: number, size: number) => void
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/D'

const statusColor = {
  EN_CURSO: 'processing',
  FINALIZADA: 'success',
  CANCELADA: 'error',
} as const

const ServiceVehicleUsageList: React.FC<Props> = ({ onEdit, onUpdate, onChange }) => {
  const { usageList, metadata } = useServiceVehicleUsageStore()

  const columnsMap: ColumnsMap<ServiceVehicleUsage> = {
    SERVICE_VEHICLE_USAGE_ID: 'Código',
    VEHICLE_NAME: 'Vehículo',
    EMPLOYEE_NAME: 'Empleado',
    PURPOSE: 'Propósito',
    STATUS: 'Estado',
    STARTED_AT: 'Inicio',
    ENDED_AT: 'Fin',
    STATE: {
      header: 'Registro',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const renderItem: ListProps<ServiceVehicleUsage>['renderItem'] = (item) => (
    <CustomListItem
      actions={[
        <CustomTooltip title={'Editar'} key={'edit'}>
          <CustomButton type={'link'} icon={<EditOutlined />} onClick={() => onEdit?.(item)} />
        </CustomTooltip>,
        item.STATUS === 'EN_CURSO' ? (
          <CustomTooltip title={'Finalizar'} key={'finish'}>
            <CustomButton
              type={'link'}
              icon={<CheckCircleOutlined />}
              onClick={() => onUpdate?.(item, { STATUS: 'FINALIZADA' })}
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
        title={<CustomText disabled={item.STATE === 'I'}>{item.PURPOSE}</CustomText>}
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              {item.VEHICLE_LABEL}
            </CustomText>
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              {item.EMPLOYEE_NAME || 'Sin empleado asignado'}
            </CustomText>
            <CustomTag color={statusColor[item.STATUS]}>
              <CustomText style={{ fontSize: 12 }}>{item.STATUS}</CustomText>
            </CustomTag>
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              Inicio: {formatDate(item.STARTED_AT)}
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
        title: 'Lista de salidas y uso de vehículos de servicio',
        orientation: 'landscape',
      }}
      dataSource={usageList}
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

export default ServiceVehicleUsageList
