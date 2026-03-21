import React, { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Form, FormInstance, Modal } from 'antd'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomRow from 'src/components/custom/CustomRow'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomInput from 'src/components/custom/CustomInput'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
import CustomModal from 'src/components/custom/CustomModal'
import { useGetRolePaginationMutation } from 'src/services/roles/useGetRolePaginationMutation'
import { Role } from 'src/services/roles/role.type'
import { useRoleStore } from 'src/store/role.store'
import { useCreateUserMutation } from 'src/services/users/useCreateUserMutation'
import CustomSpin from 'src/components/custom/CustomSpin'
import { useAppNotification } from 'src/context/NotificationContext'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { User } from 'src/services/users/users.types'
import { useUpdateUserMutation } from 'src/services/users/useUpdateUserMutation'
import { AdvancedCondition } from 'src/types/general'
import useDebounce from 'src/hooks/use-debounce'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomMaskedInput from 'src/components/custom/CustomMaskedInput'
import CustomRadioGroup from 'src/components/custom/CustomRadioGroup'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import { normalizeIdentityDocument } from 'src/utils/identity-document'
import CustomCollapseFormList from 'src/components/custom/CustomCollapseFormList'
import CustomCheckbox from 'src/components/custom/CustomCheckbox'
import { FormListFieldData } from 'antd/es/form'

type ContactType = 'email' | 'phone' | 'whatsapp' | 'other'
type ContactUsage = 'personal' | 'emergency'

type ContactFormValue = {
  TYPE: ContactType
  VALUE: string
  USAGE: ContactUsage
  IS_PRIMARY?: boolean
}

const contactTypeOptions = [
  { label: 'Correo', value: 'email' },
  { label: 'Teléfono', value: 'phone' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Otro', value: 'other' },
]

const contactUsageOptions = [
  { label: 'Personal', value: 'personal' },
  { label: 'Emergencia', value: 'emergency' },
]

const normalizeContactPayload = (
  contacts: ContactFormValue[] = []
): ContactFormValue[] => {
  const cleaned = contacts
    .map((item) => ({
      TYPE: item.TYPE,
      USAGE: item.USAGE || 'personal',
      VALUE: `${item.VALUE || ''}`.trim(),
      IS_PRIMARY: Boolean(item.IS_PRIMARY),
    }))
    .filter((item) => item.TYPE && item.VALUE)

  const hasPrimaryByType = new Map<ContactType, boolean>()
  cleaned.forEach((item) => {
    if (item.IS_PRIMARY) {
      hasPrimaryByType.set(item.TYPE, true)
    }
  })

  const autoPrimaryByType = new Set<ContactType>()
  return cleaned.map((item) => {
    if (item.IS_PRIMARY || hasPrimaryByType.get(item.TYPE)) {
      return item
    }

    if (!autoPrimaryByType.has(item.TYPE)) {
      autoPrimaryByType.add(item.TYPE)
      return { ...item, IS_PRIMARY: true }
    }

    return item
  })
}

const getInitialContacts = (user?: User): ContactFormValue[] => {
  if (!user) return []

  if (user.CONTACTS?.length) {
    return user.CONTACTS.map((item) => ({
      TYPE: item.TYPE,
      VALUE: item.VALUE,
      USAGE: item.USAGE || 'personal',
      IS_PRIMARY: Boolean(item.IS_PRIMARY),
    }))
  }

  return [
    ...(user.EMAIL
      ? [
          {
            TYPE: 'email' as const,
            VALUE: user.EMAIL,
            USAGE: 'personal' as const,
            IS_PRIMARY: true,
          },
        ]
      : []),
    ...(user.PHONE
      ? [
          {
            TYPE: 'phone' as const,
            VALUE: user.PHONE,
            USAGE: 'personal' as const,
            IS_PRIMARY: true,
          },
        ]
      : []),
  ]
}

const ContactCollapseItem: React.FC<{
  field: FormListFieldData
  form: FormInstance<UserFormValues>
}> = ({ field, form }) => {
  const contactType = Form.useWatch(['CONTACTS', field.name, 'TYPE'], form) as
    | ContactType
    | undefined
  const isPhoneType = contactType === 'phone' || contactType === 'whatsapp'

  return (
    <CustomRow gutter={[16, 16]} justify={'start'} width={'100%'}>
      <CustomCol xs={24} md={12} lg={8}>
        <CustomFormItem
          label={'Tipo'}
          name={[field.name, 'TYPE']}
          rules={[{ required: true, message: 'Seleccione el tipo.' }]}
        >
          <CustomSelect
            placeholder={'Seleccionar tipo'}
            options={contactTypeOptions}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24} md={12} lg={8}>
        <CustomFormItem
          label={'Valor'}
          name={[field.name, 'VALUE']}
          rules={[
            { required: true, message: 'Digite el contacto.' },
            {
              validator: (_, value: string) => {
                const rawValue = `${value || ''}`.trim()

                if (!rawValue) {
                  return Promise.reject(new Error('Digite el contacto.'))
                }

                if (contactType === 'email') {
                  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    rawValue
                  )
                  if (!isEmailValid) {
                    return Promise.reject(
                      new Error('Debe digitar un correo válido.')
                    )
                  }
                }

                if (contactType === 'phone' || contactType === 'whatsapp') {
                  const digits = rawValue.replace(/\D/g, '')
                  if (digits.length < 10) {
                    return Promise.reject(
                      new Error('Debe digitar un teléfono válido.')
                    )
                  }
                }

                return Promise.resolve()
              },
            },
          ]}
        >
          {isPhoneType ? (
            <CustomMaskedInput placeholder={'(809) 000 0000'} type={'phone'} />
          ) : (
            <CustomInput
              placeholder={
                contactType === 'email'
                  ? 'correo@dominio.com'
                  : 'Digite información de contacto'
              }
            />
          )}
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24} md={12} lg={5}>
        <CustomFormItem
          label={'Uso'}
          name={[field.name, 'USAGE']}
          rules={[{ required: true, message: 'Seleccione el uso.' }]}
        >
          <CustomSelect
            placeholder={'Seleccionar uso'}
            options={contactUsageOptions}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24} md={12} lg={3}>
        <CustomFormItem
          label={'Principal'}
          name={[field.name, 'IS_PRIMARY']}
          valuePropName={'checked'}
        >
          <CustomCheckbox />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )
}

