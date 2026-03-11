import React, { useCallback, useEffect } from 'react'
import { Alert, App, Empty, Form } from 'antd'
import {
  DownloadOutlined,
  FilePdfOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import styled from 'styled-components'
import CustomButton from 'src/components/custom/CustomButton'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomRangePicker from 'src/components/custom/CustomRangePicker'
import CustomTable from 'src/components/custom/CustomTable'
import CustomTag from 'src/components/custom/CustomTag'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { DEFAULT_DATE_FORMAT, date } from 'src/utils/date-utils'
import { useGetOperationalReportMutation } from 'src/services/reports/useGetOperationalReportMutation'
import {
  LowStockArticleReportItem,
  OperationalReport,
  TopConsumedArticleReportItem,
  WorkOrdersByStatusReportItem,
} from 'src/services/reports/report.types'
import {
  exportOperationalReportExcel,
  exportOperationalReportPdf,
} from 'src/utils/operational-report-export'

const PageShell = styled.main`
  display: grid;
  gap: 18px;
`

const FilterCard = styled.section`
  background: ${({ theme }) => theme.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: ${({ theme }) => `${theme.borderRadiusLG ?? 16}px`};
  padding: 18px;
`

const FilterHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  h1 {
    margin: 0;
    font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  }

  p {
    margin: 8px 0 0;
    color: ${({ theme }) => theme.colorTextSecondary};
  }

  @media (max-width: 820px) {
    flex-direction: column;
  }
`

const FilterActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 360px) auto;
  gap: 12px;
  align-items: end;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`

const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(6, minmax(160px, 1fr));
  gap: 14px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, minmax(180px, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`

const SummaryCard = styled.article`
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colorBgElevated} 0%,
    ${({ theme }) => theme.colorBgContainer} 100%
  );
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: ${({ theme }) => `${theme.borderRadius}px`};
  padding: 16px;

  .label {
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: ${({ theme }) => `${theme.fontSize}px`};
    margin-bottom: 10px;
  }

  .value {
    font-size: clamp(1.5rem, 2.6vw, 2rem);
    font-weight: 700;
    line-height: 1;
  }

  .hint {
    margin-top: 8px;
    color: ${({ theme }) => theme.colorTextTertiary};
    font-size: ${({ theme }) => `${theme.fontSize - 1}px`};
  }
`

const Panels = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`

const Panel = styled.section`
  background: ${({ theme }) => theme.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: ${({ theme }) => `${theme.borderRadiusLG ?? 16}px`};
  padding: 18px;
  min-width: 0;
`

const PanelHeader = styled.div`
  margin-bottom: 14px;

  h3 {
    margin: 0;
    font-size: ${({ theme }) => `${theme.fontSizeLG ?? 18}px`};
  }

  p {
    margin: 6px 0 0;
    color: ${({ theme }) => theme.colorTextSecondary};
  }
`

const EmptyState = styled.div`
  padding: 12px 0 4px;
`

const statusColorMap: Record<string, string> = {
  CREADA: 'default',
  DIAGNOSTICO: 'processing',
  REPARACION: 'warning',
  LISTA_ENTREGA: 'success',
  ENTREGADA: 'success',
  CANCELADA: 'error',
}

const formatNumber = (value?: number | null) =>
  Number(value || 0).toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const initialRange = [dayjs().startOf('month'), dayjs().endOf('month')]

const summaryCards = (report: OperationalReport) => [
  {
    label: 'OT abiertas',
    value: report.SUMMARY.OPENED_WORK_ORDERS,
    hint: 'Órdenes creadas en el período',
  },
  {
    label: 'OT entregadas',
    value: report.SUMMARY.DELIVERED_WORK_ORDERS,
    hint: 'Órdenes cerradas y entregadas',
  },
  {
    label: 'OT canceladas',
    value: report.SUMMARY.CANCELLED_WORK_ORDERS,
    hint: 'Órdenes canceladas en el período',
  },
  {
    label: 'Comprobantes',
    value: report.SUMMARY.DELIVERY_RECEIPTS,
    hint: 'Entregas emitidas',
  },
  {
    label: 'Consumo inventario',
    value: formatNumber(report.SUMMARY.INVENTORY_CONSUMPTION_QUANTITY),
    hint: 'Unidades consumidas por OT',
  },
  {
    label: 'Artículos críticos',
    value: report.SUMMARY.ARTICLES_BELOW_MINIMUM,
    hint: `Cierre prom.: ${formatNumber(report.SUMMARY.AVERAGE_CLOSURE_DAYS)} días`,
  },
]

