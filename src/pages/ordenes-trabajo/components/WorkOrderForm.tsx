import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Form, FormInstance, Modal } from 'antd'
import { FormListFieldData } from 'antd/es/form'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCheckbox from 'src/components/custom/CustomCheckbox'
import CustomCol from 'src/components/custom/CustomCol'
import CustomCollapseFormList from 'src/components/custom/CustomCollapseFormList'
import CustomDatePicker from 'src/components/custom/CustomDatePicker'
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
import CustomTimeline from 'src/components/custom/CustomTimeline'
import {
  defaultBreakpoints,
  formItemLayout,
  labelColFullWidth,
} from 'src/config/breakpoints'
import { useAppNotification } from 'src/context/NotificationContext'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import useDebounce from 'src/hooks/use-debounce'
import { useGetCompatibleArticlesByVehicleQuery } from 'src/services/articles/useGetCompatibleArticlesByVehicleQuery'
import { useGetArticlePaginationMutation } from 'src/services/articles/useGetArticlePaginationMutation'
import { Article } from 'src/services/articles/article.types'
import { Customer } from 'src/services/customers/customer.types'
import { useGetCustomerPaginationMutation } from 'src/services/customers/useGetCustomerPaginationMutation'
import { useCreateWorkOrderMutation } from 'src/services/work-orders/useCreateWorkOrderMutation'
import { useGetOneWorkOrderQuery } from 'src/services/work-orders/useGetOneWorkOrderQuery'
import { useGetWorkOrderStatusListQuery } from 'src/services/work-orders/useGetWorkOrderStatusListQuery'
import { useUpdateWorkOrderMutation } from 'src/services/work-orders/useUpdateWorkOrderMutation'
import {
  WorkOrderConsumedItem,
  WorkOrderPayload,
  WorkOrderServiceLine,
  WorkOrderStatus,
  WorkOrderTechnician,
} from 'src/services/work-orders/work-order.types'
import { useGetWorkOrderServiceTypeListQuery } from 'src/services/work-order-service-types/useGetWorkOrderServiceTypeListQuery'
import { WorkOrderServiceType as ServiceCatalogItem } from 'src/services/work-order-service-types/work-order-service-type.types'
import { User } from 'src/services/users/users.types'
import { useGetUserPaginationMutation } from 'src/services/users/useGetUserPaginationMutation'
import { useGetVehiclePaginationMutation } from 'src/services/vehicles/useGetVehiclePaginationMutation'
import { Vehicle } from 'src/services/vehicles/vehicle.types'
import { useArticleStore } from 'src/store/article.store'
import { useCustomerStore } from 'src/store/customer.store'
import { useUserStore } from 'src/store/user.store'
import { useVehicleStore } from 'src/store/vehicle.store'
import { AdvancedCondition } from 'src/types/general'
import CustomerForm from 'src/pages/clientes/components/CustomerForm'
import VehicleForm from 'src/pages/vehiculos/components/VehicleForm'

type WorkOrderFormValues = {
  CUSTOMER_ID: number
  VEHICLE_ID: number
  STATUS_ID?: number
  PROMISED_AT?: dayjs.Dayjs
  SYMPTOM: string
  DIAGNOSIS?: string
  WORK_PERFORMED?: string
  INTERNAL_NOTES?: string
  CUSTOMER_OBSERVATIONS?: string
  REQUIRES_DISASSEMBLY?: boolean
  STATUS_CHANGE_NOTES?: string
  SERVICE_LINES?: WorkOrderServiceLine[]
  CONSUMED_ITEMS?: WorkOrderConsumedItem[]
  TECHNICIANS?: WorkOrderTechnician[]
}

interface WorkOrderFormProps {
  open?: boolean
  workOrderId?: number
  onClose?: () => void
  onSuccess?: () => void
}

const buildCompatibilityLabel = (article: Article): string => {
  const compatibility = article.COMPATIBILITIES?.[0]

  if (!compatibility) {
    return 'Compatibilidad sugerida'
  }

  const years =
    compatibility.YEAR_FROM || compatibility.YEAR_TO
      ? `${compatibility.YEAR_FROM || ''}${compatibility.YEAR_TO ? `-${compatibility.YEAR_TO}` : ''}`
      : ''

  return [compatibility.BRAND, compatibility.MODEL, years, compatibility.ENGINE]
    .filter(Boolean)
    .join(' ')
}