interface UserFormProps {
  open?: boolean
  onClose?: () => void
  user?: User
}

type UserFormValues = {
  NAME: string
  LAST_NAME: string
  IDENTITY_DOCUMENT: string
  BIRTH_DATE?: dayjs.Dayjs
  GENDER: 'M' | 'F' | 'O'
  ADDRESS?: string
  CONTACTS?: ContactFormValue[]
  USERNAME: string
  ROLE_ID: number
  EMPLOYEE_TYPE: 'OPERACIONAL' | 'ADMINISTRATIVO'
}

const UserForm: React.FC<UserFormProps> = ({ open, onClose, user }) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<UserFormValues>()
  const [searchRoleKey, setSearchRoleKey] = useState('')
  const debounceRole = useDebounce(searchRoleKey)

  const { roleList } = useRoleStore()

  const { mutateAsync: createUser, isPending: isCreateUserPending } =
    useCreateUserMutation()
  const { mutate: getRoles, isPending: isGetRolesPending } =
    useGetRolePaginationMutation()
  const { mutateAsync: updateUser, isPending: isUpdatePending } =
    useUpdateUserMutation()

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        NAME: user.NAME,
        LAST_NAME: user.LAST_NAME,
        IDENTITY_DOCUMENT: user.IDENTITY_DOCUMENT,
        BIRTH_DATE: user.BIRTH_DATE ? dayjs(user.BIRTH_DATE) : undefined,
        GENDER: (user.GENDER || 'M') as 'M' | 'F' | 'O',
        ADDRESS: user.ADDRESS,
        CONTACTS: getInitialContacts(user),
        USERNAME: user.USERNAME,
        ROLE_ID: Number(user.ROLE_ID),
        EMPLOYEE_TYPE: user.EMPLOYEE_TYPE || 'OPERACIONAL',
      })
      return
    }

    form.resetFields()
    form.setFieldsValue({ EMPLOYEE_TYPE: 'OPERACIONAL' })
  }, [form, user, open])

  const handleSearchRole = useCallback(() => {
    const condition: AdvancedCondition<Role>[] = [
      {
        value: 'A',
        operator: '=',
        field: 'STATE',
      },
    ]

    if (debounceRole) {
      condition.push({
        value: debounceRole,
        operator: 'LIKE',
        field: 'NAME',
      })
    }

    getRoles({ page: 1, size: 30, condition })
  }, [debounceRole, getRoles])

  useEffect(handleSearchRole, [handleSearchRole])

  const handleCancel = () => {
    form.resetFields()
    onClose?.()
  }

  const handleFinish = async () => {
    try {
      const data = await form.validateFields()
      const { CONTACTS = [], ...rest } = data
      const identityDocument = normalizeIdentityDocument(data.IDENTITY_DOCUMENT)
      const contacts = normalizeContactPayload(CONTACTS)

      const payload = {
        ...rest,
        IDENTITY_DOCUMENT: identityDocument,
        BIRTH_DATE: data.BIRTH_DATE ? data.BIRTH_DATE.toISOString() : null,
        CONTACTS: contacts,
      }

      let description =
        'Empleado creado exitosamente junto con los datos de la persona.'

      if (user) {
        await updateUser({
          ...payload,
          USER_ID: user.USER_ID,
        })
        description = 'Empleado actualizado exitosamente.'
      } else {
        await createUser(payload)
      }

      notification({
        message: 'Operación exitosa',
        description,
      })
      form.resetFields()
      handleCancel()
    } catch (error) {
      errorHandler(error)
    }
  }

  const handleClose = () => {
    modal.confirm({
      onOk: handleCancel,
      title: 'Confirmación',
      content:
        'Si cierra la ventana perderá cualquier información que haya introducido.',
    })
  }

  return (
    <>
      <CustomModal
        width={'60%'}
        closable
        title={'Formulario de empleado'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 25 }} />
        <CustomDivider>
          <CustomTitle level={5}>Datos Personales</CustomTitle>
        </CustomDivider>
        <CustomSpin spinning={isCreateUserPending || isUpdatePending}>
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Nombre'}
                  name={'NAME'}
                  rules={[{ required: true }]}
                >
                  <CustomInput placeholder={'Nombre'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Apellido'}
                  name={'LAST_NAME'}
                  rules={[{ required: true }]}
                >
                  <CustomInput placeholder={'Apellido'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Cédula'}
                  name={'IDENTITY_DOCUMENT'}
                  rules={[
                    { required: true },
                    {
                      validator: (_, value: string) => {
                        const normalized = normalizeIdentityDocument(value)
                        if (normalized.length === 11) return Promise.resolve()
                        return Promise.reject(
                          new Error('Debe tener 11 dígitos.')
                        )
                      },
                    },
                  ]}
                >
                  <CustomMaskedInput
                    placeholder={'Doc. Identidad'}
                    type={'cedula'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Nacimiento'} name={'BIRTH_DATE'}>
                  <CustomDatePicker format={'YYYY-MM-DD'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Género'}
                  name={'GENDER'}
                  rules={[{ required: true }]}
                >
                  <CustomRadioGroup
                    options={[
                      { label: 'Masculino', value: 'M' },
                      { label: 'Femenino', value: 'F' },
                      { label: 'Otro', value: 'O' },
                    ]}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Dirección'}
                  name={'ADDRESS'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Dirección'} />
                </CustomFormItem>
              </CustomCol>

              <CustomDivider>
                <CustomTitle level={5}>Contacto</CustomTitle>
              </CustomDivider>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={' '}
                  colon={false}
                  {...labelColFullWidth}
                >
                  <CustomCollapseFormList
                    name={'CONTACTS'}
                    form={form}
                    addText={'Agregar contacto'}
                    addButtonPosition={'bottom'}
                    itemLabel={(index) => `Contacto ${index + 1}`}
                    onAdd={(add) =>
                      add({
                        TYPE: 'email',
                        USAGE: 'personal',
                        VALUE: '',
                        IS_PRIMARY: false,
                      })
                    }
                  >
                    {(field) => (
                      <ContactCollapseItem field={field} form={form} />
                    )}
                  </CustomCollapseFormList>
                </CustomFormItem>
              </CustomCol>

              <CustomDivider>
                <CustomTitle level={5}>Acceso</CustomTitle>
              </CustomDivider>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Usuario'}
                  name={'USERNAME'}
                  noSpaces
                  rules={[{ required: true }]}
                >
                  <CustomInput placeholder={'Nombre de usuario'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Tipo de empleado'}
                  name={'EMPLOYEE_TYPE'}
                  rules={[{ required: true }]}
                >
                  <CustomSelect
                    placeholder={'Seleccionar tipo'}
                    options={[
                      { label: 'Operacional', value: 'OPERACIONAL' },
                      { label: 'Administrativo', value: 'ADMINISTRATIVO' },
                    ]}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Rol de acceso'}
                  name={'ROLE_ID'}
                  noSpaces
                  rules={[{ required: true }]}
                >
                  <CustomSelect
                    onSearch={setSearchRoleKey}
                    loading={isGetRolesPending}
                    placeholder={'Seleccionar Rol'}
                    options={roleList.map((item) => ({
                      label: item.NAME,
                      value: item.ROLE_ID,
                    }))}
                  />
                </CustomFormItem>
              </CustomCol>
            </CustomRow>
          </CustomForm>
        </CustomSpin>
      </CustomModal>
      {contextHolder}
    </>
  )
}

export default UserForm
