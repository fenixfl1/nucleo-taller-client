import { EditOutlined, EyeOutlined } from '@ant-design/icons'
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
import { WorkOrder } from 'src/services/work-orders/work-order.types'
import { useWorkOrderStore } from 'src/store/work-order.store'

interface WorkOrderListProps {
  onChange?: (current: number, size: number) => void
  onEdit?: (workOrder: WorkOrder) => void
  onView?: (workOrder: WorkOrder) => void
}

const statusColorByCode: Record<string, string> = {
  CREADA: 'default',
  DIAGNOSTICO: 'processing',
  REPARACION: 'warning',
  LISTA_ENTREGA: 'cyan',
  ENTREGADA: 'success',
  CANCELADA: 'error',
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const getPromiseTag = (item: WorkOrder) => {
  if (!item.PROMISED_AT) return null
  if (item.STATUS_CODE === 'ENTREGADA' || item.STATUS_CODE === 'CANCELADA') {
    return null
  }

  const promiseDate = dayjs(item.PROMISED_AT)
  const overdueLimit = dayjs().subtract(1, 'day').endOf('day')

  if (promiseDate.isBefore(overdueLimit)) {
    return { color: 'error', label: 'Vencida' }
  }

  if (promiseDate.isBefore(dayjs().endOf('day'))) {
    return { color: 'warning', label: 'Compromiso hoy' }
  }

  if (promiseDate.isBefore(dayjs().add(2, 'day').endOf('day'))) {
    return { color: 'processing', label: 'Proxima 48h' }
  }

  return { color: 'default', label: 'Programada' }
}

const WorkOrderList: React.FC<WorkOrderListProps> = ({
  onChange,
  onEdit,
  onView,
}) => {
  const { workOrderList, metadata } = useWorkOrderStore()

  const columnsMap: ColumnsMap<WorkOrder> = {
    ORDER_NO: 'Orden',
    CUSTOMER_NAME: 'Cliente',
    VEHICLE_LABEL: 'Vehículo',
    STATUS_NAME: 'Estado',
    OPENED_AT: {
      header: 'Apertura',
      render: (value) => formatDate(String(value)),
    },
    PROMISED_AT: {
      header: 'Promesa',
      render: (value) => formatDate(value ? String(value) : null),
    },
    STATE: {
      header: 'Estado Reg.',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const renderItem: ListProps<WorkOrder>['renderItem'] = (item) => {
    const isFinalStatus =
      item.STATUS_CODE === 'ENTREGADA' || item.STATUS_CODE === 'CANCELADA'
    const promiseTag = getPromiseTag(item)

    return (
      <CustomListItem
        actions={[
          <CustomTooltip title={'Ver detalle'} key={'view'}>
            <CustomButton
              type={'link'}
              icon={<EyeOutlined />}
              onClick={() => onView?.(item)}
            />
          </CustomTooltip>,
          <CustomTooltip title={'Editar'} key={'edit'}>
            <CustomButton
              type={'link'}
              icon={<EditOutlined />}
              disabled={isFinalStatus}
              onClick={() => onEdit?.(item)}
            />
          </CustomTooltip>,
        ]}
      >
        <CustomListItemMeta
          title={
            <CustomText>
              {item.ORDER_NO} - {item.CUSTOMER_NAME}
            </CustomText>
          }
          description={
            <CustomSpace
              direction={'horizontal'}
              split={<CustomDivider type={'vertical'} />}
            >
              <CustomText style={{ fontSize: 12 }}>{item.VEHICLE_LABEL}</CustomText>
              {item.TECHNICIAN_NAMES ? (
                <CustomText style={{ fontSize: 12 }}>
                  Técnico(s): {item.TECHNICIAN_NAMES}
                </CustomText>
              ) : null}
              <CustomText style={{ fontSize: 12 }}>
                Apertura: {formatDate(item.OPENED_AT)}
              </CustomText>
              <CustomText style={{ fontSize: 12 }}>
                Promesa: {formatDate(item.PROMISED_AT)}
              </CustomText>
              <CustomTag color={statusColorByCode[item.STATUS_CODE] || 'default'}>
                <CustomText style={{ fontSize: 12 }}>{item.STATUS_NAME}</CustomText>
              </CustomTag>
              {promiseTag ? (
                <CustomTag color={promiseTag.color}>
                  <CustomText style={{ fontSize: 12 }}>{promiseTag.label}</CustomText>
                </CustomTag>
              ) : null}
            </CustomSpace>
          }
        />
      </CustomListItem>
    )
  }

  return (
    <CustomList
      columnsMap={columnsMap}
      exportOptions={{ title: 'Ordenes de trabajo', orientation: 'landscape' }}
      dataSource={workOrderList}
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

export default WorkOrderList
