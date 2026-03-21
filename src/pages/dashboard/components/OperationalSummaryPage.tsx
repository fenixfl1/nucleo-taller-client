import React from 'react'
import { Alert, Empty, Spin, Tag } from 'antd'
import styled from 'styled-components'
import { getSessionInfo } from 'src/lib/session'
import { dateTime } from 'src/utils/date-utils'
import { useGetWorkshopDashboardQuery } from 'src/services/dashboard/useGetWorkshopDashboardQuery'
import CustomButton from 'src/components/custom/CustomButton'
import { useNavigate } from 'react-router'
import { buildActivityPath } from 'src/utils/activity-path'
import CustomTooltip from 'src/components/custom/CustomTooltip'

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

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
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

const FleetGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
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

const PanelHeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: flex-start;
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
    label: 'Vehículos de servicio',
    value: summary.activeServiceVehicles,
    hint: 'Flota interna activa',
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
  {
    label: 'Flota disponible',
    value: summary.availableServiceVehicles,
    hint: 'Vehículos internos listos para uso',
  },
  {
    label: 'Mant. pendientes',
    value: summary.pendingServiceVehicleMaintenance,
    hint: 'Incluye mantenimientos vencidos',
  },
  {
    label: 'Mant. vencidos',
    value: summary.overdueServiceVehicleMaintenance,
    hint: 'Atención inmediata de flota',
  },
  {
    label: 'Horas de uso',
    value: formatMetricNumber(summary.totalServiceVehicleUsageHours),
    hint: 'Acumulado histórico de salidas',
  },
  {
    label: 'Km acumulados',
    value: formatMetricNumber(summary.totalServiceVehicleUsageKilometers),
    hint: 'Recorrido histórico registrado',
  },
]

const getStatusColor = (statusCode = ''): string => {
  if (statusCode === 'LISTA_ENTREGA') return 'gold'
  if (statusCode === 'REPARACION') return 'blue'
  if (statusCode === 'DIAGNOSTICO') return 'purple'
  if (statusCode === 'CREADA') return 'default'
  return 'default'
}

const getAvailabilityColor = (status = ''): string => {
  if (status === 'DISPONIBLE') return 'green'
  if (status === 'DISPONIBLE_CON_PENDIENTE') return 'gold'
  if (status === 'EN_MANTENIMIENTO') return 'orange'
  if (status === 'EN_USO') return 'blue'
  if (status === 'INACTIVO') return 'default'
  return 'default'
}

const getAvailabilityLabel = (status = ''): string => {
  if (status === 'DISPONIBLE_CON_PENDIENTE') return 'Disponible con pendiente'
  if (status === 'EN_MANTENIMIENTO') return 'En mantenimiento'
  if (status === 'EN_USO') return 'En uso'
  if (status === 'INACTIVO') return 'Inactivo'
  return 'Disponible'
}