const statusColumns = [
  {
    title: 'Estado',
    dataIndex: 'STATUS_NAME',
    key: 'STATUS_NAME',
    render: (_: unknown, record: WorkOrdersByStatusReportItem) => (
      <CustomTag color={statusColorMap[record.STATUS_CODE] || 'default'}>
        {record.STATUS_NAME}
      </CustomTag>
    ),
  },
  {
    title: 'Código',
    dataIndex: 'STATUS_CODE',
    key: 'STATUS_CODE',
  },
  {
    title: 'Total',
    dataIndex: 'TOTAL',
    key: 'TOTAL',
  },
]

const consumedColumns = [
  {
    title: 'Artículo',
    dataIndex: 'ARTICLE_NAME',
    key: 'ARTICLE_NAME',
    render: (_: unknown, record: TopConsumedArticleReportItem) => (
      <>{`${record.ARTICLE_CODE} - ${record.ARTICLE_NAME}`}</>
    ),
  },
  {
    title: 'Cantidad',
    dataIndex: 'TOTAL_QUANTITY',
    key: 'TOTAL_QUANTITY',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Movimientos',
    dataIndex: 'MOVEMENT_COUNT',
    key: 'MOVEMENT_COUNT',
  },
  {
    title: 'Costo estimado',
    dataIndex: 'TOTAL_ESTIMATED_COST',
    key: 'TOTAL_ESTIMATED_COST',
    render: (value: number) => `RD$ ${formatNumber(value)}`,
  },
]

const lowStockColumns = [
  {
    title: 'Artículo',
    dataIndex: 'NAME',
    key: 'NAME',
    render: (_: unknown, record: LowStockArticleReportItem) => (
      <>{`${record.CODE} - ${record.NAME}`}</>
    ),
  },
  {
    title: 'Tipo',
    dataIndex: 'ITEM_TYPE',
    key: 'ITEM_TYPE',
  },
  {
    title: 'Stock actual',
    dataIndex: 'CURRENT_STOCK',
    key: 'CURRENT_STOCK',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Mínimo',
    dataIndex: 'MIN_STOCK',
    key: 'MIN_STOCK',
    render: (value: number) => formatNumber(value),
  },
  {
    title: 'Déficit',
    dataIndex: 'DEFICIT',
    key: 'DEFICIT',
    render: (value: number) => (
      <CustomTag color={'error'}>{formatNumber(value)}</CustomTag>
    ),
  },
]

const technicianColumns = [
  {
    title: 'Técnico',
    dataIndex: 'FULL_NAME',
    key: 'FULL_NAME',
  },
  {
    title: 'Usuario',
    dataIndex: 'USERNAME',
    key: 'USERNAME',
  },
  {
    title: 'Asignadas',
    dataIndex: 'TOTAL_ASSIGNED_ORDERS',
    key: 'TOTAL_ASSIGNED_ORDERS',
  },
  {
    title: 'Líder',
    dataIndex: 'LEAD_ORDERS',
    key: 'LEAD_ORDERS',
  },
  {
    title: 'Entregadas',
    dataIndex: 'DELIVERED_ORDERS',
    key: 'DELIVERED_ORDERS',
  },
]

const renderPanelTable = (
  title: string,
  description: string,
  dataSource: object[],
  columns: object[],
  rowKey: string | ((record: Record<string, unknown>) => string | number)
) => (
  <Panel>
    <PanelHeader>
      <h3>{title}</h3>
      <p>{description}</p>
    </PanelHeader>
    {dataSource.length ? (
      <CustomTable
        columns={columns as never}
        dataSource={dataSource}
        pagination={false}
        rowKey={rowKey as never}
        scroll={{ x: 640 }}
      />
    ) : (
      <EmptyState>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin datos para el período seleccionado."
        />
      </EmptyState>
    )}
  </Panel>
)

