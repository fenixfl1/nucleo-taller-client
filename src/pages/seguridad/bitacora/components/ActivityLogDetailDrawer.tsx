import { DescriptionsProps } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import styled from 'styled-components'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomDescriptions from 'src/components/custom/CustomDescription'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomDrawer from 'src/components/custom/CustomDrawer'
import {
  CustomParagraph,
  CustomText,
  CustomTitle,
} from 'src/components/custom/CustomParagraph'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTag from 'src/components/custom/CustomTag'
import { useGetOneActivityLogQuery } from 'src/services/activity-logs/useGetOneActivityLogQuery'
import CustomCollapse from 'src/components/custom/CustomCollapse'

interface ActivityLogDetailDrawerProps {
  activityLogId?: number
  open?: boolean
  onClose?: () => void
}

const JsonBlock = styled.pre`
  margin: 0;
  padding: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
  background: ${({ theme }) => theme.colorBgElevated};
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: ${({ theme }) => `${theme.borderRadius}px`};
  color: ${({ theme }) => theme.colorText};
  font-size: ${({ theme }) => `${theme.fontSize - 1}px`};
`

const actionColorMap: Record<string, string> = {
  INSERT: 'success',
  UPDATE: 'processing',
  DELETE: 'error',
}

const employeeTypeColorMap: Record<string, string> = {
  OPERACIONAL: 'blue',
  ADMINISTRATIVO: 'purple',
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm:ss') : 'N/A'

const formatChanges = (changes?: Record<string, unknown> | null) => {
  if (!changes) return 'Sin cambios registrados.'
  return JSON.stringify(changes, null, 2)
}

const resolveObjectLabel = (
  objectId?: number | null,
  changes?: Record<string, unknown> | null
) => {
  if (objectId !== null && objectId !== undefined) {
    return String(objectId)
  }

  const compositeId = changes?.__id
  if (compositeId !== undefined) {
    return typeof compositeId === 'object'
      ? JSON.stringify(compositeId)
      : String(compositeId)
  }

  return 'N/D'
}

const ActivityLogDetailDrawer: React.FC<ActivityLogDetailDrawerProps> = ({
  activityLogId,
  open,
  onClose,
}) => {
  const {
    data: activityLog,
    isLoading,
    isFetching,
  } = useGetOneActivityLogQuery(activityLogId, Boolean(open))

  const items: DescriptionsProps['items'] = [
    { key: 'id', label: 'ID', children: activityLog?.ID },
    {
      key: 'action',
      label: 'Acción',
      children: (
        <CustomTag
          color={actionColorMap[activityLog?.ACTION || ''] || 'default'}
        >
          {activityLog?.ACTION || 'N/D'}
        </CustomTag>
      ),
    },
    { key: 'model', label: 'Entidad', children: activityLog?.MODEL || 'N/D' },
    {
      key: 'object-id',
      label: 'Objeto',
      children: resolveObjectLabel(
        activityLog?.OBJECT_ID,
        activityLog?.CHANGES
      ),
    },
    {
      key: 'user',
      label: 'Usuario',
      children: activityLog?.USERNAME || 'N/D',
    },
    {
      key: 'staff',
      label: 'Personal',
      children: activityLog?.STAFF_NAME || 'N/D',
    },
    {
      key: 'employee-type',
      label: 'Tipo de empleado',
      children: (
        <CustomTag
          color={employeeTypeColorMap[activityLog?.EMPLOYEE_TYPE || ''] || 'default'}
        >
          {activityLog?.EMPLOYEE_TYPE === 'ADMINISTRATIVO'
            ? 'Administrativo'
            : activityLog?.EMPLOYEE_TYPE === 'OPERACIONAL'
              ? 'Operacional'
              : 'N/D'}
        </CustomTag>
      ),
    },
    {
      key: 'created-at',
      label: 'Fecha',
      children: formatDate(activityLog?.CREATED_AT),
    },
    { key: 'ip', label: 'IP', children: activityLog?.IP || 'N/D' },
    {
      key: 'user-agent',
      label: 'User Agent',
      children: activityLog?.USER_AGENT || 'N/D',
      span: 2,
    },
  ]

  return (
    <CustomDrawer
      open={open}
      onClose={onClose}
      width={'55%'}
      closable={false}
      title={'Detalle de bitácora'}
    >
      <CustomSpin spinning={isLoading || isFetching}>
        <ConditionalComponent condition={Boolean(activityLog)}>
          <CustomDescriptions column={2} items={items} />

          <CustomDivider />

          <CustomCollapse
            expandIconPosition={'right'}
            defaultActiveKey={[1]}
            items={[
              {
                key: 1,
                label: <CustomTitle level={5}>Cambios registrados</CustomTitle>,
                children: (
                  <CustomParagraph>
                    <JsonBlock>{formatChanges(activityLog?.CHANGES)}</JsonBlock>
                  </CustomParagraph>
                ),
              },
            ]}
          />

          <CustomDivider />
          <CustomText type="secondary" style={{ fontSize: 12 }}>
            La bitácora registra inserciones, actualizaciones y eliminaciones
            capturadas por el subscriber global del backend.
          </CustomText>
        </ConditionalComponent>
      </CustomSpin>
    </CustomDrawer>
  )
}

export default ActivityLogDetailDrawer
