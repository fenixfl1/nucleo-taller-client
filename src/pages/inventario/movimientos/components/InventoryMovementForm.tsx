import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Form, FormInstance, Modal } from 'antd'
import { FormListFieldData } from 'antd/es/form'
import CustomCol from 'src/components/custom/CustomCol'
import CustomCollapseFormList from 'src/components/custom/CustomCollapseFormList'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import { useAppNotification } from 'src/context/NotificationContext'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import useDebounce from 'src/hooks/use-debounce'
import { useGetArticlePaginationMutation } from 'src/services/articles/useGetArticlePaginationMutation'
import {
  InventoryMovementPayload,
  InventoryMovementType,
} from 'src/services/inventory-movements/inventory-movement.types'
import { useCreateInventoryMovementMutation } from 'src/services/inventory-movements/useCreateInventoryMovementMutation'
import { useGetInventoryMovementTypeListQuery } from 'src/services/inventory-movements/useGetInventoryMovementTypeListQuery'
import { Article } from 'src/services/articles/article.types'
import { useArticleStore } from 'src/store/article.store'
import { AdvancedCondition } from 'src/types/general'

type MovementDetailFormValue = {
  ARTICLE_ID: number
  QUANTITY: number
  UNIT_COST_REFERENCE?: number | null
  NOTES?: string
}

type InventoryMovementFormValues = {
  MOVEMENT_TYPE: InventoryMovementPayload['MOVEMENT_TYPE']
  MOVEMENT_DATE?: dayjs.Dayjs
  NOTES?: string
  DETAILS: MovementDetailFormValue[]
}

interface InventoryMovementFormProps {
  open?: boolean
  onClose?: () => void
  onSuccess?: () => void
  initialValues?: Partial<InventoryMovementFormValues>
  title?: string
}

const movementTypeLabels: Record<string, string> = {
  ENTRY: 'Entrada manual',
  EXIT: 'Salida manual',
  ADJUSTMENT_IN: 'Ajuste positivo',
  ADJUSTMENT_OUT: 'Ajuste negativo',
}

const MovementDetailCollapseItem: React.FC<{
  field: FormListFieldData
  form: FormInstance<InventoryMovementFormValues>
  articleOptions: Array<{ label: string; value: number }>
  onSearchArticle?: (value: string) => void
  loading?: boolean
}> = ({ field, form, articleOptions, onSearchArticle, loading }) => {
  const detailList = Form.useWatch('DETAILS', form) as
    | MovementDetailFormValue[]
    | undefined

  return (
    <CustomRow justify={'start'} width={'100%'}>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Artículo'}
          name={[field.name, 'ARTICLE_ID']}
          {...labelColFullWidth}
          rules={[
            { required: true, message: 'Seleccione un artículo.' },
            {
              validator: (_, value: number) => {
                if (!value) return Promise.resolve()

                const repeated = (detailList || []).filter(
                  (item) => Number(item?.ARTICLE_ID) === Number(value)
                )

                if (repeated.length > 1) {
                  return Promise.reject(
                    new Error('No puede repetir el mismo artículo.')
                  )
                }

                return Promise.resolve()
              },
            },
          ]}
        >
          <CustomSelect
            loading={loading}
            placeholder={'Seleccionar artículo'}
            onSearch={onSearchArticle}
            options={articleOptions}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem
          label={'Cantidad'}
          name={[field.name, 'QUANTITY']}
          rules={[{ required: true, message: 'Digite la cantidad.' }]}
        >
          <CustomInputNumber
            style={{ width: '100%' }}
            min={0.01}
            precision={2}
            step={0.01}
            placeholder={'0.00'}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem
          label={'Costo Ref.'}
          name={[field.name, 'UNIT_COST_REFERENCE']}
        >
          <CustomInputNumber
            style={{ width: '100%' }}
            min={0}
            precision={2}
            step={0.01}
            placeholder={'0.00'}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24}>
        <CustomFormItem
          label={'Notas'}
          name={[field.name, 'NOTES']}
          {...labelColFullWidth}
        >
          <CustomTextArea placeholder={'Observaciones del detalle'} />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )
}

