import React, { useEffect, useMemo } from 'react'
import { Form, FormInstance, Modal } from 'antd'
import { FormListFieldData } from 'antd/es/form'
import CustomCol from 'src/components/custom/CustomCol'
import CustomCollapseFormList from 'src/components/custom/CustomCollapseFormList'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomForm from 'src/components/custom/CustomFrom'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomInput from 'src/components/custom/CustomInput'
import CustomInputNumber from 'src/components/custom/CustomInputNumber'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTag from 'src/components/custom/CustomTag'
import CustomTextArea from 'src/components/custom/CustomTextArea'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import { useAppNotification } from 'src/context/NotificationContext'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import {
  Article,
  ArticleCompatibility,
  ArticleType,
} from 'src/services/articles/article.types'
import { useCreateArticleMutation } from 'src/services/articles/useCreateArticleMutation'
import { useGetOneArticleQuery } from 'src/services/articles/useGetOneArticleQuery'
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
  COMPATIBILITIES?: ArticleCompatibility[]
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

const ArticleCompatibilityCollapseItem: React.FC<{
  field: FormListFieldData
  form: FormInstance<ArticleFormValues>
}> = ({ field, form }) => {
  const compatibilities = Form.useWatch('COMPATIBILITIES', form) as
    | ArticleCompatibility[]
    | undefined

  return (
    <CustomRow justify={'start'} width={'100%'}>
      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem
          label={'Marca'}
          name={[field.name, 'BRAND']}
          rules={[{ required: true, message: 'Digite la marca.' }]}
        >
          <CustomInput placeholder={'Marca'} />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem
          label={'Modelo'}
          name={[field.name, 'MODEL']}
          rules={[{ required: true, message: 'Digite el modelo.' }]}
        >
          <CustomInput placeholder={'Modelo'} />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem label={'Año desde'} name={[field.name, 'YEAR_FROM']}>
          <CustomInputNumber
            style={{ width: '100%' }}
            format={{ format: 'default' }}
            min={1900}
            max={2100}
            precision={0}
            placeholder={'Año'}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem
          label={'Año hasta'}
          name={[field.name, 'YEAR_TO']}
          rules={[
            {
              validator: async (_, value: number | null) => {
                if (value === null || value === undefined) return
                const current = compatibilities?.[field.name]
                if (
                  current?.YEAR_FROM !== null &&
                  current?.YEAR_FROM !== undefined &&
                  Number(value) < Number(current.YEAR_FROM)
                ) {
                  throw new Error('No puede ser menor que el año desde.')
                }
              },
            },
          ]}
        >
          <CustomInputNumber
            style={{ width: '100%' }}
            format={{ format: 'default' }}
            min={1900}
            max={2100}
            precision={0}
            placeholder={'Año'}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem label={'Motor'} name={[field.name, 'ENGINE']}>
          <CustomInput placeholder={'Motor'} />
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24}>
        <CustomFormItem
          label={'Notas'}
          name={[field.name, 'NOTES']}
          {...labelColFullWidth}
        >
          <CustomTextArea placeholder={'Observaciones de compatibilidad'} />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )
}

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
  const watchedCompatibilities = Form.useWatch('COMPATIBILITIES', form) as
    | ArticleCompatibility[]
    | undefined
  const { data: articleDetail, isLoading: isGetOnePending } = useGetOneArticleQuery(
    article?.ARTICLE_ID,
    Boolean(open && article?.ARTICLE_ID)
  )

  const { mutateAsync: createArticle, isPending: isCreatePending } =
    useCreateArticleMutation()
  const { mutateAsync: updateArticle, isPending: isUpdatePending } =
    useUpdateArticleMutation()

  const compatibilityCount = useMemo(
    () =>
      (watchedCompatibilities || []).filter(
        (item) => item?.BRAND?.trim() && item?.MODEL?.trim()
      ).length,
    [watchedCompatibilities]
  )

  const compatibilityPreview = useMemo(() => {
    return (watchedCompatibilities || [])
      .filter((item) => item?.BRAND?.trim() && item?.MODEL?.trim())
      .slice(0, 2)
      .map((item) => {
        const years =
          item.YEAR_FROM || item.YEAR_TO
            ? `${item.YEAR_FROM || ''}${item.YEAR_TO ? `-${item.YEAR_TO}` : ''}`
            : ''

        return [item.BRAND, item.MODEL, years, item.ENGINE]
          .filter(Boolean)
          .join(' ')
      })
      .join(' | ')
  }, [watchedCompatibilities])

  useEffect(() => {
    const currentArticle = articleDetail || article

    if (currentArticle) {
      form.setFieldsValue({
        CODE: currentArticle.CODE,
        NAME: currentArticle.NAME,
        ITEM_TYPE: currentArticle.ITEM_TYPE,
        UNIT_MEASURE: currentArticle.UNIT_MEASURE,
        CATEGORY: currentArticle.CATEGORY,
        MIN_STOCK: currentArticle.MIN_STOCK,
        MAX_STOCK: currentArticle.MAX_STOCK,
        CURRENT_STOCK: currentArticle.CURRENT_STOCK,
        COST_REFERENCE: currentArticle.COST_REFERENCE,
        DESCRIPTION: currentArticle.DESCRIPTION,
        COMPATIBILITIES: (currentArticle.COMPATIBILITIES || []).map((item) => ({
          BRAND: item.BRAND,
          MODEL: item.MODEL,
          YEAR_FROM: item.YEAR_FROM ?? null,
          YEAR_TO: item.YEAR_TO ?? null,
          ENGINE: item.ENGINE || '',
          NOTES: item.NOTES || '',
        })),
      })
      return
    }

    form.setFieldsValue({
      ITEM_TYPE: 'REPUESTO',
      UNIT_MEASURE: 'UND',
      MIN_STOCK: 0,
      CURRENT_STOCK: 0,
      COMPATIBILITIES: [],
    })
  }, [form, article, articleDetail, open])

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
        COMPATIBILITIES: (values.COMPATIBILITIES || []).map((item) => ({
          BRAND: `${item.BRAND || ''}`.trim(),
          MODEL: `${item.MODEL || ''}`.trim(),
          YEAR_FROM: item.YEAR_FROM ?? null,
          YEAR_TO: item.YEAR_TO ?? null,
          ENGINE: `${item.ENGINE || ''}`.trim(),
          NOTES: `${item.NOTES || ''}`.trim(),
        })),
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
        <CustomSpin spinning={isCreatePending || isUpdatePending || isGetOnePending}>
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

              <CustomDivider>
                <CustomTitle level={5}>Compatibilidad vehículo/artículo</CustomTitle>
              </CustomDivider>

              <CustomCol xs={24}>
                <div
                  style={{
                    padding: 12,
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <CustomTag color={compatibilityCount > 0 ? 'processing' : 'default'}>
                    {compatibilityCount > 0
                      ? `${compatibilityCount} compatibilidades registradas`
                      : 'Sin compatibilidad registrada'}
                  </CustomTag>
                  {compatibilityPreview ? (
                    <div style={{ marginTop: 8 }}>
                      <CustomText type={'secondary'}>
                        {compatibilityPreview}
                        {compatibilityCount > 2 ? ' ...' : ''}
                      </CustomText>
                    </div>
                  ) : null}
                </div>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomCollapseFormList
                  name={'COMPATIBILITIES'}
                  form={form}
                  addText={'Agregar compatibilidad'}
                  addButtonPosition={'bottom'}
                  itemLabel={(index) => `Compatibilidad ${index + 1}`}
                  onAdd={(add) =>
                    add({
                      BRAND: '',
                      MODEL: '',
                      YEAR_FROM: null,
                      YEAR_TO: null,
                      ENGINE: '',
                      NOTES: '',
                    })
                  }
                >
                  {(field) => (
                    <ArticleCompatibilityCollapseItem field={field} form={form} />
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

export default ArticleForm
