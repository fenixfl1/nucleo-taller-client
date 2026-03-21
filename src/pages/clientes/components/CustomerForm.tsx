import React, { useEffect } from 'react'
import dayjs from 'dayjs'
import { Form, FormInstance, Modal } from 'antd'
import { FormListFieldData } from 'antd/es/form'
import CustomCheckbox from 'src/components/custom/CustomCheckbox'
import CustomCol from 'src/components/custom/CustomCol'
import CustomCollapseFormList from 'src/components/custom/CustomCollapseFormList'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomMaskedInput from 'src/components/custom/CustomMaskedInput'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomRadioGroup from 'src/components/custom/CustomRadioGroup'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import { useAppNotification } from 'src/context/NotificationContext'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useCreateCustomerMutation } from 'src/services/customers/useCreateCustomerMutation'
import { useUpdateCustomerMutation } from 'src/services/customers/useUpdateCustomerMutation'
import { Customer } from 'src/services/customers/customer.types'
import { normalizeIdentityDocument } from 'src/utils/identity-document'

type ContactType = 'email' | 'phone' | 'whatsapp' | 'other'
type ContactUsage = 'personal' | 'emergency'

type ContactFormValue = {
  TYPE: ContactType
  VALUE: string
  USAGE: ContactUsage
  IS_PRIMARY?: boolean
}

type CustomerFormValues = {
  NAME: string
  LAST_NAME?: string
  IDENTITY_DOCUMENT: string
  BIRTH_DATE?: dayjs.Dayjs
  GENDER?: 'M' | 'F' | 'O'
  ADDRESS?: string
  CONTACTS?: ContactFormValue[]
}

interface CustomerFormProps {
  open?: boolean
  customer?: Customer
  onClose?: () => void
  onSuccess?: () => void
  onSaved?: (customer: Customer) => void
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

const getInitialContacts = (customer?: Customer): ContactFormValue[] => {
  if (!customer) return []

  if (customer.CONTACTS?.length) {
    return customer.CONTACTS.map((item) => ({
      TYPE: item.TYPE,
      VALUE: item.VALUE,
      USAGE: item.USAGE || 'personal',
      IS_PRIMARY: Boolean(item.IS_PRIMARY),
    }))
  }

  return [
    ...(customer.EMAIL
      ? [
          {
            TYPE: 'email' as const,
            VALUE: customer.EMAIL,
            USAGE: 'personal' as const,
            IS_PRIMARY: true,
          },
        ]
      : []),
    ...(customer.PHONE
      ? [
          {
            TYPE: 'phone' as const,
            VALUE: customer.PHONE,
            USAGE: 'personal' as const,
            IS_PRIMARY: true,
          },
        ]
      : []),
  ]
}

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

const ContactCollapseItem: React.FC<{
  field: FormListFieldData
  form: FormInstance<CustomerFormValues>
}> = ({ field, form }) => {
  const contactType = Form.useWatch(
    ['CONTACTS', field.name, 'TYPE'],
    form
  ) as ContactType | undefined
  const isPhoneType = contactType === 'phone' || contactType === 'whatsapp'

  return (
    <CustomRow justify={'start'} width={'100%'}>
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
                  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawValue)
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

const CustomerForm: React.FC<CustomerFormProps> = ({
  open,
  customer,
  onClose,
  onSuccess,
  onSaved,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<CustomerFormValues>()

  const { mutateAsync: createCustomer, isPending: isCreatePending } =
    useCreateCustomerMutation()
  const { mutateAsync: updateCustomer, isPending: isUpdatePending } =
    useUpdateCustomerMutation()

  useEffect(() => {
    if (customer) {
      form.setFieldsValue({
        NAME: customer.NAME,
        LAST_NAME: customer.LAST_NAME,
        IDENTITY_DOCUMENT: customer.IDENTITY_DOCUMENT,
        BIRTH_DATE: customer.BIRTH_DATE ? dayjs(customer.BIRTH_DATE) : undefined,
        GENDER: (customer.GENDER || 'M') as 'M' | 'F' | 'O',
        ADDRESS: customer.ADDRESS,
        CONTACTS: getInitialContacts(customer),
      })
      return
    }

    form.resetFields()
  }, [form, customer, open])

  const handleCancel = () => {
    form.resetFields()
    onClose?.()
  }

  const handleClose = () => {
    modal.confirm({
      onOk: handleCancel,
      title: 'Confirmación',
      content:
        'Si cierra la ventana perderá cualquier información que haya introducido.',
    })
  }

  const handleFinish = async () => {
    try {
      const values = await form.validateFields()
      const normalizedIdentity = normalizeIdentityDocument(
        values.IDENTITY_DOCUMENT
      )
      const contacts = normalizeContactPayload(values.CONTACTS || [])

      const payload = {
        ...values,
        IDENTITY_DOCUMENT: normalizedIdentity,
        BIRTH_DATE: values.BIRTH_DATE ? values.BIRTH_DATE.toISOString() : null,
        CONTACTS: contacts,
      }

      let description = 'Cliente registrado exitosamente.'
      let savedCustomer: Customer

      if (customer?.PERSON_ID) {
        savedCustomer = await updateCustomer({
          ...payload,
          CUSTOMER_ID: customer.PERSON_ID,
        })
        description = 'Cliente actualizado exitosamente.'
      } else {
        savedCustomer = await createCustomer(payload)
      }

      notification({
        message: 'Operación exitosa',
        description,
      })
      onSaved?.(savedCustomer)
      onSuccess?.()
      handleCancel()
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <>
      <CustomModal
        width={'65%'}
        closable
        title={'Formulario de cliente'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin spinning={isCreatePending || isUpdatePending}>
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomDivider>
                <CustomTitle level={5}>Datos Personales</CustomTitle>
              </CustomDivider>

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
                <CustomFormItem label={'Apellido'} name={'LAST_NAME'}>
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
                        return Promise.reject(new Error('Debe tener 11 dígitos.'))
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
                <CustomFormItem label={'Género'} name={'GENDER'}>
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
                <CustomTitle level={5}>Contactos</CustomTitle>
              </CustomDivider>

              <CustomCol xs={24}>
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
                  {(field) => <ContactCollapseItem field={field} form={form} />}
                </CustomCollapseFormList>
              </CustomCol>
            </CustomRow>
          </CustomForm>
        </CustomSpin>
      </CustomModal>
      {contextHolder}
    </>
  )
}

export default CustomerForm
