import { DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import { DescriptionsProps, Empty } from 'antd'
import dayjs from 'dayjs'
import React, { useMemo, useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDescriptions from 'src/components/custom/CustomDescription'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomDrawer from 'src/components/custom/CustomDrawer'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTag from 'src/components/custom/CustomTag'
import CustomTimeline from 'src/components/custom/CustomTimeline'
import { useGetCompatibleArticlesByVehicleQuery } from 'src/services/articles/useGetCompatibleArticlesByVehicleQuery'
import { Article } from 'src/services/articles/article.types'
import { useGetOneWorkOrderQuery } from 'src/services/work-orders/useGetOneWorkOrderQuery'
import { downloadWorkOrderPdf } from 'src/utils/work-order-pdf'
import WorkOrderPreviewModal from './WorkOrderPreviewModal'

interface WorkOrderDetailDrawerProps {
  workOrderId?: number
  open?: boolean
  onClose?: () => void
}

const statusColorByCode: Record<string, string> = {
  CREADA: 'default',
  DIAGNOSTICO: 'processing',
  REPARACION: 'warning',
  LISTA_ENTREGA: 'cyan',
  ENTREGADA: 'success',
  CANCELADA: 'error',
}

const statusTimelineColorByCode: Record<string, string> = {
  CREADA: '#9ca3af',
  DIAGNOSTICO: '#1677ff',
  REPARACION: '#faad14',
  LISTA_ENTREGA: '#13c2c2',
  ENTREGADA: '#52c41a',
  CANCELADA: '#ff4d4f',
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const buildCompatibilityLabel = (article: Article): string => {
  const compatibility = article.COMPATIBILITIES?.[0]

  if (!compatibility) {
    return 'Compatibilidad configurada'
  }

  const years =
    compatibility.YEAR_FROM || compatibility.YEAR_TO
      ? `${compatibility.YEAR_FROM || ''}${compatibility.YEAR_TO ? `-${compatibility.YEAR_TO}` : ''}`
      : ''

  return [
    compatibility.BRAND,
    compatibility.MODEL,
    years,
    compatibility.ENGINE,
  ]
    .filter(Boolean)
    .join(' ')
}

const formatAmount = (value: number) => Number(value || 0).toFixed(2)

const WorkOrderDetailDrawer: React.FC<WorkOrderDetailDrawerProps> = ({
  workOrderId,
  open,
  onClose,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const {
    data: workOrder,
    isLoading,
    isFetching,
  } = useGetOneWorkOrderQuery(workOrderId, Boolean(open))
  const {
    data: compatibleArticles = [],
    isLoading: isCompatibleArticlesLoading,
    isFetching: isCompatibleArticlesFetching,
  } = useGetCompatibleArticlesByVehicleQuery(
    workOrder?.VEHICLE_ID,
    Boolean(open && workOrder?.VEHICLE_ID)
  )

  const compatibleArticleMap = useMemo(
    () =>
      new Map(
        compatibleArticles.map((item) => [
          Number(item.ARTICLE_ID),
          buildCompatibilityLabel(item),
        ])
      ),
    [compatibleArticles]
  )

  const serviceLinesTotal = useMemo(
    () =>
      Number(
        ((workOrder?.SERVICE_LINES || []).reduce((accumulator, item) => {
          return (
            accumulator +
            Number(item?.QUANTITY || 0) * Number(item?.REFERENCE_AMOUNT || 0)
          )
        }, 0) || 0).toFixed(2)
      ),
    [workOrder?.SERVICE_LINES]
  )

  const descriptionItems: DescriptionsProps['items'] = [
    {
      key: 'order-no',
      label: 'Orden',
      children: workOrder?.ORDER_NO,
    },
    {
      key: 'status',
      label: 'Estado',
      children: (
        <CustomTag color={statusColorByCode[workOrder?.STATUS_CODE || ''] || 'default'}>
          {workOrder?.STATUS_NAME}
        </CustomTag>
      ),
    },
    {
      key: 'customer',
      label: 'Cliente',
      children: workOrder?.CUSTOMER_NAME || 'N/A',
    },
    {
      key: 'vehicle',
      label: 'Vehículo',
      children: workOrder?.VEHICLE_LABEL || 'N/A',
    },
    {
      key: 'opened-at',
      label: 'Apertura',
      children: formatDate(workOrder?.OPENED_AT),
    },
    {
      key: 'promised-at',
      label: 'Promesa',
      children: formatDate(workOrder?.PROMISED_AT),
    },
    {
      key: 'received-by',
      label: 'Recibida por',
      children: workOrder?.RECEIVED_BY_NAME || 'N/A',
    },
    {
      key: 'delivered-by',
      label: 'Entregada por',
      children: workOrder?.DELIVERED_BY_NAME || 'N/A',
    },
    {
      key: 'symptom',
      label: 'Síntoma',
      children: workOrder?.SYMPTOM || 'N/A',
      span: 2,
    },
    {
      key: 'diagnosis',
      label: 'Diagnóstico',
      children: workOrder?.DIAGNOSIS || 'N/A',
      span: 2,
    },
    {
      key: 'work-performed',
      label: 'Trabajo realizado',
      children: workOrder?.WORK_PERFORMED || 'N/A',
      span: 2,
    },
    {
      key: 'customer-observations',
      label: 'Observ. cliente',
      children: workOrder?.CUSTOMER_OBSERVATIONS || 'N/A',
      span: 2,
    },
    {
      key: 'internal-notes',
      label: 'Notas internas',
      children: workOrder?.INTERNAL_NOTES || 'N/A',
      span: 2,
    },
    {
      key: 'disassembly',
      label: 'Requiere desmonte',
      children: workOrder?.REQUIRES_DISASSEMBLY ? 'Sí' : 'No',
    },
  ]

  return (
    <CustomDrawer
      open={open}
      onClose={onClose}
      width={'55%'}
      closable={false}
      title={'Detalle de orden de trabajo'}
      extra={
        <CustomSpace direction={'horizontal'} width={'auto'}>
          <CustomButton
            icon={<EyeOutlined />}
            disabled={!workOrder}
            onClick={() => setPreviewOpen(true)}
          >
            Vista previa
          </CustomButton>
          <CustomButton
            type={'primary'}
            icon={<DownloadOutlined />}
            disabled={!workOrder}
            onClick={() =>
              workOrder ? void downloadWorkOrderPdf(workOrder) : undefined
            }
          >
            PDF
          </CustomButton>
        </CustomSpace>
      }
    >
      <CustomSpin
        spinning={
          isLoading ||
          isFetching ||
          isCompatibleArticlesLoading ||
          isCompatibleArticlesFetching
        }
      >
        <ConditionalComponent condition={Boolean(workOrder)} fallback={<Empty />}>
          <CustomDescriptions column={2} items={descriptionItems} />

          <CustomDivider />
          <CustomTitle level={5}>Servicios</CustomTitle>
          <ConditionalComponent
            condition={Boolean(workOrder?.SERVICE_LINES?.length)}
            fallback={<Empty description={'Sin servicios registrados'} />}
          >
            <div style={{ marginBottom: 12 }}>
              <CustomTag color={'gold'}>
                Total servicios: {formatAmount(serviceLinesTotal)}
              </CustomTag>
            </div>
            <CustomList
              dataSource={workOrder?.SERVICE_LINES || []}
              renderItem={(item) => (
                <CustomListItem>
                  <CustomListItemMeta
                    title={
                      <CustomText>
                        {item.SERVICE_TYPE} - {item.DESCRIPTION}
                      </CustomText>
                    }
                    description={
                      <CustomText style={{ fontSize: 12 }}>
                        Cantidad: {Number(item.QUANTITY || 0).toFixed(2)} | Precio Ref.:
                        {' '}
                        {formatAmount(Number(item.REFERENCE_AMOUNT || 0))} | Total:{' '}
                        {formatAmount(
                          Number(item.QUANTITY || 0) *
                            Number(item.REFERENCE_AMOUNT || 0)
                        )}
                        {item.NOTES ? ` | ${item.NOTES}` : ''}
                      </CustomText>
                    }
                  />
                </CustomListItem>
              )}
            />
          </ConditionalComponent>

          <CustomDivider />
          <CustomTitle level={5}>Consumo de artículos</CustomTitle>
          <ConditionalComponent
            condition={Boolean(workOrder?.CONSUMED_ITEMS?.length)}
            fallback={<Empty description={'Sin consumo registrado'} />}
          >
            <CustomList
              dataSource={workOrder?.CONSUMED_ITEMS || []}
              renderItem={(item) => (
                <CustomListItem>
                  <CustomListItemMeta
                    title={
                      <CustomText>
                        {item.ARTICLE_CODE} - {item.ARTICLE_NAME}
                      </CustomText>
                    }
                    description={(() => {
                      const compatibilityLabel = compatibleArticleMap.get(
                        Number(item.ARTICLE_ID)
                      )

                      return (
                        <>
                          <CustomText style={{ fontSize: 12 }}>
                            Cantidad: {Number(item.QUANTITY || 0).toFixed(2)} | Costo
                            Ref.:{' '}
                            {item.UNIT_COST_REFERENCE === null ||
                            item.UNIT_COST_REFERENCE === undefined
                              ? 'N/A'
                              : Number(item.UNIT_COST_REFERENCE).toFixed(2)}
                            {item.NOTES ? ` | ${item.NOTES}` : ''}
                          </CustomText>

                          <div style={{ marginTop: 6 }}>
                            <CustomTag
                              color={compatibilityLabel ? 'processing' : 'default'}
                            >
                              {compatibilityLabel
                                ? 'Compatible con el vehículo'
                                : 'Sin coincidencia registrada'}
                            </CustomTag>
                            {compatibilityLabel ? (
                              <CustomText style={{ fontSize: 12 }}>
                                {compatibilityLabel}
                              </CustomText>
                            ) : null}
                          </div>
                        </>
                      )
                    })()}
                  />
                </CustomListItem>
              )}
            />
          </ConditionalComponent>

          <CustomDivider />
          <CustomTitle level={5}>Técnicos</CustomTitle>
          <ConditionalComponent
            condition={Boolean(workOrder?.TECHNICIANS?.length)}
            fallback={<Empty description={'Sin técnicos asignados'} />}
          >
            <CustomList
              dataSource={workOrder?.TECHNICIANS || []}
              renderItem={(item) => (
                <CustomListItem>
                  <CustomListItemMeta
                    title={<CustomText>{item.STAFF_NAME}</CustomText>}
                    description={
                      <CustomText style={{ fontSize: 12 }}>
                        {item.ROLE_ON_JOB || 'Sin rol'}
                        {item.IS_LEAD ? ' | Líder' : ''}
                        {item.REFERENCE_PERCENT !== null &&
                        item.REFERENCE_PERCENT !== undefined
                          ? ` | % Ref.: ${Number(item.REFERENCE_PERCENT).toFixed(2)}`
                          : ''}
                        {item.REFERENCE_AMOUNT !== null &&
                        item.REFERENCE_AMOUNT !== undefined
                          ? ` | Monto Ref.: ${Number(item.REFERENCE_AMOUNT).toFixed(2)}`
                          : ''}
                        {item.NOTES ? ` | ${item.NOTES}` : ''}
                      </CustomText>
                    }
                  />
                </CustomListItem>
              )}
            />
          </ConditionalComponent>

          <CustomDivider />
          <CustomTitle level={5}>Historial de estados</CustomTitle>
          <ConditionalComponent
            condition={Boolean(workOrder?.STATUS_HISTORY?.length)}
            fallback={<Empty description={'Sin historial registrado'} />}
          >
            <CustomTimeline
              mode={'left'}
              items={(workOrder?.STATUS_HISTORY || []).map((item) => ({
                color:
                  statusTimelineColorByCode[item.STATUS_CODE] || '#1677ff',
                children: (
                  <CustomText>
                    {item.STATUS_NAME} - {item.CHANGED_BY_NAME} -{' '}
                    {formatDate(item.CHANGED_AT)}
                    {item.NOTES ? ` - ${item.NOTES}` : ''}
                  </CustomText>
                ),
              }))}
            />
          </ConditionalComponent>
        </ConditionalComponent>
      </CustomSpin>
      <WorkOrderPreviewModal
        open={previewOpen}
        workOrder={workOrder}
        onClose={() => setPreviewOpen(false)}
      />
    </CustomDrawer>
  )
}

export default WorkOrderDetailDrawer
