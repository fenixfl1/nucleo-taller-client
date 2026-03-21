import React, { useEffect } from 'react'
import { App } from 'antd'
import CustomSider from 'src/components/custom/CustomSider'
import CustomLayout from 'src/components/custom/CustomLayout'
import CustomMenu from 'src/components/custom/CustomMenu'
import CustomContent from 'src/components/custom/CustomContent'
import CustomRow from 'src/components/custom/CustomRow'
import styled from 'styled-components'
import ConditionalComponent from 'src/components/ConditionalComponent'
import ThemeTransitionLayout from 'src/components/ThemeTransition'
import { useAppContext } from 'src/context/AppContext'
import { LogoutOutlined } from '@ant-design/icons'
import { getSessionInfo, removeSession } from 'src/lib/session'
import { useGetUserMenuOptionsQuery } from 'src/services/menu-options/useGetUserMenuOptionsQuery'
import { MenuOption } from 'src/services/menu-options/menu-options.types'
import SVGReader from 'src/components/SVGReader'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useMenuOptionStore } from 'src/store/menu-options.store'
import { findParentKeys } from 'src/utils/find-parent-keys'
import { MenuProps } from 'antd'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDivider from 'src/components/custom/CustomDivider'
import MainHeader from 'src/components/layout/MainHeader'
import {
  buildActivityPath,
  getPathWithoutActivity,
  normalizePath,
} from 'src/utils/activity-path'

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  overflow: hidden;
  img {
    width: 65%;
    max-width: 150px;
    transition:
      width 0.2s ease,
      max-width 0.2s ease;
  }
`

const Content = styled(CustomContent)`
  overflow: auto;
  padding: 24px 50px;
  margin: 15px 0 0 0;
  min-height: 280px;
  width: 100%;
  max-width: 1200px;
  border-radius: ${({ theme }) => theme.borderRadius}px !important;
`

const BodyContainer = styled.div`
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box !important;
`

const Sider = styled(CustomSider)`
  height: 100vh !important;
  box-shadow: ${({ theme }) => theme.boxShadow} !important;
  overflow: hidden;

  .ant-layout-sider-children {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 10px;
    overflow: hidden;
  }

  &.ant-layout-sider-collapsed {
    .ant-layout-sider-children {
      padding: 10px 8px;
    }

    ${LogoContainer} img {
      width: 36px;
      max-width: 36px;
    }
  }
`

const Menu = styled(CustomMenu)`
  &.ant-menu-inline-collapsed > .ant-menu-item,
  &.ant-menu-inline-collapsed > .ant-menu-submenu > .ant-menu-submenu-title {
    padding-inline: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px !important;
    height: 48px !important;
    margin: 0 auto 12px !important;
    border-radius: 16px;
  }

  &.ant-menu-inline-collapsed > .ant-menu-item .ant-menu-title-content,
  &.ant-menu-inline-collapsed
    > .ant-menu-submenu
    > .ant-menu-submenu-title
    .ant-menu-title-content,
  &.ant-menu-inline-collapsed
    > .ant-menu-submenu
    > .ant-menu-submenu-title
    .ant-menu-submenu-arrow {
    display: none !important;
    width: 0 !important;
    opacity: 0 !important;
    overflow: hidden !important;
  }

  &.ant-menu-inline-collapsed > .ant-menu-item .ant-menu-item-icon,
  &.ant-menu-inline-collapsed
    > .ant-menu-submenu
    > .ant-menu-submenu-title
    .ant-menu-item-icon,
  &.ant-menu-inline-collapsed
    > .ant-menu-submenu
    > .ant-menu-submenu-title
    > .ant-menu-item-icon {
    margin-inline-end: 0 !important;
    min-width: 24px;
    font-size: 0;
  }

  .ant-menu-title-content {
    margin-left: 10px !important;
  }
`

const MenuScrollContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  padding-bottom: 12px;
  overscroll-behavior: contain;
`

const LogoutContainer = styled.div`
  margin-top: auto;
  padding: 10px 0 4px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
`

const Layout = styled(CustomLayout)`
  height: 100vh !important;
`

const LogoRow = styled(CustomRow)<{ $collapsed: boolean }>`
  height: 100px;
  padding-inline: ${({ $collapsed }) => ($collapsed ? '0' : '8px')};
`

const findOptionByPath = (
  options: MenuOption[],
  path: string
): MenuOption | undefined => {
  const normalizedPath = normalizePath(path)

  for (const option of options) {
    const optionPath = normalizePath(option.PATH)
    const optionPathWithoutActivity = getPathWithoutActivity(optionPath)

    if (
      optionPath === normalizedPath ||
      optionPathWithoutActivity === normalizedPath
    ) {
      return option
    }

    if (option.CHILDREN?.length) {
      const found = findOptionByPath(option.CHILDREN, normalizedPath)
      if (found) {
        return found
      }
    }
  }

  return undefined
}

const findOptionById = (
  options: MenuOption[],
  menuOptionId?: string
): MenuOption | undefined => {
  if (!menuOptionId) return undefined

  for (const option of options) {
    if (option.MENU_OPTION_ID === menuOptionId) {
      return option
    }

    if (option.CHILDREN?.length) {
      const found = findOptionById(option.CHILDREN, menuOptionId)
      if (found) {
        return found
      }
    }
  }

  return undefined
}

