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
import { ActivityLogEntry } from 'src/services/activity-logs/activity-log.types'
import { useActivityLogStore } from 'src/store/activity-log.store'

interface ActivityLogListProps {
  onChange?: (current: number, size: number) => void
  onView?: (activityLog: ActivityLogEntry) => void
}

const actionColorMap: Record<string, string> = {
  INSERT: 'success',
  UPDATE: 'processing',
  DELETE: 'error',
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const ActivityLogList: React.FC<ActivityLogListProps> = ({
  onChange,
  onView,
}) => {
  const { activityLogList, metadata } = useActivityLogStore()

  const columnsMap: ColumnsMap<ActivityLogEntry> = {
    ID: 'ID',
    ACTION: 'Acción',
    MODEL: 'Entidad',
    OBJECT_ID: 'Objeto',
    USERNAME: 'Usuario',
    STAFF_NAME: 'Personal',
    CREATED_AT: {
      header: 'Fecha',
      render: (value) => formatDate(String(value)),
    },
  }

  const renderItem: ListProps<ActivityLogEntry>['renderItem'] = (item) => (
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
          <CustomSpace split={<CustomDivider type={'vertical'} />}>
            <CustomText>#{item.ID}</CustomText>
            <CustomText>{item.MODEL}</CustomText>
          </CustomSpace>
        }
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomTag color={actionColorMap[item.ACTION] || 'default'}>
              <CustomText style={{ fontSize: 12 }}>{item.ACTION}</CustomText>
            </CustomTag>
            <CustomText style={{ fontSize: 12 }}>
              {item.USERNAME || item.STAFF_NAME || 'N/D'}
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>
              Objeto: {item.OBJECT_ID ?? 'N/D'}
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>
              {formatDate(item.CREATED_AT)}
            </CustomText>
          </CustomSpace>
        }
      />
    </CustomListItem>
  )

  return (
    <CustomList
      columnsMap={columnsMap}
      exportOptions={{ title: 'Bitácora del sistema', orientation: 'landscape' }}
      dataSource={activityLogList}
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

export default ActivityLogList