const Page: React.FC = () => {
  const { notification } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [form] = Form.useForm()
  const {
    mutate: getOperationalReport,
    data: report,
    isPending,
  } = useGetOperationalReportMutation()

  const runReport = useCallback(() => {
    const range = form.getFieldValue('DATE_RANGE') as
      | [Dayjs | null, Dayjs | null]
      | undefined

    getOperationalReport({
      START_DATE: range?.[0]?.format(DEFAULT_DATE_FORMAT) ?? null,
      END_DATE: range?.[1]?.format(DEFAULT_DATE_FORMAT) ?? null,
    })
  }, [form, getOperationalReport])

  useEffect(() => {
    form.setFieldsValue({
      DATE_RANGE: initialRange,
    })
    runReport()
  }, [])

  const handleReset = useCallback(() => {
    form.setFieldsValue({
      DATE_RANGE: initialRange,
    })
    setTimeout(runReport, 0)
  }, [form, runReport])

  const handleExport = useCallback(
    async (format: 'excel' | 'pdf') => {
      try {
        const hasData =
          report.WORK_ORDERS_BY_STATUS.length ||
          report.TOP_CONSUMED_ARTICLES.length ||
          report.LOW_STOCK_ARTICLES.length ||
          report.TOP_TECHNICIANS.length

        if (!hasData) {
          notification.warning({
            message: 'Sin datos',
            description:
              'No hay información para exportar con el rango seleccionado.',
          })
          return
        }

        if (format === 'excel') {
          await exportOperationalReportExcel(report)
        } else {
          await exportOperationalReportPdf(report)
        }
      } catch (error) {
        errorHandler(error)
      }
    },
    [errorHandler, notification, report]
  )

  return (
    <PageShell>
      <FilterCard>
        <FilterHeader>
          <div>
            <h1>Reportes operativos</h1>
            <p>
              Vista consolidada del taller por período. Cruza órdenes, entregas,
              consumo e inventario.
            </p>
          </div>
          <FilterActions>
            <CustomButton
              icon={<DownloadOutlined />}
              onClick={() => handleExport('excel')}
            >
              Excel
            </CustomButton>
            <CustomButton
              icon={<FilePdfOutlined />}
              onClick={() => handleExport('pdf')}
            >
              PDF
            </CustomButton>
          </FilterActions>
        </FilterHeader>

        <Form form={form} layout="vertical">
          <FilterRow>
            <CustomFormItem label="Rango de fechas" name="DATE_RANGE">
              <CustomRangePicker allowClear={false} width="100%" />
            </CustomFormItem>
            <CustomFormItem>
              <FilterActions>
                <CustomButton onClick={handleReset}>Este mes</CustomButton>
                <CustomButton
                  type="primary"
                  icon={<SearchOutlined />}
                  loading={isPending}
                  onClick={runReport}
                >
                  Consultar
                </CustomButton>
              </FilterActions>
            </CustomFormItem>
          </FilterRow>
        </Form>

        <Alert
          style={{ marginTop: 6 }}
          type="info"
          showIcon
          message={`Período analizado: ${date(report.FILTERS.START_DATE || '') || 'Sin límite'} - ${date(report.FILTERS.END_DATE || '') || 'Sin límite'}`}
        />
      </FilterCard>

      <SummaryGrid>
        {summaryCards(report).map((item) => (
          <SummaryCard key={item.label}>
            <div className="label">{item.label}</div>
            <div className="value">{item.value}</div>
            <div className="hint">{item.hint}</div>
          </SummaryCard>
        ))}
      </SummaryGrid>

      {!isPending &&
        !summaryCards(report).some((item) => Number(item.value || 0) > 0) && (
          <Alert
            type="warning"
            showIcon
            message="No hay movimientos operativos en el rango seleccionado."
            description="Revisa otro período o continúa generando operaciones de prueba."
          />
        )}

      <Panels>
        {renderPanelTable(
          'Órdenes por estado',
          'Distribución de OT abiertas en el período según su estado actual.',
          report.WORK_ORDERS_BY_STATUS,
          statusColumns,
          'STATUS_CODE'
        )}
        {renderPanelTable(
          'Artículos más consumidos',
          'Top de artículos usados en movimientos de consumo asociados a OT.',
          report.TOP_CONSUMED_ARTICLES,
          consumedColumns,
          'ARTICLE_ID'
        )}
        {renderPanelTable(
          'Artículos bajo mínimo',
          'Stock actual por debajo del mínimo configurado.',
          report.LOW_STOCK_ARTICLES,
          lowStockColumns,
          'ARTICLE_ID'
        )}
        {renderPanelTable(
          'Técnicos con mayor carga',
          'Órdenes asignadas y entregadas dentro del período.',
          report.TOP_TECHNICIANS,
          technicianColumns,
          'STAFF_ID'
        )}
      </Panels>

      {isPending && (
        <CustomText type="secondary">Generando reporte operativo...</CustomText>
      )}
    </PageShell>
  )
}

export default Page