const buildArticleOptionLabel = ({
  article,
  isCompatible,
  inStock,
}: {
  article: Article
  isCompatible: boolean
  inStock: boolean
}): string => {
  const indicators = isCompatible
    ? ['Compatible', inStock ? 'Disponible' : 'Sin stock']
    : []

  return [
    `${article.CODE} - ${article.NAME}`,
    indicators.length ? indicators.join(' · ') : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

const formatAmount = (value: number) => Number(value || 0).toFixed(2)

const statusTimelineColorByCode: Record<string, string> = {
  CREADA: '#9ca3af',
  DIAGNOSTICO: '#1677ff',
  REPARACION: '#faad14',
  LISTA_ENTREGA: '#13c2c2',
  ENTREGADA: '#52c41a',
  CANCELADA: '#ff4d4f',
}

const ServiceLineCollapseItem: React.FC<{
  field: FormListFieldData
  form: FormInstance<WorkOrderFormValues>
  serviceTypeOptions: Array<{ label: string; value: string }>
  serviceTypeMap: Map<string, ServiceCatalogItem>
}> = ({ field, form, serviceTypeOptions, serviceTypeMap }) => {
  const currentType = Form.useWatch(
    ['SERVICE_LINES', field.name, 'SERVICE_TYPE'],
    form
  ) as string | undefined
  const currentQuantity = Number(
    Form.useWatch(['SERVICE_LINES', field.name, 'QUANTITY'], form) || 0
  )
  const currentReferenceAmount = Number(
    Form.useWatch(['SERVICE_LINES', field.name, 'REFERENCE_AMOUNT'], form) || 0
  )
  const currentDescription = `${
    Form.useWatch(['SERVICE_LINES', field.name, 'DESCRIPTION'], form) || ''
  }`
  const selectedServiceType = currentType
    ? serviceTypeMap.get(currentType)
    : undefined
  const lineTotal = Number(
    (currentQuantity * currentReferenceAmount).toFixed(2)
  )

  const resolvedOptions = currentType
    ? serviceTypeOptions.some((item) => item.value === currentType)
      ? serviceTypeOptions
      : [...serviceTypeOptions, { label: currentType, value: currentType }]
    : serviceTypeOptions

  const handleServiceTypeChange = (value?: string) => {
    const nextType = `${value || ''}`.trim()
    if (!nextType) return

    const serviceType = serviceTypeMap.get(nextType)
    if (!serviceType) return

    const descriptionPath: ['SERVICE_LINES', number, 'DESCRIPTION'] = [
      'SERVICE_LINES',
      field.name,
      'DESCRIPTION',
    ]
    const amountPath: ['SERVICE_LINES', number, 'REFERENCE_AMOUNT'] = [
      'SERVICE_LINES',
      field.name,
      'REFERENCE_AMOUNT',
    ]

    if (!currentDescription.trim() && serviceType.DESCRIPTION) {
      form.setFieldValue(descriptionPath, serviceType.DESCRIPTION)
    }

    const currentAmount = form.getFieldValue(amountPath)
    if (
      currentAmount === null ||
      currentAmount === undefined ||
      currentAmount === '' ||
      Number(currentAmount) <= 0
    ) {
      form.setFieldValue(amountPath, Number(serviceType.BASE_PRICE || 0))
    }
  }

  return (
    <CustomRow justify={'start'} width={'100%'}>
      {selectedServiceType ? (
        <CustomCol xs={24}>
          <div
            style={{
              marginBottom: 12,
              padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
          >
            <CustomTag color={'processing'}>
              Precio base:{' '}
              {formatAmount(Number(selectedServiceType.BASE_PRICE || 0))}
            </CustomTag>
            <CustomTag color={'gold'}>
              Total: {formatAmount(lineTotal)}
            </CustomTag>
            {selectedServiceType.DESCRIPTION ? (
              <div style={{ marginTop: 6 }}>
                <CustomText style={{ fontSize: 12 }}>
                  {selectedServiceType.DESCRIPTION}
                </CustomText>
              </div>
            ) : null}
          </div>
        </CustomCol>
      ) : null}

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem
          label={'Tipo'}
          name={[field.name, 'SERVICE_TYPE']}
          rules={[{ required: true, message: 'Digite el tipo de servicio.' }]}
        >
          <CustomSelect
            placeholder={'Seleccionar servicio'}
            onChange={handleServiceTypeChange}
            options={resolvedOptions}
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

      <CustomCol xs={24}>
        <CustomFormItem
          label={'Descripción'}
          name={[field.name, 'DESCRIPTION']}
          rules={[{ required: true, message: 'Digite la descripción.' }]}
          {...labelColFullWidth}
        >
          <CustomTextArea placeholder={'Trabajo realizado'} />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem
          label={'Precio Ref.'}
          name={[field.name, 'REFERENCE_AMOUNT']}
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
        <CustomFormItem label={'Notas'} name={[field.name, 'NOTES']}>
          <CustomInput placeholder={'Notas internas'} />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )
}

const ConsumedItemCollapseItem: React.FC<{
  field: FormListFieldData
  form: FormInstance<WorkOrderFormValues>
  articleOptions: Array<{ label: string; value: number }>
  articleById: Map<number, Article>
  compatibleArticleIdSet: Set<number>
  hasVehicleSelected?: boolean
  onSearchArticle?: (value: string) => void
  loading?: boolean
}> = ({
  field,
  form,
  articleOptions,
  articleById,
  compatibleArticleIdSet,
  hasVehicleSelected,
  onSearchArticle,
  loading,
}) => {
  const consumedItems = Form.useWatch('CONSUMED_ITEMS', form) as
    | WorkOrderConsumedItem[]
    | undefined
  const selectedArticleId = Form.useWatch(
    ['CONSUMED_ITEMS', field.name, 'ARTICLE_ID'],
    form
  ) as number | undefined
  const currentArticle = selectedArticleId
    ? articleById.get(Number(selectedArticleId))
    : undefined
  const isCompatible = selectedArticleId
    ? compatibleArticleIdSet.has(Number(selectedArticleId))
    : false
  const isIncompatible = Boolean(
    hasVehicleSelected && selectedArticleId && !isCompatible
  )

  const handleArticleChange = (value?: number) => {
    const articleId = Number(value)

    if (!articleId || !compatibleArticleIdSet.has(articleId)) {
      return
    }

    const article = articleById.get(articleId)

    if (!article) {
      return
    }

    const quantityPath: ['CONSUMED_ITEMS', number, 'QUANTITY'] = [
      'CONSUMED_ITEMS',
      field.name,
      'QUANTITY',
    ]
    const costPath: ['CONSUMED_ITEMS', number, 'UNIT_COST_REFERENCE'] = [
      'CONSUMED_ITEMS',
      field.name,
      'UNIT_COST_REFERENCE',
    ]
    const currentQuantity = Number(form.getFieldValue(quantityPath) || 0)
    const currentCost = form.getFieldValue(costPath)

    if (!currentQuantity || currentQuantity <= 0) {
      form.setFieldValue(quantityPath, 1)
    }

    if (
      (currentCost === null ||
        currentCost === undefined ||
        currentCost === '') &&
      article.COST_REFERENCE !== null &&
      article.COST_REFERENCE !== undefined
    ) {
      form.setFieldValue(costPath, article.COST_REFERENCE)
    }
  }

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        border: isIncompatible
          ? '1px solid rgba(255, 77, 79, 0.35)'
          : '1px solid rgba(255,255,255,0.06)',
        background: isIncompatible ? 'rgba(255, 77, 79, 0.06)' : 'transparent',
      }}
    >
      {selectedArticleId ? (
        <div style={{ marginBottom: 12 }}>
          <CustomTag color={isCompatible ? 'processing' : 'error'}>
            {isCompatible
              ? 'Compatible con el vehículo'
              : 'No compatible con el vehículo'}
          </CustomTag>
          <CustomText style={{ fontSize: 12 }}>
            {isCompatible && currentArticle
              ? `${buildCompatibilityLabel(currentArticle)}${
                  currentArticle.COST_REFERENCE !== null &&
                  currentArticle.COST_REFERENCE !== undefined
                    ? ` | Costo base sugerido: ${Number(
                        currentArticle.COST_REFERENCE
                      ).toFixed(2)}`
                    : ''
                }`
              : 'Revise este consumo; no coincide con la compatibilidad configurada para el vehículo actual.'}
          </CustomText>
        </div>
      ) : null}

      <CustomRow justify={'start'} width={'100%'}>
        <CustomCol xs={24}>
          <CustomFormItem
            {...labelColFullWidth}
            label={'Artículo'}
            name={[field.name, 'ARTICLE_ID']}
            rules={[
              { required: true, message: 'Seleccione un artículo.' },
              {
                validator: (_, value: number) => {
                  if (!value) return Promise.resolve()

                  const repeated = (consumedItems || []).filter(
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
              onChange={handleArticleChange}
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
            <CustomTextArea placeholder={'Observaciones del consumo'} />
          </CustomFormItem>
        </CustomCol>
      </CustomRow>
    </div>
  )
}

const TechnicianCollapseItem: React.FC<{
  field: FormListFieldData
  form: FormInstance<WorkOrderFormValues>
  technicianOptions: Array<{ label: string; value: number }>
  onSearchTechnician?: (value: string) => void
  loading?: boolean
}> = ({ field, form, technicianOptions, onSearchTechnician, loading }) => {
  const technicians = Form.useWatch('TECHNICIANS', form) as
    | WorkOrderTechnician[]
    | undefined

  return (
    <CustomRow justify={'start'} width={'100%'}>
      <CustomCol xs={24}>
        <CustomFormItem
          label={'Técnico'}
          name={[field.name, 'STAFF_ID']}
          {...labelColFullWidth}
          rules={[
            { required: true, message: 'Seleccione un técnico.' },
            {
              validator: (_, value: number) => {
                if (!value) return Promise.resolve()

                const repeated = (technicians || []).filter(
                  (item) => Number(item?.STAFF_ID) === Number(value)
                )

                if (repeated.length > 1) {
                  return Promise.reject(
                    new Error('No puede repetir el mismo técnico.')
                  )
                }

                return Promise.resolve()
              },
            },
          ]}
        >
          <CustomSelect
            loading={loading}
            placeholder={'Seleccionar técnico'}
            onSearch={onSearchTechnician}
            options={technicianOptions}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem label={'Rol'} name={[field.name, 'ROLE_ON_JOB']}>
          <CustomInput placeholder={'Ej. Técnico principal'} />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem
          label={'Porcentaje Ref.'}
          name={[field.name, 'REFERENCE_PERCENT']}
        >
          <CustomInputNumber
            style={{ width: '100%' }}
            min={0}
            max={100}
            precision={2}
            step={0.01}
            placeholder={'0.00'}
          />
        </CustomFormItem>
      </CustomCol>

      <CustomCol {...defaultBreakpoints}>
        <CustomFormItem
          label={'Monto Ref.'}
          name={[field.name, 'REFERENCE_AMOUNT']}
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
        <CustomFormItem
          label={'Líder'}
          name={[field.name, 'IS_LEAD']}
          valuePropName={'checked'}
        >
          <CustomCheckbox />
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24}>
        <CustomFormItem
          label={'Notas'}
          name={[field.name, 'NOTES']}
          {...labelColFullWidth}
        >
          <CustomTextArea placeholder={'Observaciones del técnico'} />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  open,
  workOrderId,
  onClose,
  onSuccess,
}) => {
  const notification = useAppNotification()
  const [errorHandler] = useErrorHandler()
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<WorkOrderFormValues>()
  const [showAllArticleOptions, setShowAllArticleOptions] = useState(true)
  const [searchCustomerKey, setSearchCustomerKey] = useState('')
  const [searchVehicleKey, setSearchVehicleKey] = useState('')
  const [searchArticleKey, setSearchArticleKey] = useState('')
  const [searchTechnicianKey, setSearchTechnicianKey] = useState('')
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false)
  const [quickVehicleOpen, setQuickVehicleOpen] = useState(false)
  const [recentCustomer, setRecentCustomer] = useState<Customer>()
  const [recentVehicle, setRecentVehicle] = useState<Vehicle>()

  const watchedCustomerId = Form.useWatch('CUSTOMER_ID', form)
  const watchedVehicleId = Form.useWatch('VEHICLE_ID', form)
  const watchedConsumedItems = Form.useWatch('CONSUMED_ITEMS', form) as
    | WorkOrderConsumedItem[]
    | undefined
  const watchedServiceLines = Form.useWatch('SERVICE_LINES', form) as
    | WorkOrderServiceLine[]
    | undefined

  const debounceCustomer = useDebounce(searchCustomerKey)
  const debounceVehicle = useDebounce(searchVehicleKey)
  const debounceArticle = useDebounce(searchArticleKey)
  const debounceTechnician = useDebounce(searchTechnicianKey)

  const { customerList } = useCustomerStore()
  const { vehicleList } = useVehicleStore()
  const { articleList } = useArticleStore()
  const { userList } = useUserStore()

  const { mutate: getCustomerPagination, isPending: isGetCustomersPending } =
    useGetCustomerPaginationMutation()
  const { mutate: getVehiclePagination, isPending: isGetVehiclesPending } =
    useGetVehiclePaginationMutation()
  const { mutate: getArticlePagination, isPending: isGetArticlesPending } =
    useGetArticlePaginationMutation()
  const { mutate: getUserPagination, isPending: isGetUsersPending } =
    useGetUserPaginationMutation()
  const { mutateAsync: createWorkOrder, isPending: isCreatePending } =
    useCreateWorkOrderMutation()
  const { mutateAsync: updateWorkOrder, isPending: isUpdatePending } =
    useUpdateWorkOrderMutation()
  const { data: statusList = [], isLoading: isStatusListLoading } =
    useGetWorkOrderStatusListQuery()
  const { data: serviceTypeList = [], isLoading: isServiceTypeListLoading } =
    useGetWorkOrderServiceTypeListQuery()
  const {
    data: compatibleArticles = [],
    isLoading: isCompatibleArticlesLoading,
  } = useGetCompatibleArticlesByVehicleQuery(
    Number(watchedVehicleId || undefined),
    Boolean(open && watchedVehicleId)
  )
  const {
    data: workOrder,
    isLoading: isGetOnePending,
    isFetching: isGetOneFetching,
  } = useGetOneWorkOrderQuery(workOrderId, Boolean(open && workOrderId))

  const availableCustomers = useMemo(() => {
    const mergedCustomers = new Map<number, Customer>()

    customerList.forEach((customer) => {
      mergedCustomers.set(customer.PERSON_ID, customer)
    })

    if (recentCustomer?.PERSON_ID) {
      mergedCustomers.set(recentCustomer.PERSON_ID, recentCustomer)
    }

    return [...mergedCustomers.values()]
  }, [customerList, recentCustomer])

  const customerOptions = useMemo(
    () =>
      availableCustomers.map((customer) => ({
        value: customer.PERSON_ID,
        label:
          `${customer.NAME} ${customer.LAST_NAME || ''} (${customer.IDENTITY_DOCUMENT || 'SIN DOC'})`.trim(),
      })),
    [availableCustomers]
  )

  const availableVehicles = useMemo(() => {
    if (!watchedCustomerId) {
      return []
    }

    const mergedVehicles = new Map<number, Vehicle>()

    vehicleList.forEach((vehicle) => {
      if (Number(vehicle.CUSTOMER_ID) === Number(watchedCustomerId)) {
        mergedVehicles.set(vehicle.VEHICLE_ID, vehicle)
      }
    })

    if (
      recentVehicle?.VEHICLE_ID &&
      Number(recentVehicle.CUSTOMER_ID) === Number(watchedCustomerId)
    ) {
      mergedVehicles.set(recentVehicle.VEHICLE_ID, recentVehicle)
    }

    return [...mergedVehicles.values()]
  }, [recentVehicle, vehicleList, watchedCustomerId])

  const vehicleOptions = useMemo(
    () =>
      availableVehicles.map((vehicle) => ({
        value: vehicle.VEHICLE_ID,
        label: `${vehicle.PLATE || 'SIN PLACA'} - ${vehicle.BRAND} ${vehicle.MODEL}`,
      })),
    [availableVehicles]
  )

  const technicianOptions = useMemo(
    () =>
      userList.map((user) => ({
        value: user.STAFF_ID,
        label:
          `${user.NAME} ${user.LAST_NAME || ''} (@${user.USERNAME})`.trim(),
      })),
    [userList]
  )

  const serviceTypeOptions = useMemo(
    () =>
      serviceTypeList.map((item) => ({
        value: item.NAME,
        label: `${item.NAME} · Base ${formatAmount(Number(item.BASE_PRICE || 0))}`,
      })),
    [serviceTypeList]
  )

  const serviceTypeMap = useMemo(
    () => new Map(serviceTypeList.map((item) => [item.NAME, item])),
    [serviceTypeList]
  )

  const serviceLinesTotal = useMemo(
    () =>
      Number(
        (
          (watchedServiceLines || []).reduce((accumulator, item) => {
            return (
              accumulator +
              Number(item?.QUANTITY || 0) * Number(item?.REFERENCE_AMOUNT || 0)
            )
          }, 0) || 0
        ).toFixed(2)
      ),
    [watchedServiceLines]
  )

  const defaultStatusId = useMemo(
    () =>
      statusList.find((status) => status.CODE === 'CREADA')?.STATUS_ID ||
      statusList.find((status) => !status.IS_FINAL)?.STATUS_ID,
    [statusList]
  )

  const statusOptions = useMemo(() => {
    const filtered = workOrderId
      ? statusList
      : statusList.filter((item) => !item.IS_FINAL)

    return filtered.map((status: WorkOrderStatus) => ({
      value: status.STATUS_ID,
      label: status.NAME,
    }))
  }, [statusList, workOrderId])

  const compatibleArticleSuggestions = useMemo(() => {
    return [...compatibleArticles]
      .sort((left, right) => {
        const leftStock = Number(left.CURRENT_STOCK || 0)
        const rightStock = Number(right.CURRENT_STOCK || 0)
        const stockPriority = Number(rightStock > 0) - Number(leftStock > 0)

        if (stockPriority !== 0) {
          return stockPriority
        }

        if (rightStock !== leftStock) {
          return rightStock - leftStock
        }

        return `${left.CODE} ${left.NAME}`.localeCompare(
          `${right.CODE} ${right.NAME}`
        )
      })
      .map((article) => {
        const currentStock = Number(article.CURRENT_STOCK || 0)

        return {
          article,
          currentStock,
          inStock: currentStock > 0,
          alreadyAdded: Boolean(
            (watchedConsumedItems || []).some(
              (item) => Number(item.ARTICLE_ID) === Number(article.ARTICLE_ID)
            )
          ),
        }
      })
  }, [compatibleArticles, watchedConsumedItems])

  const articleById = useMemo(() => {
    const mergedArticles = new Map<number, Article>()

    compatibleArticles.forEach((article) => {
      mergedArticles.set(article.ARTICLE_ID, article)
    })

    articleList.forEach((article) => {
      const previous = mergedArticles.get(article.ARTICLE_ID)
      mergedArticles.set(article.ARTICLE_ID, {
        ...article,
        COMPATIBILITIES: previous?.COMPATIBILITIES || article.COMPATIBILITIES,
      })
    })

    return mergedArticles
  }, [articleList, compatibleArticles])

  const articleOptions = useMemo(() => {
    const suggestionIndex = new Map(
      compatibleArticleSuggestions.map((item, index) => [
        item.article.ARTICLE_ID,
        { index, inStock: item.inStock },
      ])
    )

    return [...articleById.values()]
      .sort((left, right) => {
        const leftSuggestion = suggestionIndex.get(left.ARTICLE_ID)
        const rightSuggestion = suggestionIndex.get(right.ARTICLE_ID)
        const compatibilityPriority =
          Number(Boolean(rightSuggestion)) - Number(Boolean(leftSuggestion))

        if (compatibilityPriority !== 0) {
          return compatibilityPriority
        }

        if (leftSuggestion && rightSuggestion) {
          if (
            Number(rightSuggestion.inStock) !== Number(leftSuggestion.inStock)
          ) {
            return (
              Number(rightSuggestion.inStock) - Number(leftSuggestion.inStock)
            )
          }

          return leftSuggestion.index - rightSuggestion.index
        }

        return `${left.CODE} ${left.NAME}`.localeCompare(
          `${right.CODE} ${right.NAME}`
        )
      })
      .map((article) => {
        const suggestion = suggestionIndex.get(article.ARTICLE_ID)

        return {
          value: article.ARTICLE_ID,
          label: buildArticleOptionLabel({
            article,
            isCompatible: Boolean(suggestion),
            inStock: Boolean(suggestion?.inStock),
          }),
        }
      })
  }, [articleById, compatibleArticleSuggestions])

  const compatibleArticleIdSet = useMemo(
    () => new Set(compatibleArticles.map((item) => Number(item.ARTICLE_ID))),
    [compatibleArticles]
  )

  const selectedArticleIdSet = useMemo(
    () =>
      new Set(
        (watchedConsumedItems || [])
          .map((item) => Number(item.ARTICLE_ID))
          .filter(Boolean)
      ),
    [watchedConsumedItems]
  )

  const filteredArticleOptions = useMemo(() => {
    if (!watchedVehicleId || showAllArticleOptions) {
      return articleOptions
    }

    return articleOptions.filter(
      (item) =>
        compatibleArticleIdSet.has(Number(item.value)) ||
        selectedArticleIdSet.has(Number(item.value))
    )
  }, [
    articleOptions,
    compatibleArticleIdSet,
    selectedArticleIdSet,
    showAllArticleOptions,
    watchedVehicleId,
  ])

  const handleSearchCustomers = useCallback(() => {
    if (!open) return

    const condition: AdvancedCondition<Customer>[] = [
      {
        field: 'STATE' as never,
        operator: '=',
        value: 'A',
      },
    ]

    if (debounceCustomer) {
      condition.push({
        field: 'FILTER' as never,
        operator: 'LIKE',
        value: debounceCustomer,
      })
    }

    getCustomerPagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [debounceCustomer, getCustomerPagination, open])

  const handleSearchVehicles = useCallback(() => {
    if (!open || !watchedCustomerId) {
      form.setFieldValue('VEHICLE_ID', undefined)
      return
    }

    const condition: AdvancedCondition<Vehicle>[] = [
      {
        field: 'STATE' as never,
        operator: '=',
        value: 'A',
      },
      {
        field: 'CUSTOMER_ID' as never,
        operator: '=',
        value: Number(watchedCustomerId),
      },
    ]

    if (debounceVehicle) {
      condition.push({
        field: 'FILTER' as never,
        operator: 'LIKE',
        value: debounceVehicle,
      })
    }

    getVehiclePagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [debounceVehicle, form, getVehiclePagination, open, watchedCustomerId])

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

  const handleSearchTechnicians = useCallback(() => {
    if (!open) return

    const condition: AdvancedCondition<User>[] = [
      {
        field: 'STATE' as never,
        operator: '=',
        value: 'A',
      },
      {
        field: 'EMPLOYEE_TYPE' as never,
        operator: '=',
        value: 'OPERACIONAL',
      },
    ]

    if (debounceTechnician) {
      condition.push({
        field: 'FILTER' as never,
        operator: 'LIKE',
        value: debounceTechnician,
      })
    }

    getUserPagination({
      page: 1,
      size: 100,
      condition,
    })
  }, [debounceTechnician, getUserPagination, open])

  useEffect(handleSearchCustomers, [handleSearchCustomers])
  useEffect(handleSearchVehicles, [handleSearchVehicles])
  useEffect(handleSearchArticles, [handleSearchArticles])
  useEffect(handleSearchTechnicians, [handleSearchTechnicians])

  useEffect(() => {
    setShowAllArticleOptions(!watchedVehicleId)
  }, [watchedVehicleId])

  useEffect(() => {
    if (!open) return

    if (workOrderId && workOrder) {
      form.setFieldsValue({
        CUSTOMER_ID: workOrder.CUSTOMER_ID,
        VEHICLE_ID: workOrder.VEHICLE_ID,
        STATUS_ID: workOrder.STATUS_ID,
        PROMISED_AT: workOrder.PROMISED_AT
          ? dayjs(workOrder.PROMISED_AT)
          : undefined,
        SYMPTOM: workOrder.SYMPTOM,
        DIAGNOSIS: workOrder.DIAGNOSIS,
        WORK_PERFORMED: workOrder.WORK_PERFORMED,
        INTERNAL_NOTES: workOrder.INTERNAL_NOTES,
        CUSTOMER_OBSERVATIONS: workOrder.CUSTOMER_OBSERVATIONS,
        REQUIRES_DISASSEMBLY: Boolean(workOrder.REQUIRES_DISASSEMBLY),
        STATUS_CHANGE_NOTES: '',
        SERVICE_LINES: (workOrder.SERVICE_LINES || []).map((item) => ({
          SERVICE_TYPE: item.SERVICE_TYPE || 'SERVICIO',
          DESCRIPTION: item.DESCRIPTION,
          QUANTITY: item.QUANTITY,
          REFERENCE_AMOUNT: item.REFERENCE_AMOUNT,
          NOTES: item.NOTES || '',
        })),
        CONSUMED_ITEMS: (workOrder.CONSUMED_ITEMS || []).map((item) => ({
          ARTICLE_ID: item.ARTICLE_ID,
          QUANTITY: item.QUANTITY,
          UNIT_COST_REFERENCE: item.UNIT_COST_REFERENCE ?? null,
          NOTES: item.NOTES || '',
        })),
        TECHNICIANS: (workOrder.TECHNICIANS || []).map((item) => ({
          STAFF_ID: item.STAFF_ID,
          ROLE_ON_JOB: item.ROLE_ON_JOB || '',
          IS_LEAD: Boolean(item.IS_LEAD),
          REFERENCE_PERCENT: item.REFERENCE_PERCENT ?? null,
          REFERENCE_AMOUNT: item.REFERENCE_AMOUNT ?? null,
          NOTES: item.NOTES || '',
        })),
      })
      return
    }

    if (!workOrderId) {
      form.resetFields()
      form.setFieldsValue({
        STATUS_ID: defaultStatusId,
        REQUIRES_DISASSEMBLY: false,
        SERVICE_LINES: [],
        CONSUMED_ITEMS: [],
        TECHNICIANS: [],
      })
    }
  }, [defaultStatusId, form, open, workOrder, workOrderId])

  const handleCancel = () => {
    form.resetFields()
    setSearchCustomerKey('')
    setSearchVehicleKey('')
    setSearchArticleKey('')
    setSearchTechnicianKey('')
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

      const payload: WorkOrderPayload = {
        CUSTOMER_ID: Number(values.CUSTOMER_ID),
        VEHICLE_ID: Number(values.VEHICLE_ID),
        STATUS_ID: values.STATUS_ID,
        PROMISED_AT: values.PROMISED_AT
          ? values.PROMISED_AT.toISOString()
          : null,
        SYMPTOM: `${values.SYMPTOM || ''}`.trim(),
        DIAGNOSIS: `${values.DIAGNOSIS || ''}`.trim() || null,
        WORK_PERFORMED: `${values.WORK_PERFORMED || ''}`.trim() || null,
        INTERNAL_NOTES: `${values.INTERNAL_NOTES || ''}`.trim() || null,
        CUSTOMER_OBSERVATIONS:
          `${values.CUSTOMER_OBSERVATIONS || ''}`.trim() || null,
        REQUIRES_DISASSEMBLY: Boolean(values.REQUIRES_DISASSEMBLY),
        STATUS_CHANGE_NOTES:
          `${values.STATUS_CHANGE_NOTES || ''}`.trim() || null,
        SERVICE_LINES: (values.SERVICE_LINES || []).map((item) => ({
          SERVICE_TYPE: `${item.SERVICE_TYPE || 'SERVICIO'}`.trim(),
          DESCRIPTION: `${item.DESCRIPTION || ''}`.trim(),
          QUANTITY: Number(item.QUANTITY || 0),
          REFERENCE_AMOUNT: Number(item.REFERENCE_AMOUNT || 0),
          NOTES: `${item.NOTES || ''}`.trim(),
        })),
        CONSUMED_ITEMS: (values.CONSUMED_ITEMS || []).map((item) => ({
          ARTICLE_ID: Number(item.ARTICLE_ID),
          QUANTITY: Number(item.QUANTITY || 0),
          UNIT_COST_REFERENCE:
            item.UNIT_COST_REFERENCE === null ||
            item.UNIT_COST_REFERENCE === undefined
              ? null
              : Number(item.UNIT_COST_REFERENCE),
          NOTES: `${item.NOTES || ''}`.trim(),
        })),
        TECHNICIANS: (values.TECHNICIANS || []).map((item) => ({
          STAFF_ID: Number(item.STAFF_ID),
          ROLE_ON_JOB: `${item.ROLE_ON_JOB || ''}`.trim() || null,
          IS_LEAD: Boolean(item.IS_LEAD),
          REFERENCE_PERCENT:
            item.REFERENCE_PERCENT === null ||
            item.REFERENCE_PERCENT === undefined
              ? null
              : Number(item.REFERENCE_PERCENT),
          REFERENCE_AMOUNT:
            item.REFERENCE_AMOUNT === null ||
            item.REFERENCE_AMOUNT === undefined
              ? null
              : Number(item.REFERENCE_AMOUNT),
          NOTES: `${item.NOTES || ''}`.trim() || null,
        })),
      }

      let description = 'Orden de trabajo registrada exitosamente.'

      if (workOrderId) {
        await updateWorkOrder({
          ...payload,
          WORK_ORDER_ID: workOrderId,
        })
        description = 'Orden de trabajo actualizada exitosamente.'
      } else {
        await createWorkOrder(payload)
      }

      notification({
        message: 'Operación exitosa',
        description,
      })

      onSuccess?.()
      handleCancel()
    } catch (error) {
      errorHandler(error)
    }
  }

  const handleAddSuggestedArticle = (article: Article) => {
    const currentItems = (form.getFieldValue('CONSUMED_ITEMS') || []) as
      | WorkOrderConsumedItem[]
      | undefined

    const nextItems = [...(currentItems || [])]
    const existingIndex = nextItems.findIndex(
      (item) => Number(item.ARTICLE_ID) === Number(article.ARTICLE_ID)
    )

    if (existingIndex >= 0) {
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        QUANTITY: Number(nextItems[existingIndex].QUANTITY || 0) + 1,
        UNIT_COST_REFERENCE:
          nextItems[existingIndex].UNIT_COST_REFERENCE ??
          article.COST_REFERENCE,
      }
    } else {
      nextItems.push({
        ARTICLE_ID: article.ARTICLE_ID,
        QUANTITY: 1,
        UNIT_COST_REFERENCE: article.COST_REFERENCE ?? null,
        NOTES: '',
      })
    }

    form.setFieldValue('CONSUMED_ITEMS', nextItems)
  }

  const handleQuickCustomerSaved = (customer: Customer) => {
    setRecentCustomer(customer)
    setQuickCustomerOpen(false)
    form.setFieldsValue({
      CUSTOMER_ID: customer.PERSON_ID,
      VEHICLE_ID: undefined,
    })
    setSearchCustomerKey('')
    setSearchVehicleKey('')
  }

  const handleQuickVehicleSaved = (vehicle: Vehicle) => {
    setRecentVehicle(vehicle)
    setQuickVehicleOpen(false)
    form.setFieldValue('VEHICLE_ID', vehicle.VEHICLE_ID)
    setSearchVehicleKey('')
  }

  return (
    <>
      <CustomModal
        width={'80%'}
        closable
        title={
          workOrderId ? 'Editar orden de trabajo' : 'Nueva orden de trabajo'
        }
        open={open}
        onCancel={handleClose}
        onOk={handleFinish}
      >
        <div style={{ marginTop: 20 }} />
        <CustomSpin
          spinning={
            isCreatePending ||
            isUpdatePending ||
            isGetCustomersPending ||
            isGetVehiclesPending ||
            isGetArticlesPending ||
            isGetUsersPending ||
            isCompatibleArticlesLoading ||
            Boolean(isStatusListLoading) ||
            Boolean(isServiceTypeListLoading) ||
            isGetOnePending ||
            isGetOneFetching
          }
        >
          <CustomForm form={form} {...formItemLayout}>
            <CustomRow justify={'start'}>
              <CustomDivider>
                <CustomTitle level={5}>Encabezado</CustomTitle>
              </CustomDivider>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Cliente'}
                  name={'CUSTOMER_ID'}
                  rules={[{ required: true }]}
                >
                  <CustomSelect
                    placeholder={'Seleccionar cliente'}
                    onSearch={setSearchCustomerKey}
                    options={customerOptions}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Vehículo'}
                  name={'VEHICLE_ID'}
                  rules={[{ required: true }]}
                >
                  <CustomSelect
                    disabled={!watchedCustomerId}
                    placeholder={'Seleccionar vehículo'}
                    onSearch={setSearchVehicleKey}
                    options={vehicleOptions}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginTop: -8,
                    marginBottom: 8,
                    padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                  }}
                >
                  <CustomText type={'secondary'}>
                    Cree la OT desde esta misma pantalla. Si faltan datos, puede
                    registrar el cliente o el vehículo sin salir del formulario.
                  </CustomText>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <CustomButton
                      type={'link'}
                      onClick={() => setQuickCustomerOpen(true)}
                    >
                      Nuevo cliente rápido
                    </CustomButton>

                    <CustomButton
                      type={'link'}
                      disabled={!watchedCustomerId}
                      onClick={() => setQuickVehicleOpen(true)}
                    >
                      Nuevo vehículo
                    </CustomButton>
                  </div>
                </div>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Estado'} name={'STATUS_ID'}>
                  <CustomSelect
                    placeholder={'Seleccionar estado'}
                    options={statusOptions}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem label={'Fecha promesa'} name={'PROMISED_AT'}>
                  <CustomDatePicker format={'YYYY-MM-DD'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Síntoma'}
                  name={'SYMPTOM'}
                  rules={[{ required: true }]}
                  tooltip={
                    'Descripción de los problemas que presenta el vehículo'
                  }
                  {...labelColFullWidth}
                >
                  <CustomTextArea
                    placeholder={'Descripción del problema reportado'}
                  />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Diagnóstico'}
                  name={'DIAGNOSIS'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Resultado del diagnóstico'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Trabajo realizado'}
                  name={'WORK_PERFORMED'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Trabajo ejecutado'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Observaciones cliente'}
                  name={'CUSTOMER_OBSERVATIONS'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Comentarios del cliente'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomFormItem
                  label={'Notas internas'}
                  name={'INTERNAL_NOTES'}
                  {...labelColFullWidth}
                >
                  <CustomTextArea placeholder={'Notas internas'} />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Requiere desmonte'}
                  name={'REQUIRES_DISASSEMBLY'}
                  valuePropName={'checked'}
                >
                  <CustomCheckbox />
                </CustomFormItem>
              </CustomCol>

              <CustomCol {...defaultBreakpoints}>
                <CustomFormItem
                  label={'Nota cambio estado'}
                  name={'STATUS_CHANGE_NOTES'}
                >
                  <CustomInput placeholder={'Motivo del cambio de estado'} />
                </CustomFormItem>
              </CustomCol>

              <CustomDivider>
                <CustomTitle level={5}>Servicios</CustomTitle>
              </CustomDivider>

              <CustomCol xs={24}>
                <CustomCollapseFormList
                  name={'SERVICE_LINES'}
                  form={form}
                  addText={'Agregar servicio'}
                  addButtonPosition={'bottom'}
                  itemLabel={(index) => `Servicio ${index + 1}`}
                  onAdd={(add) =>
                    add({
                      SERVICE_TYPE: '',
                      DESCRIPTION: '',
                      QUANTITY: 1,
                      REFERENCE_AMOUNT: 0,
                      NOTES: '',
                    })
                  }
                >
                  {(field) => (
                    <ServiceLineCollapseItem
                      field={field}
                      form={form}
                      serviceTypeOptions={serviceTypeOptions}
                      serviceTypeMap={serviceTypeMap}
                    />
                  )}
                </CustomCollapseFormList>
              </CustomCol>

              <CustomCol xs={24}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 12,
                    padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                  }}
                >
                  <CustomText type={'secondary'}>
                    {(watchedServiceLines || []).length} servicio(s)
                    registrados.
                  </CustomText>
                  <CustomTag color={'gold'}>
                    Total servicios: {formatAmount(serviceLinesTotal)}
                  </CustomTag>
                </div>
              </CustomCol>

              <CustomDivider>
                <CustomTitle level={5}>Consumo de artículos</CustomTitle>
              </CustomDivider>

              {watchedVehicleId ? (
                <CustomCol xs={24}>
                  <div
                    style={{
                      padding: 12,
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <CustomRow justify={'space-between'} width={'100%'}>
                      <CustomCol xs={24}>
                        <CustomText strong>
                          Sugerencias automáticas por compatibilidad
                        </CustomText>
                      </CustomCol>

                      <CustomCol xs={24}>
                        <CustomText type={'secondary'}>
                          Se priorizan primero los artículos compatibles con
                          stock disponible.
                        </CustomText>
                      </CustomCol>

                      {!compatibleArticleSuggestions.length ? (
                        <CustomCol xs={24}>
                          <CustomText type={'secondary'}>
                            No hay artículos compatibles sugeridos para este
                            vehículo.
                          </CustomText>
                        </CustomCol>
                      ) : (
                        compatibleArticleSuggestions.map((suggestion) => (
                          <CustomCol
                            xs={24}
                            key={suggestion.article.ARTICLE_ID}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: suggestion.inStock
                                  ? '1px solid rgba(82, 196, 26, 0.35)'
                                  : '1px solid rgba(255, 77, 79, 0.25)',
                                background: suggestion.inStock
                                  ? 'rgba(82, 196, 26, 0.08)'
                                  : 'rgba(255,255,255,0.03)',
                              }}
                            >
                              <div>
                                <CustomText strong>
                                  {suggestion.article.CODE} -{' '}
                                  {suggestion.article.NAME}
                                </CustomText>
                                <br />
                                <CustomText style={{ fontSize: 12 }}>
                                  {buildCompatibilityLabel(suggestion.article)}{' '}
                                  | Stock: {suggestion.currentStock.toFixed(2)}
                                </CustomText>
                                <div style={{ marginTop: 6 }}>
                                  <CustomTag
                                    color={
                                      suggestion.inStock ? 'success' : 'error'
                                    }
                                  >
                                    {suggestion.inStock
                                      ? 'Disponible'
                                      : 'Sin stock'}
                                  </CustomTag>
                                  {suggestion.alreadyAdded ? (
                                    <CustomTag color={'processing'}>
                                      Agregado
                                    </CustomTag>
                                  ) : null}
                                </div>
                              </div>

                              <CustomButton
                                type={
                                  suggestion.inStock ? 'primary' : 'default'
                                }
                                onClick={() =>
                                  handleAddSuggestedArticle(suggestion.article)
                                }
                              >
                                {suggestion.alreadyAdded
                                  ? 'Agregar otro'
                                  : 'Agregar'}
                              </CustomButton>
                            </div>
                          </CustomCol>
                        ))
                      )}
                    </CustomRow>
                  </div>
                </CustomCol>
              ) : null}

              <CustomCol xs={24}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                    padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                  }}
                >
                  <CustomText type={'secondary'}>
                    {watchedVehicleId
                      ? showAllArticleOptions
                        ? 'Mostrando todos los artículos del catálogo.'
                        : `Mostrando solo compatibles con el vehículo actual (${compatibleArticleIdSet.size}).`
                      : 'Seleccione un vehículo para priorizar y filtrar por compatibilidad.'}
                  </CustomText>

                  {watchedVehicleId ? (
                    <CustomButton
                      type={'link'}
                      onClick={() =>
                        setShowAllArticleOptions((current) => !current)
                      }
                    >
                      {showAllArticleOptions
                        ? 'Mostrar solo compatibles'
                        : 'Ver todo el catálogo'}
                    </CustomButton>
                  ) : null}
                </div>
              </CustomCol>

              <CustomCol xs={24}>
                <CustomCollapseFormList
                  name={'CONSUMED_ITEMS'}
                  form={form}
                  addText={'Agregar artículo'}
                  addButtonPosition={'bottom'}
                  itemLabel={(index) => `Artículo ${index + 1}`}
                  onAdd={(add) =>
                    add({
                      QUANTITY: 1,
                      UNIT_COST_REFERENCE: null,
                      NOTES: '',
                    })
                  }
                >
                  {(field) => (
                    <ConsumedItemCollapseItem
                      field={field}
                      form={form}
                      articleOptions={filteredArticleOptions}
                      articleById={articleById}
                      compatibleArticleIdSet={compatibleArticleIdSet}
                      hasVehicleSelected={Boolean(watchedVehicleId)}
                      onSearchArticle={setSearchArticleKey}
                      loading={isGetArticlesPending}
                    />
                  )}
                </CustomCollapseFormList>
              </CustomCol>

              <CustomDivider>
                <CustomTitle level={5}>Técnicos</CustomTitle>
              </CustomDivider>

              <CustomCol xs={24}>
                <CustomCollapseFormList
                  name={'TECHNICIANS'}
                  form={form}
                  addText={'Agregar técnico'}
                  addButtonPosition={'bottom'}
                  itemLabel={(index) => `Técnico ${index + 1}`}
                  onAdd={(add) =>
                    add({
                      ROLE_ON_JOB: '',
                      IS_LEAD: false,
                      REFERENCE_PERCENT: null,
                      REFERENCE_AMOUNT: null,
                      NOTES: '',
                    })
                  }
                >
                  {(field) => (
                    <TechnicianCollapseItem
                      field={field}
                      form={form}
                      technicianOptions={technicianOptions}
                      onSearchTechnician={setSearchTechnicianKey}
                      loading={isGetUsersPending}
                    />
                  )}
                </CustomCollapseFormList>
              </CustomCol>

              {workOrderId && workOrder?.STATUS_HISTORY?.length ? (
                <>
                  <CustomDivider>
                    <CustomTitle level={5}>Historial de estados</CustomTitle>
                  </CustomDivider>

                  <CustomCol xs={24}>
                    <CustomTimeline
                      mode={'left'}
                      items={workOrder.STATUS_HISTORY.map((item) => ({
                        color:
                          statusTimelineColorByCode[item.STATUS_CODE] ||
                          '#1677ff',
                        children: (
                          <CustomText>
                            {item.STATUS_NAME} - {item.CHANGED_BY_NAME} -{' '}
                            {dayjs(item.CHANGED_AT).format('DD/MM/YYYY HH:mm')}
                            {item.NOTES ? ` - ${item.NOTES}` : ''}
                          </CustomText>
                        ),
                      }))}
                    />
                  </CustomCol>
                </>
              ) : null}
            </CustomRow>
          </CustomForm>
        </CustomSpin>
      </CustomModal>
      <CustomerForm
        open={quickCustomerOpen}
        onClose={() => setQuickCustomerOpen(false)}
        onSaved={handleQuickCustomerSaved}
      />
      <VehicleForm
        open={quickVehicleOpen}
        defaultCustomerId={
          watchedCustomerId ? Number(watchedCustomerId) : undefined
        }
        disableCustomerSelection={Boolean(watchedCustomerId)}
        onClose={() => setQuickVehicleOpen(false)}
        onSaved={handleQuickVehicleSaved}
      />
      {contextHolder}
    </>
  )
}

export default WorkOrderForm
