import React, { useEffect } from 'react'
import styled from 'styled-components'
import CustomHeader from '../custom/CustomHeader'
import CustomRow from '../custom/CustomRow'
import CustomCol from '../custom/CustomCol'
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { CustomText, CustomTitle } from '../custom/CustomParagraph'
import capitalize from 'src/utils/capitalize'
import { getSessionInfo, removeSession } from 'src/lib/session'
import { getAvatarLink } from 'src/utils/get-avatar-link'
import { useSearchParams } from 'react-router-dom'
import CustomAvatar from '../custom/CustomAvatar'
import { useUserStore } from 'src/store/user.store'
import { useMenuOptionStore } from 'src/store/menu-options.store'
import ConditionalComponent from '../ConditionalComponent'
import UserProfile from '../Profile'
import CustomButton from '../custom/CustomButton'
import CustomTooltip from '../custom/CustomTooltip'
import { useCustomModal } from 'src/hooks/use-custom-modal'
import { useAppContext } from 'src/context/AppContext'
import CustomSpace from '../custom/CustomSpace'

const Header = styled(CustomHeader)<{
  collapsed: boolean
}>`
  display: flex;
  align-items: center;
  height: 64px;
  width: auto;
  min-width: 0;
  flex: 1;
  border-radius: 8px !important;
  margin: 21px 24px 0 24px;
  padding: 0 24px !important;
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  height: 100%;
  min-width: 0;
`

const UserName = styled(CustomText)`
  color: ${({ theme }) => theme.colorTextLightSolid || '#ffffff'};
  line-height: 1;
  white-space: nowrap;
`

const HeaderTitle = styled(CustomTitle)`
  margin: 0 !important;
  color: white !important;
  line-height: 1.2 !important;
`

interface MainHeaderProps {
  width?: string | number
  showLogout?: boolean
}

const MainHeader: React.FC<MainHeaderProps> = ({ showLogout = false }) => {
  const { confirmModal } = useCustomModal()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profileVisibilityState, setProfileVisibilitySate } = useUserStore()
  const { currenMenuOption, reset } = useMenuOptionStore()

  const { setCollapsed, collapsed } = useAppContext()

  useEffect(() => {
    if (!profileVisibilityState && searchParams.get('username')) {
      setProfileVisibilitySate(true)
    }
  }, [profileVisibilityState, searchParams])

  const handleLogout = () => {
    confirmModal({
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
      <Header collapsed={collapsed}>
        <CustomRow
          justify={'space-between'}
          width={'100%'}
          height={'100%'}
          align={'middle'}
          wrap={false}
        >
          <ConditionalComponent
            condition={!showLogout}
            fallback={
              <CustomTooltip title={'Cerrar Sesión'} placement={'right'}>
                <CustomButton
                  size={'large'}
                  type={'text'}
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                />
              </CustomTooltip>
            }
          >
            <CustomCol flex={'auto'} style={{ minWidth: 0 }}>
              <CustomSpace
                direction={'horizontal'}
                width={'auto'}
                style={{ alignItems: 'center', minWidth: 0 }}
              >
                <CustomButton
                  type="text"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: '16px',
                    width: 64,
                    height: 64,
                  }}
                />
                <HeaderTitle
                  level={3}
                  ellipsis={{ tooltip: currenMenuOption?.DESCRIPTION || 'Panel' }}
                >
                  {currenMenuOption?.DESCRIPTION}
                </HeaderTitle>
              </CustomSpace>
            </CustomCol>
          </ConditionalComponent>
          <UserInfo>
            <CustomAvatar
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSearchParams({
                  username: getSessionInfo().username,
                })
                setProfileVisibilitySate(true)
              }}
              size={44}
              icon={<UserOutlined />}
              src={getAvatarLink()}
            />
            <UserName strong>
              {capitalize(
                getSessionInfo().name || getSessionInfo().username || ''
              )}
            </UserName>
          </UserInfo>
        </CustomRow>
      </Header>

      <ConditionalComponent condition={profileVisibilityState}>
        <UserProfile />
      </ConditionalComponent>
    </>
  )
}

export default MainHeader
