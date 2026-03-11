import React from 'react'
import { Alert, Empty, Spin, Tag } from 'antd'
import styled from 'styled-components'
import { getSessionInfo } from 'src/lib/session'
import { dateTime } from 'src/utils/date-utils'
import { useGetWorkshopDashboardQuery } from 'src/services/dashboard/useGetWorkshopDashboardQuery'

const DashboardShell = styled.main`
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colorBgContainer} 0%,
    ${({ theme }) => theme.colorBgLayout} 100%
  );
  border-radius: ${({ theme }) => `${theme.borderRadiusLG ?? 16}px`};
  min-height: calc(100vh - 190px);
  padding: 24px;
`

const Header = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const TitleBlock = styled.div`
  h1 {
    margin: 0;
    font-size: clamp(1.6rem, 3vw, 2.5rem);
    line-height: 1.1;
  }

  p {
    margin: 8px 0 0;
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: ${({ theme }) => `${theme.fontSize + 1}px`};
  }
`

const HeaderNote = styled.div`
  min-width: 280px;
  background: ${({ theme }) => theme.colorBgElevated};
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: ${({ theme }) => `${theme.borderRadius}px`};
  padding: 14px 16px;

  strong {
    display: block;
    margin-bottom: 6px;
  }

  span {
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: ${({ theme }) => `${theme.fontSize}px`};
  }
`

