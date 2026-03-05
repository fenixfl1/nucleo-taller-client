import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { CheckOutlined } from '@ant-design/icons'
import { getSessionInfo } from 'src/lib/session'

type HighlightCard = {
  title: string
  value: number
  subtitle: string
  updatedAt: string
}

type ActivityItem = {
  id: number
  action: string
  target: string
  when: string
}

const highlightCards: HighlightCard[] = [
  {
    title: 'Ordenes',
    value: 4,
    subtitle: 'Esperando revision',
    updatedAt: 'Hace un momento',
  },
  {
    title: 'Ordenes',
    value: 7,
    subtitle: 'Asignadas al equipo',
    updatedAt: 'Hace un momento',
  },
  {
    title: 'Inventario',
    value: 2,
    subtitle: 'Items bajo minimo',
    updatedAt: 'Hace un momento',
  },
  {
    title: 'Clientes',
    value: 3,
    subtitle: 'Vehiculos listos hoy',
    updatedAt: 'Hace un momento',
  },
]

const activityFeed: ActivityItem[] = [
  {
    id: 1,
    action: 'OT cerrada',
    target: '#OT-2026-0012 · Toyota Corolla 2015',
    when: 'Hace 2 horas',
  },
  {
    id: 2,
    action: 'Ingreso de inventario',
    target: 'Radiador aluminio RA-233',
    when: 'Hace 4 horas',
  },
  {
    id: 3,
    action: 'OT en diagnostico',
    target: '#OT-2026-0015 · Hyundai Elantra 2018',
    when: 'Ayer',
  },
  {
    id: 4,
    action: 'Nuevo cliente',
    target: 'Carlos Martinez',
    when: 'Ayer',
  },
]

const quickAccessByTab: Record<string, string[]> = {
  Recientes: [
    'OT-2026-0015 · Elantra 2018',
    'OT-2026-0014 · Civic 2017',
    'Inventario · Radiadores',
  ],
  Modulos: ['Ordenes de trabajo', 'Inventario', 'Clientes'],
}

const hexToRgba = (hex: string | undefined, alpha: number): string => {
  if (!hex?.startsWith('#')) return `rgba(7, 152, 69, ${alpha})`
  const normalized = hex.slice(1)
  const chunk = normalized.length === 3 ? 1 : 2
  const channels = normalized.match(new RegExp(`.{${chunk}}`, 'g')) ?? []
  const [r, g, b] = channels.map((value) =>
    Number.parseInt(chunk === 1 ? `${value}${value}` : value, 16)
  )
  return `rgba(${r || 7}, ${g || 152}, ${b || 69}, ${alpha})`
}

const DashboardShell = styled.main`
  --page-bg: ${({ theme }) =>
    theme.isDark ? theme.colorBgBase : theme.colorBgLayout};
  --panel-bg: ${({ theme }) =>
    theme.isDark ? theme.colorBgContainer : theme.colorBgElevated};
  --panel-bg-alt: ${({ theme }) => theme.colorBgContainer};
  --panel-border: ${({ theme }) => theme.colorBorderSecondary || theme.colorBorder};
  --muted-text: ${({ theme }) => theme.colorTextSecondary};
  --text: ${({ theme }) => theme.colorText};
  --link: ${({ theme }) => theme.colorLink || theme.colorPrimary};
  --accent: ${({ theme }) => theme.colorPrimary};

  background: radial-gradient(
      1200px 450px at -10% -30%,
      ${({ theme }) => hexToRgba(theme.colorPrimary, theme.isDark ? 0.2 : 0.12)},
      transparent 60%
    ),
    var(--page-bg);
  color: var(--text);
  border-radius: ${({ theme }) => `${theme.borderRadiusLG ?? 16}px`};
  min-height: calc(100vh - 190px);
  padding: 24px;
`

const Greeting = styled.section`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
`