function formatMetricNumber(value: number): string {
  return value.toLocaleString('es-DO', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

const DashboardPage: React.FC = () => {
  const session = getSessionInfo()
  const navigate = useNavigate()
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

          <HeaderActions>
            <CustomTooltip title={'Nueva Orden de Trabajo'}>
              <CustomButton
                type={'primary'}
                onClick={() =>
                  navigate(
                    buildActivityPath('0-4', '/ordenes-trabajo?action=create')
                  )
                }
              >
                Nueva OT
              </CustomButton>
            </CustomTooltip>
            <CustomTooltip title={'Buscar ordene de trabajo'}>
              <CustomButton
                onClick={() =>
                  navigate(buildActivityPath('0-4', '/ordenes-trabajo'))
                }
              >
                Buscar OT
              </CustomButton>
            </CustomTooltip>
            <CustomTooltip title={'Registrar Nueva entrega'}>
              <CustomButton
                onClick={() =>
                  navigate(buildActivityPath('0-6', '/entregas?action=create'))
                }
              >
                Nueva entrega
              </CustomButton>
            </CustomTooltip>
          </HeaderActions>
        </TitleBlock>

        <HeaderNote>
          <strong>Alcance actual</strong>
          <span>
            Clientes, vehículos, vehículos de servicio, artículos, OT,
            inventario y entregas.
          </span>
        </HeaderNote>
      </Header>

      {error ? (
        <Alert
          showIcon
          type="error"
          message="No fue posible cargar el dashboard"
          description="Verifica la conexión con el backend o la sesión actual."
          style={{ marginBottom: 20 }}
        />
      ) : null}

      <Spin spinning={isLoading || isFetching}>
        <SummaryGrid>
          {summaryItems(data.summary).map((item) => (
            <MetricCard key={item.label}>
              <div className="label">{item.label}</div>
              <div className="value">{item.value}</div>
              <div className="hint">{item.hint}</div>
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
                      <div className="line">
                        <div className="title">
                          {order.ORDER_NO} · {order.VEHICLE_LABEL}
                        </div>
                        <Tag color={getStatusColor(order.STATUS_CODE)}>
                          {order.STATUS_NAME}
                        </Tag>
                      </div>
                      <div className="meta">
                        Cliente: {order.CUSTOMER_NAME || 'N/D'}
                      </div>
                      <div className="meta">
                        Apertura: {dateTime(order.OPENED_AT) || 'N/D'}
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Empty description="No hay órdenes en proceso." />
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
                      <div className="line">
                        <div className="title">
                          {movement.MOVEMENT_NO} · {movement.MOVEMENT_TYPE}
                        </div>
                        <Tag>
                          {movement.STATE === 'A' ? 'Activo' : 'Inactivo'}
                        </Tag>
                      </div>
                      <div className="meta">
                        Referencia: {movement.REFERENCE_SOURCE || 'N/D'}
                      </div>
                      <div className="meta">
                        Fecha: {dateTime(movement.MOVEMENT_DATE) || 'N/D'}
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Empty description="No hay movimientos registrados." />
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
                      <div className="line">
                        <div className="title">{order.ORDER_NO}</div>
                        <StatusBlock>
                          <Tag color="gold">{order.STATUS_NAME}</Tag>
                        </StatusBlock>
                      </div>
                      <div className="meta">{order.CUSTOMER_NAME}</div>
                      <div className="meta">{order.VEHICLE_LABEL}</div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Empty description="No hay órdenes listas para entrega." />
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
                      <div className="line">
                        <div className="title">{receipt.RECEIPT_NO}</div>
                        <Tag color="green">Entregada</Tag>
                      </div>
                      <div className="meta">
                        OT: {receipt.WORK_ORDER_NO || 'N/D'}
                      </div>
                      <div className="meta">
                        Vehículo: {receipt.VEHICLE_LABEL || 'N/D'}
                      </div>
                      <div className="meta">
                        Fecha: {dateTime(receipt.DELIVERY_DATE) || 'N/D'}
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Empty description="No hay entregas registradas." />
              )}
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelHeaderTop>
                  <h3>Vehículos de servicio</h3>
                  <CustomButton
                    size="small"
                    onClick={() =>
                      navigate(
                        buildActivityPath(
                          '0-8-3',
                          '/configuracion/vehiculos-servicio'
                        )
                      )
                    }
                  >
                    Ver módulo
                  </CustomButton>
                </PanelHeaderTop>
                <p>Últimos vehículos internos registrados en el taller.</p>
              </PanelHeader>

              {data.recentServiceVehicles.length ? (
                <List>
                  {data.recentServiceVehicles.map((vehicle) => (
                    <ListItem key={vehicle.SERVICE_VEHICLE_ID}>
                      <div className="line">
                        <div className="title">
                          {vehicle.NAME || vehicle.PLATE || 'Vehículo interno'}
                        </div>
                        <Tag
                          color={vehicle.STATE === 'A' ? 'green' : 'default'}
                        >
                          {vehicle.STATE === 'A' ? 'Activo' : 'Inactivo'}
                        </Tag>
                      </div>
                      <div className="meta">
                        Placa: {vehicle.PLATE || 'N/D'}
                      </div>
                      <div className="meta">
                        {vehicle.BRAND || 'N/D'} {vehicle.MODEL || ''}
                      </div>
                      <div className="meta">
                        Registro: {dateTime(vehicle.CREATED_AT) || 'N/D'}
                      </div>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Empty description="No hay vehículos de servicio registrados." />
              )}
            </Panel>
          </Column>
        </ContentGrid>

        <FleetGrid>
          <Panel>
            <PanelHeader>
              <PanelHeaderTop>
                <h3>Mantenimiento de flota</h3>
                <CustomButton
                  size="small"
                  onClick={() =>
                    navigate(
                      buildActivityPath(
                        '0-8-4',
                        '/configuracion/vehiculos-servicio/mantenimientos'
                      )
                    )
                  }
                >
                  Ver mantenimientos
                </CustomButton>
              </PanelHeaderTop>
              <p>Mantenimientos pendientes o vencidos por vehículo.</p>
            </PanelHeader>

            {data.fleetMaintenanceAlerts.length ? (
              <List>
                {data.fleetMaintenanceAlerts.map((vehicle) => (
                  <ListItem key={vehicle.SERVICE_VEHICLE_ID}>
                    <div className="line">
                      <div className="title">
                        {vehicle.VEHICLE_NAME ||
                          vehicle.PLATE ||
                          'Vehículo interno'}
                      </div>
                      <StatusBlock>
                        {vehicle.OVERDUE_TOTAL > 0 ? (
                          <Tag color="red">
                            {vehicle.OVERDUE_TOTAL} vencido
                            {vehicle.OVERDUE_TOTAL === 1 ? '' : 's'}
                          </Tag>
                        ) : null}
                        <Tag color="gold">
                          {vehicle.PENDING_TOTAL} pendiente
                          {vehicle.PENDING_TOTAL === 1 ? '' : 's'}
                        </Tag>
                      </StatusBlock>
                    </div>
                    <div className="meta">Placa: {vehicle.PLATE || 'N/D'}</div>
                    <div className="meta">
                      Próximo compromiso:{' '}
                      {dateTime(vehicle.NEXT_SCHEDULED_AT) ||
                        'Sin fecha programada'}
                    </div>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty description="No hay mantenimientos pendientes en la flota." />
            )}
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelHeaderTop>
                <h3>Uso acumulado de flota</h3>
                <CustomButton
                  size="small"
                  onClick={() =>
                    navigate(
                      buildActivityPath(
                        '0-8-5',
                        '/configuracion/vehiculos-servicio/usos'
                      )
                    )
                  }
                >
                  Ver usos
                </CustomButton>
              </PanelHeaderTop>
              <p>Tiempo total y kilometraje registrado por vehículo.</p>
            </PanelHeader>

            {data.fleetUsageSummary.length ? (
              <List>
                {data.fleetUsageSummary.map((vehicle) => (
                  <ListItem key={vehicle.SERVICE_VEHICLE_ID}>
                    <div className="line">
                      <div className="title">
                        {vehicle.VEHICLE_NAME ||
                          vehicle.PLATE ||
                          'Vehículo interno'}
                      </div>
                      <Tag color="blue">{vehicle.TOTAL_USAGES} salida(s)</Tag>
                    </div>
                    <div className="meta">Placa: {vehicle.PLATE || 'N/D'}</div>
                    <div className="meta">
                      Horas: {formatMetricNumber(vehicle.TOTAL_HOURS)} · Km:{' '}
                      {formatMetricNumber(vehicle.TOTAL_KILOMETERS)}
                    </div>
                    <div className="meta">
                      Último uso: {dateTime(vehicle.LAST_USAGE_AT) || 'N/D'}
                    </div>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty description="No hay historial de uso acumulado." />
            )}
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelHeaderTop>
                <h3>Disponibilidad actual</h3>
                <CustomButton
                  size="small"
                  onClick={() =>
                    navigate(
                      buildActivityPath(
                        '0-8-3',
                        '/configuracion/vehiculos-servicio'
                      )
                    )
                  }
                >
                  Ver flota
                </CustomButton>
              </PanelHeaderTop>
              <p>Estado operativo inmediato de la flota interna.</p>
            </PanelHeader>

            {data.fleetAvailability.length ? (
              <List>
                {data.fleetAvailability.map((vehicle) => (
                  <ListItem key={vehicle.SERVICE_VEHICLE_ID}>
                    <div className="line">
                      <div className="title">
                        {vehicle.VEHICLE_NAME ||
                          vehicle.PLATE ||
                          'Vehículo interno'}
                      </div>
                      <Tag
                        color={getAvailabilityColor(
                          vehicle.AVAILABILITY_STATUS
                        )}
                      >
                        {getAvailabilityLabel(vehicle.AVAILABILITY_STATUS)}
                      </Tag>
                    </div>
                    <div className="meta">Placa: {vehicle.PLATE || 'N/D'}</div>
                    <div className="meta">
                      {vehicle.BRAND || 'N/D'} {vehicle.MODEL || ''}
                    </div>
                    <div className="meta">
                      Usos activos: {vehicle.CURRENT_USAGE_COUNT} · Mant.
                      abiertos: {vehicle.OPEN_MAINTENANCE_COUNT}
                    </div>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty description="No hay datos de disponibilidad de flota." />
            )}
          </Panel>
        </FleetGrid>
      </Spin>
    </DashboardShell>
  )
}

export default DashboardPage