const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(6, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 20px;

  @media (max-width: 1300px) {
    grid-template-columns: repeat(3, minmax(160px, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`

const MetricCard = styled.article`
  background: linear-gradient(
    165deg,
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
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    line-height: 1;
    font-weight: 700;
  }

  .hint {
    margin-top: 8px;
    color: ${({ theme }) => theme.colorTextTertiary};
    font-size: ${({ theme }) => `${theme.fontSize - 1}px`};
  }
`

const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`

const Column = styled.div`
  display: grid;
  gap: 18px;
`

const Panel = styled.section`
  background: ${({ theme }) => theme.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: ${({ theme }) => `${theme.borderRadius}px`};
  padding: 16px;
`

const PanelHeader = styled.header`
  margin-bottom: 14px;

  h3 {
    margin: 0;
    font-size: ${({ theme }) => `${theme.fontSizeLG ?? 18}px`};
  }

  p {
    margin: 6px 0 0;
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: ${({ theme }) => `${theme.fontSize}px`};
  }
`

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
`

const ListItem = styled.li`
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: ${({ theme }) => `${theme.borderRadius}px`};
  padding: 12px 14px;
  background: ${({ theme }) => theme.colorBgElevated};

  .line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }

  .title {
    font-weight: 600;
  }

  .meta {
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: ${({ theme }) => `${theme.fontSize - 1}px`};
  }
`

const StatusBlock = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const summaryItems = (
  summary: ReturnType<typeof useGetWorkshopDashboardQuery>['data']['summary']
) => [
  {
    label: 'Clientes activos',
    value: summary.activeCustomers,
    hint: 'Base actual de clientes',
  },
  {
    label: 'Vehículos activos',
    value: summary.activeVehicles,
    hint: 'Vehículos registrados',
  },
  {
    label: 'Artículos activos',
    value: summary.activeArticles,
    hint: 'Catálogo operativo',
  },
  {
    label: 'OT activas',
    value: summary.activeWorkOrders,
    hint: 'Incluye lista para entrega',
  },
  {
    label: 'Listas para entrega',
    value: summary.readyForDelivery,
    hint: 'Pendientes de salida',
  },
  {
    label: 'Entregas registradas',
    value: summary.totalDeliveries,
    hint: 'Comprobantes emitidos',
  },
]

const getStatusColor = (statusCode = ''): string => {
  if (statusCode === 'LISTA_ENTREGA') return 'gold'
  if (statusCode === 'REPARACION') return 'blue'
  if (statusCode === 'DIAGNOSTICO') return 'purple'
  if (statusCode === 'CREADA') return 'default'
  return 'default'
}

const DashboardPage: React.FC = () => {
  const session = getSessionInfo()
  const { data, isLoading, isFetching, error } = useGetWorkshopDashboardQuery()

  return (
    <DashboardShell>
      <Header>
        <TitleBlock>
          <h1>Panel operativo del taller</h1>
          <p>
            {session?.name
              ? `Hola, ${session.name}. Este resumen usa datos reales del sistema.`
              : 'Resumen operativo con datos reales del sistema.'}
          </p>
        </TitleBlock>

        <HeaderNote>
          <strong>Alcance actual</strong>
          <span>
            Clientes, vehículos, artículos, OT, inventario y entregas.
          </span>
        </HeaderNote>
      </Header>

      {error ? (
        <Alert
          showIcon
          type='error'
          message='No fue posible cargar el dashboard'
          description='Verifica la conexión con el backend o la sesión actual.'
          style={{ marginBottom: 20 }}
        />
      ) : null}

      <Spin spinning={isLoading || isFetching}>
        <SummaryGrid>
          {summaryItems(data.summary).map((item) => (
            <MetricCard key={item.label}>
              <div className='label'>{item.label}</div>
              <div className='value'>{item.value}</div>
              <div className='hint'>{item.hint}</div>
            </MetricCard>
          ))}
        </SummaryGrid>

        <ContentGrid>
          <Column>
            <Panel>
              <PanelHeader>
                <h3>Órdenes en proceso</h3>
                <p>OT abiertas en creación, diagnóstico o reparación.</p>
              </PanelHeader>

              {data.inProgressOrders.length ? (
                <List>
                  {data.inProgressOrders.map((order) => (
                    <ListItem key={order.WORK_ORDER_ID}>
                      <div className='line'>
                        <div className='title'>
                          {order.ORDER_NO} · {order.VEHICLE_LABEL}
                        </div>
                        <Tag color={getStatusColor(order.STATUS_CODE)}>
                          {order.STATUS_NAME}
                        </Tag>
                      </div>
                      <div className='meta'>
                        Cliente: {order.CUSTOMER_NAME || 'N/D'}
                      </div>
                      <div className='meta'>
                        Apertura: {dateTime(order.OPENED_AT) || 'N/D'}
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Empty description='No hay órdenes en proceso.' />
              )}
            </Panel>

            <Panel>
              <PanelHeader>
                <h3>Movimientos recientes de inventario</h3>
                <p>Entradas, salidas y ajustes registrados recientemente.</p>
              </PanelHeader>

              {data.recentMovements.length ? (
                <List>
                  {data.recentMovements.map((movement) => (
                    <ListItem key={movement.MOVEMENT_ID}>
                      <div className='line'>
                        <div className='title'>
                          {movement.MOVEMENT_NO} · {movement.MOVEMENT_TYPE}
                        </div>
                        <Tag>{movement.STATE === 'A' ? 'Activo' : 'Inactivo'}</Tag>
                      </div>
                      <div className='meta'>
                        Referencia: {movement.REFERENCE_SOURCE || 'N/D'}
                      </div>
                      <div className='meta'>
                        Fecha: {dateTime(movement.MOVEMENT_DATE) || 'N/D'}
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Empty description='No hay movimientos registrados.' />
              )}
            </Panel>
          </Column>

          <Column>
            <Panel>
              <PanelHeader>
                <h3>Listas para entrega</h3>
                <p>Órdenes listas para generar comprobante y entregar.</p>
              </PanelHeader>

              {data.readyForDeliveryOrders.length ? (
                <List>
                  {data.readyForDeliveryOrders.map((order) => (
                    <ListItem key={order.WORK_ORDER_ID}>
                      <div className='line'>
                        <div className='title'>{order.ORDER_NO}</div>
                        <StatusBlock>
                          <Tag color='gold'>{order.STATUS_NAME}</Tag>
                        </StatusBlock>
                      </div>
                      <div className='meta'>{order.CUSTOMER_NAME}</div>
                      <div className='meta'>{order.VEHICLE_LABEL}</div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Empty description='No hay órdenes listas para entrega.' />
              )}
            </Panel>

            <Panel>
              <PanelHeader>
                <h3>Entregas recientes</h3>
                <p>Últimos comprobantes internos emitidos.</p>
              </PanelHeader>

              {data.recentDeliveries.length ? (
                <List>
                  {data.recentDeliveries.map((receipt) => (
                    <ListItem key={receipt.DELIVERY_RECEIPT_ID}>
                      <div className='line'>
                        <div className='title'>{receipt.RECEIPT_NO}</div>
                        <Tag color='green'>Entregada</Tag>
                      </div>
                      <div className='meta'>
                        OT: {receipt.WORK_ORDER_NO || 'N/D'}
                      </div>
                      <div className='meta'>
                        Vehículo: {receipt.VEHICLE_LABEL || 'N/D'}
                      </div>
                      <div className='meta'>
                        Fecha: {dateTime(receipt.DELIVERY_DATE) || 'N/D'}
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Empty description='No hay entregas registradas.' />
              )}
            </Panel>
          </Column>
        </ContentGrid>
      </Spin>
    </DashboardShell>
  )
}

export default DashboardPage