const InventoryMovementForm: React.FC<InventoryMovementFormProps> = ({
  open,
  onClose,
  onSuccess,
  initialValues,
  title,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<InventoryMovementFormValues>()
  const [searchArticleKey, setSearchArticleKey] = useState('')
  const debounceArticle = useDebounce(searchArticleKey)

  const { articleList } = useArticleStore()

  const { mutate: getArticlePagination, isPending: isGetArticlesPending } =
    useGetArticlePaginationMutation()
  const { mutateAsync: createInventoryMovement, isPending: isCreatePending } =
    useCreateInventoryMovementMutation()
  const { data: movementTypeList = [], isLoading: isTypeListLoading } =
    useGetInventoryMovementTypeListQuery()

  const manualMovementTypes = useMemo(
    () => movementTypeList.filter((item) => !item.IS_SYSTEM),
    [movementTypeList]
  )

  const articleOptions = useMemo(
    () =>
      articleList.map((article) => ({
        value: article.ARTICLE_ID,
        label: `${article.CODE} - ${article.NAME}`,
      })),
    [articleList]
  )

  const handleSearchArticles = useCallback(() => {
    if (!open) return

    const condition: AdvancedCondition<Article>[] = [
      {
        field: 'STATE' as never,
        operator: '=',
        value: 'A',
      },
    ]

    if (debounceArticle) {
      condition.push({
        field: 'FILTER' as never,
        operator: 'LIKE',
        value: debounceArticle,
      })
    }

    getArticlePagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [debounceArticle, getArticlePagination, open])

  useEffect(handleSearchArticles, [handleSearchArticles])

  const normalizedInitialValues = useMemo<Partial<InventoryMovementFormValues>>(
    () =>
      initialValues
        ? {
            ...initialValues,
            MOVEMENT_DATE: initialValues.MOVEMENT_DATE
              ? dayjs(initialValues.MOVEMENT_DATE)
              : undefined,
          }
        : {},
    [initialValues]
  )

  useEffect(() => {
    if (!open) return

    form.resetFields()
    form.setFieldsValue({
      MOVEMENT_TYPE: 'ENTRY',
      MOVEMENT_DATE: dayjs(),
      DETAILS: [],
      ...normalizedInitialValues,
    })
  }, [form, normalizedInitialValues, open])

  const handleCancel = () => {
    form.resetFields()
    setSearchArticleKey('')
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

      const payload: InventoryMovementPayload = {
        MOVEMENT_TYPE: values.MOVEMENT_TYPE,
        MOVEMENT_DATE: values.MOVEMENT_DATE
          ? values.MOVEMENT_DATE.toISOString()
          : null,
        NOTES: `${values.NOTES || ''}`.trim() || null,
        DETAILS: (values.DETAILS || []).map((detail) => ({
          ARTICLE_ID: Number(detail.ARTICLE_ID),
          QUANTITY: Number(detail.QUANTITY),
          UNIT_COST_REFERENCE:
            detail.UNIT_COST_REFERENCE === undefined ||
            detail.UNIT_COST_REFERENCE === null
              ? null
              : Number(detail.UNIT_COST_REFERENCE),
          NOTES: `${detail.NOTES || ''}`.trim(),
        })),
      }

      await createInventoryMovement(payload)

      notification({
        message: 'Operación exitosa',
        description: 'Movimiento de inventario registrado exitosamente.',
      })

      onSuccess?.()
      handleCancel()
    } catch (error) {
      errorHandler(error)
    }
  }

  return (
    <>
      <CustomModal
        width={'75%'}
        closable
        title={title || 'Formulario de movimiento'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin
          spinning={
            isCreatePending ||
            isGetArticlesPending ||
            Boolean(isTypeListLoading)
          }
        >
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomDivider>
                <CustomTitle level={5}>Encabezado</CustomTitle>
              </CustomDivider>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Tipo'}
                  name={'MOVEMENT_TYPE'}
                  rules={[{ required: true }]}
                >
                  <CustomSelect
                    placeholder={'Seleccionar tipo'}
                    options={manualMovementTypes.map(
                      (item: InventoryMovementType) => ({
                        value: item.CODE,
                        label: movementTypeLabels[item.CODE] || item.NAME,
                      })
                    )}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Fecha'} name={'MOVEMENT_DATE'}>
                  <CustomDatePicker format={'YYYY-MM-DD'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Notas'}
                  name={'NOTES'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Observaciones generales'} />
                </CustomFormItem>
              </CustomCol>

              <CustomDivider>
                <CustomTitle level={5}>Detalles</CustomTitle>
              </CustomDivider>

              <CustomCol xs={24}>
                <CustomCollapseFormList
                  name={'DETAILS'}
                  form={form}
                  addText={'Agregar artículo'}
                  addButtonPosition={'bottom'}
                  itemLabel={(index) => `Detalle ${index + 1}`}
                  onAdd={(add) =>
                    add({
                      QUANTITY: 1,
                      UNIT_COST_REFERENCE: null,
                      NOTES: '',
                    })
                  }
                >
                  {(field) => (
                    <MovementDetailCollapseItem
                      field={field}
                      form={form}
                      articleOptions={articleOptions}
                      onSearchArticle={setSearchArticleKey}
                      loading={isGetArticlesPending}
                    />
                  )}
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

export default InventoryMovementForm
