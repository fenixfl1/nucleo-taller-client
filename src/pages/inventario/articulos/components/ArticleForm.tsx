import React, { useEffect } from 'react'
import { Form, Modal } from 'antd'
import CustomCol from 'src/components/custom/CustomCol'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
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
import { Article, ArticleType } from 'src/services/articles/article.types'
import { useCreateArticleMutation } from 'src/services/articles/useCreateArticleMutation'
import { useUpdateArticleMutation } from 'src/services/articles/useUpdateArticleMutation'

interface ArticleFormProps {
  open?: boolean
  article?: Article
  onClose?: () => void
  onSuccess?: () => void
}

type ArticleFormValues = {
  CODE: string
  NAME: string
  ITEM_TYPE: ArticleType
  UNIT_MEASURE: string
  CATEGORY?: string
  MIN_STOCK?: number | null
  MAX_STOCK?: number | null
  CURRENT_STOCK?: number | null
  COST_REFERENCE?: number | null
  DESCRIPTION?: string
}

const itemTypeOptions = [
  { label: 'Radiador', value: 'RADIADOR' },
  { label: 'Repuesto', value: 'REPUESTO' },
  { label: 'Material', value: 'MATERIAL' },
  { label: 'Insumo', value: 'INSUMO' },
  { label: 'Otro', value: 'OTRO' },
]

const unitMeasureOptions = [
  { label: 'Unidad', value: 'UND' },
  { label: 'Juego', value: 'JGO' },
  { label: 'Litro', value: 'L' },
  { label: 'Galon', value: 'GAL' },
  { label: 'Kilogramo', value: 'KG' },
  { label: 'Metro', value: 'M' },
]

const ArticleForm: React.FC<ArticleFormProps> = ({
  open,
  article,
  onClose,
  onSuccess,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<ArticleFormValues>()

  const { mutateAsync: createArticle, isPending: isCreatePending } =
    useCreateArticleMutation()
  const { mutateAsync: updateArticle, isPending: isUpdatePending } =
    useUpdateArticleMutation()

  useEffect(() => {
    if (article) {
      form.setFieldsValue({
        CODE: article.CODE,
        NAME: article.NAME,
        ITEM_TYPE: article.ITEM_TYPE,
        UNIT_MEASURE: article.UNIT_MEASURE,
        CATEGORY: article.CATEGORY,
        MIN_STOCK: article.MIN_STOCK,
        MAX_STOCK: article.MAX_STOCK,
        CURRENT_STOCK: article.CURRENT_STOCK,
        COST_REFERENCE: article.COST_REFERENCE,
        DESCRIPTION: article.DESCRIPTION,
      })
      return
    }

    form.setFieldsValue({
      ITEM_TYPE: 'REPUESTO',
      UNIT_MEASURE: 'UND',
      MIN_STOCK: 0,
      CURRENT_STOCK: 0,
    })
  }, [form, article, open])

  const handleCancel = () => {
    form.resetFields()
    onClose?.()
  }

  const handleClose = () => {
    modal.confirm({
      onOk: handleCancel,
      title: 'Confirmacion',
      content:
        'Si cierra la ventana perdera cualquier informacion que haya introducido.',
    })
  }

  const handleFinish = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        CODE: values.CODE?.trim().toUpperCase(),
        NAME: values.NAME?.trim(),
        ITEM_TYPE: values.ITEM_TYPE,
        UNIT_MEASURE: values.UNIT_MEASURE,
        CATEGORY: values.CATEGORY?.trim(),
        MIN_STOCK: values.MIN_STOCK ?? 0,
        MAX_STOCK: values.MAX_STOCK ?? null,
        CURRENT_STOCK: values.CURRENT_STOCK ?? 0,
        COST_REFERENCE: values.COST_REFERENCE ?? null,
        DESCRIPTION: values.DESCRIPTION?.trim(),
      }

      let description = 'Articulo registrado exitosamente.'

      if (article?.ARTICLE_ID) {
        await updateArticle({
          ...payload,
          ARTICLE_ID: article.ARTICLE_ID,
        })
        description = 'Articulo actualizado exitosamente.'
      } else {
        await createArticle(payload)
      }

      notification({
        message: 'Operacion exitosa',
        description,
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
        width={'70%'}
        closable
        title={'Formulario de articulo'}
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin spinning={isCreatePending || isUpdatePending}>
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomDivider>
                <CustomTitle level={5}>Datos del Articulo</CustomTitle>
              </CustomDivider>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Codigo'}
                  name={'CODE'}
                  rules={[{ required: true }]}
                  uppercase
                >
                  <CustomInput placeholder={'Codigo'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Nombre'}
                  name={'NAME'}
                  rules={[{ required: true }]}
                >
                  <CustomInput placeholder={'Nombre del articulo'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Tipo'}
                  name={'ITEM_TYPE'}
                  rules={[{ required: true }]}
                >
                  <CustomSelect
                    placeholder={'Seleccionar tipo'}
                    options={itemTypeOptions}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Unidad'}
                  name={'UNIT_MEASURE'}
                  rules={[{ required: true }]}
                >
                  <CustomSelect
                    placeholder={'Seleccionar unidad'}
                    options={unitMeasureOptions}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Categoria'} name={'CATEGORY'}>
                  <CustomInput placeholder={'Categoria'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Stock Minimo'} name={'MIN_STOCK'}>
                  <CustomInputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    step={0.01}
                    placeholder={'0.00'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Stock Maximo'}
                  name={'MAX_STOCK'}
                  rules={[
                    {
                      validator: async (_, value: number | null) => {
                        if (value === null || value === undefined) return
                        const minValue = form.getFieldValue('MIN_STOCK')
                        if (minValue === null || minValue === undefined) return
                        if (Number(value) < Number(minValue)) {
                          throw new Error(
                            'El stock maximo no puede ser menor al minimo.'
                          )
                        }
                      },
                    },
                  ]}
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

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Stock Actual'} name={'CURRENT_STOCK'}>
                  <CustomInputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    step={0.01}
                    placeholder={'0.00'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Costo Referencia'} name={'COST_REFERENCE'}>
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
                  label={'Descripcion'}
                  name={'DESCRIPTION'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Descripcion del articulo'} />
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

export default ArticleForm
