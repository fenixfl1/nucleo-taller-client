import { useForm } from 'antd/es/form/Form'
import { useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

import CustomButton from 'src/components/custom/CustomButton'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomInput from 'src/components/custom/CustomInput'
import CustomPasswordInput from 'src/components/custom/CustomPasswordInput'
import { useAuthenticateUserMutation } from 'src/services/auth/useAuthenticateUserMutation'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useMenuOptionStore } from 'src/store/menu-options.store'

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

const Layout = styled.main`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: ${({ theme }) =>
    theme.isDark
      ? `linear-gradient(120deg, ${theme.colorBgBase} 0%, ${theme.colorBgLayout} 100%)`
      : `linear-gradient(135deg, ${theme.colorBgLayout} 0%, ${theme.colorBgContainer} 60%, ${theme.colorBgElevated} 100%)`};
`

const LoginCard = styled.section`
  width: min(1100px, 100%);
  min-height: 640px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border-radius: ${({ theme }) => `${theme.borderRadiusLG ?? 16}px`};
  box-shadow: ${({ theme }) => theme.boxShadow};

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`

const BrandPanel = styled.section`
  background:
    radial-gradient(
      circle at 15% 20%,
      ${({ theme }) => hexToRgba(theme.colorBgElevated, 0.18)},
      transparent 38%
    ),
    linear-gradient(
      145deg,
      ${({ theme }) => theme.colorPrimary} 0%,
      ${({ theme }) => theme.colorPrimaryHover} 52%,
      ${({ theme }) => theme.colorPrimary} 100%
    );
  color: ${({ theme }) => theme.colorTextLightSolid || '#f4fff8'};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(30px, 5vw, 64px);

  @media (max-width: 992px) {
    order: 2;
    min-height: 220px;
  }
`

const BrandContent = styled.div`
  width: min(420px, 100%);
`

const BrandTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.1rem, 3.8vw, 3.6rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.03em;
`

const BrandText = styled.p`
  margin: 18px 0 0;
  font-size: clamp(1rem, 1.2vw, 1.32rem);
  line-height: 1.5;
  color: ${({ theme }) => hexToRgba(theme.colorTextLightSolid || '#ffffff', 0.88)};
`

const FormPanel = styled.section`
  background: ${({ theme }) => theme.colorBgContainer};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(30px, 5vw, 64px);

  @media (max-width: 992px) {
    order: 1;
  }
`

const FormContent = styled.div`
  width: min(420px, 100%);
`

const Logo = styled.img`
  width: 64px;
  height: 64px;
  display: block;
  object-fit: contain;
  margin: 0 auto 10px;
`

const Title = styled.h2`
  margin: 0 0 28px;
  text-align: center;
  color: ${({ theme }) => theme.colorPrimary};
  font-size: clamp(1.9rem, 3vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.02em;
`

const InputField = styled(CustomInput)`
  height: ${({ theme }) => `${theme.controlHeightLG ?? 54}px`};
  border: none !important;
  border-radius: ${({ theme }) => `${theme.borderRadius ?? 8}px`} !important;
  background: ${({ theme }) => theme.colorFillSecondary} !important;
  color: ${({ theme }) => theme.colorText} !important;
  font-size: ${({ theme }) => `${(theme.fontSizeLG ?? 18) + 4}px`} !important;

  &::placeholder {
    color: ${({ theme }) => theme.colorTextTertiary};
  }
`

const PasswordField = styled(CustomPasswordInput)`
  .ant-input-affix-wrapper {
    height: ${({ theme }) => `${theme.controlHeightLG ?? 54}px`};
    border: none !important;
    border-radius: ${({ theme }) => `${theme.borderRadius ?? 8}px`} !important;
    background: ${({ theme }) => theme.colorFillSecondary} !important;
  }

  .ant-input {
    background: transparent !important;
    color: ${({ theme }) => theme.colorText} !important;
    font-size: ${({ theme }) => `${(theme.fontSizeLG ?? 18) + 4}px`} !important;
  }

  .ant-input::placeholder {
    color: ${({ theme }) => theme.colorTextTertiary};
  }

  .ant-input-password-icon {
    color: ${({ theme }) => theme.colorTextTertiary};
  }
`

const ForgotButton = styled(CustomButton)`
  color: ${({ theme }) => theme.colorTextSecondary} !important;
  font-weight: 500;
  padding: 0 !important;
`

const SubmitButton = styled(CustomButton)`
  height: ${({ theme }) => `${theme.controlHeightLG ?? 54}px`};
  width: 100%;
  margin-top: 10px;
  border-radius: 999px !important;
  border: none !important;
  font-size: ${({ theme }) => `${(theme.fontSizeLG ?? 18) + 2}px`} !important;
  font-weight: 700 !important;
`

type LoginForm = {
  username: string
  password: string
}

const Login = () => {
  const navigate = useNavigate()
  const [errorHandler] = useErrorHandler()
  const [form] = useForm<LoginForm>()
  const { reset } = useMenuOptionStore()
  const { mutateAsync: authenticateUser, isPending } =
    useAuthenticateUserMutation()

  useEffect(() => {
    reset()
  }, [reset])

  const handleFinish = async (values: LoginForm) => {
    try {
      await authenticateUser(values)
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <Layout>
      <LoginCard>
        <BrandPanel>
          <BrandContent>
            <BrandTitle>Bienvenido(a)</BrandTitle>
            <BrandText>
              Accede al sistema operativo del taller y gestiona tus ordenes,
              personal e inventario desde un solo lugar.
            </BrandText>
          </BrandContent>
        </BrandPanel>

        <FormPanel>
          <FormContent>
            <Logo src={'/assets/logo.png'} alt="Logo NucleoTaller" />
            <Title>Portal de Taller</Title>

            <CustomForm autoComplete={'off'} form={form} onFinish={handleFinish}>
              <CustomFormItem
                name="username"
                rules={[{ required: true, message: 'Usuario es requerido.' }]}
              >
                <InputField placeholder="Nombre de usuario" />
              </CustomFormItem>

              <CustomFormItem
                name="password"
                rules={[
                  { required: true, message: 'Contrasena es requerida.' },
                ]}
              >
                <PasswordField placeholder="Contrasena" />
              </CustomFormItem>

              <div style={{ textAlign: 'center', margin: '8px 0 22px' }}>
                <ForgotButton
                  type={'link'}
                  onClick={() => navigate('/reset_password')}
                >
                  Olvido su contrasena?
                </ForgotButton>
              </div>

              <CustomFormItem style={{ marginBottom: 0 }}>
                <SubmitButton
                  loading={isPending}
                  htmlType="submit"
                  type="primary"
                >
                  INICIAR SESION
                </SubmitButton>
              </CustomFormItem>
            </CustomForm>
          </FormContent>
        </FormPanel>
      </LoginCard>
    </Layout>
  )
}

export default Login