const Avatar = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colorPrimary} 0%,
    ${({ theme }) => theme.colorLink || theme.colorPrimaryHover} 100%
  );
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colorTextLightSolid || '#f8fbff'};
`

const GreetingText = styled.div`
  p {
    margin: 0;
    color: var(--muted-text);
    font-size: ${({ theme }) => `${theme.fontSize}px`};
    font-weight: 600;
  }

  h2 {
    margin: 3px 0 0;
    font-size: clamp(1.6rem, 3vw, 2.8rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
`

const Grid = styled.section`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`

const LeftColumn = styled.div`
  display: grid;
  gap: 18px;
`

const RightColumn = styled.aside`
  display: grid;
  align-content: start;
  gap: 18px;
`

const HighlightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(170px, 1fr));
  gap: 12px;

  @media (max-width: 880px) {
    grid-template-columns: repeat(2, minmax(170px, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`

const HighlightCard = styled.article`
  background: linear-gradient(
    165deg,
    ${({ theme }) => theme.colorBgElevated} 0%,
    ${({ theme }) => theme.colorBgContainer} 100%
  );
  border: 1px solid var(--panel-border);
  border-radius: ${({ theme }) => `${theme.borderRadius}px`};
  padding: 14px;

  .title {
    margin: 0;
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: ${({ theme }) => `${theme.fontSize + 2}px`};
  }

  .value {
    margin: 10px 0 0;
    font-size: 2rem;
    line-height: 1;
    font-weight: 700;
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: ${({ theme }) => `${theme.fontSize + 2}px`};
    color: var(--text);
  }

  .meta {
    margin: 3px 0 0;
    color: ${({ theme }) => theme.colorTextTertiary};
    font-size: ${({ theme }) => `${theme.fontSize - 1}px`};
  }
`

const Panel = styled.section`
  background: linear-gradient(
    180deg,
    var(--panel-bg-alt) 0%,
    var(--panel-bg) 100%
  );
  border: 1px solid var(--panel-border);
  border-radius: ${({ theme }) => `${theme.borderRadius}px`};
  padding: 16px;
`

const PanelHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  h3 {
    margin: 0;
    font-size: ${({ theme }) => `${theme.fontSizeLG ?? 18}px`};
  }
`

const HeaderButton = styled.button`
  border: 1px solid var(--panel-border);
  background: ${({ theme }) => theme.colorFillSecondary};
  color: var(--text);
  border-radius: ${({ theme }) => `${theme.borderRadius}px`};
  font-size: ${({ theme }) => `${theme.fontSize - 1}px`};
  font-weight: 600;
  padding: 7px 12px;
  cursor: pointer;
`

const AttentionMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 96px;

  .icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.colorPrimaryBg};
    color: ${({ theme }) => theme.colorPrimary};
    border: 1px solid ${({ theme }) => theme.colorPrimaryBorder};
    font-size: 1.4rem;
  }

  p {
    margin: 0;
    font-size: ${({ theme }) => `${theme.fontSizeLG}px`};
  }
`

const LinkButton = styled.button`
  margin-top: 10px;
  border: none;
  background: transparent;
  color: var(--link);
  font-size: ${({ theme }) => `${theme.fontSize + 2}px`};
  cursor: pointer;
  padding: 0;
`

const Timeline = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 9px;
    top: 10px;
    bottom: 8px;
    width: 1px;
    background: var(--panel-border);
  }
`

const TimelineItem = styled.li`
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 16px 28px;

  &:last-child {
    padding-bottom: 0;
  }

  .dot {
    position: absolute;
    left: 0;
    top: 7px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colorBgElevated};
    border: 1px solid var(--panel-border);
  }

  .text {
    margin: 0;
    color: var(--text);
    font-size: ${({ theme }) => `${theme.fontSize + 2}px`};
    line-height: 1.35;
  }

  .text .target {
    color: var(--link);
  }

  .when {
    margin: 0;
    color: var(--muted-text);
    white-space: nowrap;
    font-size: ${({ theme }) => `${theme.fontSize}px`};
  }
`

const QuickTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  background: ${({ theme }) => theme.colorFillSecondary};
  border-radius: ${({ theme }) => `${theme.borderRadiusSM}px`};
  overflow: hidden;
  margin-bottom: 10px;
`

const TabButton = styled.button<{ $active?: boolean }>`
  border: 0;
  padding: 7px 10px;
  font-size: ${({ theme }) => `${theme.fontSize}px`};
  cursor: pointer;
  color: ${({ theme, $active }) =>
    $active ? theme.colorText : theme.colorTextSecondary};
  background: ${({ theme, $active }) =>
    $active ? theme.colorBgElevated : 'transparent'};
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
`

const QuickList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    color: var(--text);
    font-size: ${({ theme }) => `${theme.fontSize + 1}px`};
    padding: 7px 0;
    border-bottom: 1px solid var(--panel-border);
  }

  li:last-child {
    border-bottom: none;
  }