const RootTemplate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { modal } = App.useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const { activityId } = useParams()
  const { isAuthenticated, collapsed } = useAppContext()

  const { refetch } = useGetUserMenuOptionsQuery()

  const {
    setCurrentMenuOption,
    menuOptions,
    setOpenKeys,
    setSelectedKeys,
    openKeys,
    selectedKeys,
    reset,
  } = useMenuOptionStore()

  useEffect(() => {
    if (!menuOptions.length && getSessionInfo().username) refetch()
  }, [menuOptions.length, refetch])

  useEffect(() => {
    if (!menuOptions.length) {
      return
    }

    const pathWithoutActivity = getPathWithoutActivity(location.pathname)
    const currentOption =
      findOptionByPath(menuOptions, pathWithoutActivity) ||
      findOptionById(menuOptions, activityId)

    if (!currentOption?.MENU_OPTION_ID) {
      return
    }

    const keys = findParentKeys(menuOptions, [currentOption.MENU_OPTION_ID])
    const mergedOpenKeys = Array.from(
      new Set(
        [
          ...(keys || []),
          currentOption.PARENT_ID,
          currentOption.MENU_OPTION_ID,
        ].filter(Boolean)
      )
    ) as string[]

    setCurrentMenuOption(currentOption)
    setOpenKeys(mergedOpenKeys)
    setSelectedKeys([currentOption.MENU_OPTION_ID])
  }, [
    location.pathname,
    menuOptions,
    setCurrentMenuOption,
    setOpenKeys,
    setSelectedKeys,
  ])

  const handleClickOption = (option: MenuOption) => {
    if (option?.CHILDREN?.length) return
    if (!option.PATH) return

    setCurrentMenuOption(option)
    navigate(buildActivityPath(option.MENU_OPTION_ID, option.PATH))
  }

  const getSubMenu = (options: MenuOption[] = []): MenuProps['items'] => {
    return options?.map((option: MenuOption) => {
      return {
        key: option?.MENU_OPTION_ID,
        title: option.NAME,
        type: option.TYPE,
        icon: <SVGReader svg={option.ICON} size={collapsed ? 22 : 20} />,
        onClick: option.CHILDREN?.length
          ? undefined
          : () => handleClickOption(option),
        children: option?.CHILDREN?.length
          ? getSubMenu(option.CHILDREN)
          : undefined,
        label: option.NAME,
      }
    }) as never
  }

  const items = getSubMenu(menuOptions)
  const getLevelKeys = (items1: MenuProps['items']) => {
    const key: Record<string, number> = {}
    const func = (items2: MenuProps['items'], level = 1) => {
      items2.forEach((item) => {
        if (item?.key) {
          key[item.key?.toString()] = level
        }
        if (item?.['children']) {
          func(item?.['children'], level + 1)
        }
      })
    }
    func(items1)
    return key
  }

  const levelKeys = getLevelKeys(items)

  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const currentOpenKey = keys.find((key) => openKeys.indexOf(key) === -1)
    if (currentOpenKey !== undefined) {
      const repeatIndex = keys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey])

      setOpenKeys(
        keys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      )
    } else {
      setOpenKeys(keys)
    }
  }

  const handleRemoveSession = () => {
    modal.confirm({
      type: 'warn',
      title: 'Cerrar Sesión',
      content: 'Seguro que desea cerrar la sesión?',
      onOk: () => {
        removeSession()
        reset()
        window.location.reload()
      },
    })
  }

  return (
    <>
      <ConditionalComponent condition={isAuthenticated} fallback={children}>
        <ThemeTransitionLayout>
          <Layout hasSider>
            <Sider
              width={240}
              collapsedWidth={80}
              trigger={null}
              collapsible
              collapsed={collapsed}
            >
              <LogoRow justify={'center'} $collapsed={collapsed}>
                <LogoContainer>
                  <img src={'/assets/logo.svg'} />
                </LogoContainer>
              </LogoRow>
              <CustomDivider />
              <MenuScrollContainer>
                <Menu
                  mode={'inline'}
                  inlineCollapsed={collapsed}
                  openKeys={collapsed ? [] : openKeys}
                  selectedKeys={selectedKeys}
                  items={items}
                  onOpenChange={collapsed ? undefined : handleOpenChange}
                />
              </MenuScrollContainer>

              <LogoutContainer>
                <CustomTooltip placement={'right'} title={'Cerrar Sesión'}>
                  <CustomButton
                    size={'large'}
                    className={'btn-logout'}
                    type={'text'}
                    onClick={handleRemoveSession}
                    icon={<LogoutOutlined />}
                    block={!collapsed}
                    style={collapsed ? { width: 48, minWidth: 48 } : undefined}
                  >
                    {!collapsed && 'Cerrar Sesión'}
                  </CustomButton>
                </CustomTooltip>
              </LogoutContainer>
            </Sider>
            <BodyContainer>
              <CustomLayout>
                <MainHeader />

                <CustomLayout style={{ padding: '0 24px 24px' }}>
                  <CustomRow width={'100%'} justify={'center'}>
                    <Content>{children}</Content>
                  </CustomRow>
                </CustomLayout>
              </CustomLayout>
            </BodyContainer>
          </Layout>
        </ThemeTransitionLayout>
      </ConditionalComponent>
    </>
  )
}

export default RootTemplate