`

const FeedbackText = styled.p`
  margin: 0;
  color: var(--muted-text);
  line-height: 1.4;
`

const FeedbackAction = styled.button`
  border: none;
  background: transparent;
  color: var(--link);
  font-size: ${({ theme }) => `${theme.fontSize + 2}px`};
  margin-top: 10px;
  cursor: pointer;
  padding: 0;
`

const Dashboard: React.FC = () => {
  const [quickTab, setQuickTab] = useState<'Recientes' | 'Modulos'>('Recientes')
  const [activityFilter, setActivityFilter] = useState<
    'Todo' | 'Ordenes' | 'Inventario'
  >('Todo')

  const session = getSessionInfo()
  const username = session?.username || 'Usuario'
  const firstName = username.split(/[._\s-]/)[0] || username
  const initials = firstName.slice(0, 2).toUpperCase()

  const visibleActivity = useMemo(() => {
    if (activityFilter === 'Todo') return activityFeed
    return activityFeed.filter((item) =>
      activityFilter === 'Ordenes'
        ? item.action.toLowerCase().includes('ot')
        : item.action.toLowerCase().includes('inventario')
    )
  }, [activityFilter])

  return (
    <DashboardShell>
      <Greeting>
        <Avatar>{initials}</Avatar>
        <GreetingText>
          <p>Resumen de hoy</p>
          <h2>Hola, {firstName}</h2>
        </GreetingText>
      </Greeting>

      <Grid>
        <LeftColumn>
          <HighlightsGrid>
            {highlightCards.map((card) => (
              <HighlightCard key={`${card.title}-${card.subtitle}`}>
                <p className="title">{card.title}</p>
                <p className="value">{card.value}</p>
                <p className="subtitle">{card.subtitle}</p>
                <p className="meta">{card.updatedAt}</p>
              </HighlightCard>
            ))}
          </HighlightsGrid>

          <Panel>
            <PanelHeader>
              <h3>Items que necesitan tu atencion</h3>
              <HeaderButton type="button">Todo</HeaderButton>
            </PanelHeader>

            <AttentionMessage>
              <div className="icon">
                <CheckOutlined />
              </div>
              <p>Buen trabajo. No tienes tareas pendientes por ahora.</p>
            </AttentionMessage>

            <LinkButton type="button">Ver pendientes</LinkButton>
          </Panel>

          <Panel>
            <PanelHeader>
              <h3>Sigue las ultimas actualizaciones</h3>
              <HeaderButton
                type="button"
                onClick={() =>
                  setActivityFilter((current) =>
                    current === 'Todo'
                      ? 'Ordenes'
                      : current === 'Ordenes'
                        ? 'Inventario'
                        : 'Todo'
                  )
                }
              >
                {activityFilter}
              </HeaderButton>
            </PanelHeader>

            <Timeline>
              {visibleActivity.map((item) => (
                <TimelineItem key={item.id}>
                  <span className="dot" />
                  <p className="text">
                    {item.action} <span className="target">{item.target}</span>
                  </p>
                  <p className="when">{item.when}</p>
                </TimelineItem>
              ))}
            </Timeline>

            <LinkButton type="button">Toda la actividad</LinkButton>
          </Panel>
        </LeftColumn>

        <RightColumn>
          <Panel>
            <PanelHeader>
              <h3>Acceso rapido</h3>
            </PanelHeader>

            <QuickTabs>
              {(['Recientes', 'Modulos'] as const).map((tab) => (
                <TabButton
                  key={tab}
                  $active={quickTab === tab}
                  type="button"
                  onClick={() => setQuickTab(tab)}
                >
                  {tab}
                </TabButton>
              ))}
            </QuickTabs>

            <QuickList>
              {quickAccessByTab[quickTab].map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </QuickList>
          </Panel>

          <Panel>
            <PanelHeader>
              <h3>Comparte tu feedback</h3>
            </PanelHeader>
            <FeedbackText>
              Ayudanos a mejorar este inicio. Luego podras conectar estos bloques
              a datos reales del taller.
            </FeedbackText>
            <FeedbackAction type="button">Enviar comentario</FeedbackAction>
          </Panel>
        </RightColumn>
      </Grid>
    </DashboardShell>
  )
}

export default Dashboard
