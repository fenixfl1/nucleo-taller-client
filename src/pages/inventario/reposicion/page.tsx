import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import {
  DownloadOutlined,
  FileExcelOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { App, Form } from 'antd'
import ConditionalComponent from 'src/components/ConditionalComponent'
import SearchBar from 'src/components/SearchBar'
import CustomButton from 'src/components/custom/CustomButton'
import CustomCard from 'src/components/custom/CustomCard'
import CustomCheckbox from 'src/components/custom/CustomCheckbox'
import CustomCol from 'src/components/custom/CustomCol'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSelect from 'src/components/custom/CustomSelect'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomStatistic from 'src/components/custom/CustomStatistic'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import useDebounce from 'src/hooks/use-debounce'
import { getQueryString, postRequest } from 'src/services/api'
import { useCreateInternalPurchaseOrderMutation } from 'src/services/internal-purchase-orders/useCreateInternalPurchaseOrderMutation'
import { InternalPurchaseOrder } from 'src/services/internal-purchase-orders/internal-purchase-order.types'
import { AdvancedCondition } from 'src/types/general'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { InventoryReplenishment } from 'src/services/inventory-replenishment/inventory-replenishment.types'
import { useGetInventoryReplenishmentPaginationMutation } from 'src/services/inventory-replenishment/useGetInventoryReplenishmentPaginationMutation'
import { useGetInventoryReplenishmentSummaryMutation } from 'src/services/inventory-replenishment/useGetInventoryReplenishmentSummaryMutation'
import { useInventoryReplenishmentStore } from 'src/store/inventory-replenishment.store'
import {
  exportInventoryReplenishmentSummaryExcel,
  exportInventoryReplenishmentSummaryPdf,
} from 'src/utils/inventory-replenishment-export'
import { API_PATH_GET_INVENTORY_REPLENISHMENT_PAGINATION } from 'src/constants/routes'
import InventoryMovementForm from '../movimientos/components/InventoryMovementForm'
import InternalPurchaseOrderPreviewModal from './components/InternalPurchaseOrderPreviewModal'
import InventoryReplenishmentList from './components/InventoryReplenishmentList'

const initialFilter = {
  MONTHS: 3,
  FILTER: {
    STATE__IN: ['A'],
    IS_ACTIONABLE__EQ: true,
  },
}

const itemTypeOptions = [
  { label: 'Radiadores', value: 'RADIADOR' },
  { label: 'Repuestos', value: 'REPUESTO' },
  { label: 'Materiales', value: 'MATERIAL' },
  { label: 'Insumos', value: 'INSUMO' },
  { label: 'Otros', value: 'OTRO' },
]

const monthOptions = [
  { label: '1 mes', value: 1 },
  { label: '3 meses', value: 3 },
  { label: '6 meses', value: 6 },
  { label: '12 meses', value: 12 },
]

const formatNumber = (value?: number | null) =>
  Number(value || 0).toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const Page: React.FC = () => {
  const { notification } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [form] = Form.useForm()
  const [modalState, setModalState] = useState(false)
  const [previewState, setPreviewState] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<InventoryReplenishment>()
  const [createdOrder, setCreatedOrder] = useState<InternalPurchaseOrder>()
  const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([])
  const [searchKey, setSearchKey] = useState('')
  const debounce = useDebounce(searchKey)

  const { inventoryReplenishmentList, metadata } =
    useInventoryReplenishmentStore()
  const {
    mutate: getInventoryReplenishmentPagination,
    isPending: isGetPending,
  } = useGetInventoryReplenishmentPaginationMutation()
  const {
    mutate: getInventoryReplenishmentSummary,
    data: summary,
    isPending: isSummaryPending,
  } = useGetInventoryReplenishmentSummaryMutation()
  const {
    mutateAsync: createInternalPurchaseOrder,
    isPending: isCreateOrderPending,
  } = useCreateInternalPurchaseOrderMutation()

  const selectedSuggestions = useMemo(
    () =>
      inventoryReplenishmentList.filter((item) =>
        selectedArticleIds.includes(item.ARTICLE_ID)
      ),
    [inventoryReplenishmentList, selectedArticleIds]
  )

  const movementInitialValues = useMemo(() => {
    if (selectedSuggestion) {
      return {
        MOVEMENT_TYPE: 'ENTRY' as const,
        MOVEMENT_DATE: dayjs(),
        NOTES: `Reposición sugerida para ${selectedSuggestion.CODE} - ${selectedSuggestion.NAME}`,
        DETAILS: [
          {
            ARTICLE_ID: selectedSuggestion.ARTICLE_ID,
            QUANTITY: Number(selectedSuggestion.SUGGESTED_REPLENISHMENT || 1),
            UNIT_COST_REFERENCE: selectedSuggestion.COST_REFERENCE,
            NOTES: `Sugerencia calculada para ventana de ${selectedSuggestion.MONTH_WINDOW} meses`,
          },
        ],
      }
    }

    if (!selectedSuggestions.length) {
      return undefined
    }

    return {
      MOVEMENT_TYPE: 'ENTRY' as const,
      MOVEMENT_DATE: dayjs(),
      NOTES: `Reposición masiva de ${selectedSuggestions.length} artículos sugeridos`,
      DETAILS: selectedSuggestions.map((item) => ({
        ARTICLE_ID: item.ARTICLE_ID,
        QUANTITY: Number(item.SUGGESTED_REPLENISHMENT || 1),
        UNIT_COST_REFERENCE: item.COST_REFERENCE,
        NOTES: `Sugerencia calculada para ventana de ${item.MONTH_WINDOW} meses`,
      })),
    }
  }, [selectedSuggestion, selectedSuggestions])

  const getSearchPayload = useCallback(() => {
    const { FILTER = initialFilter.FILTER, MONTHS = initialFilter.MONTHS } =
      form.getFieldsValue()
    const condition: AdvancedCondition[] = []
    const months = Number(MONTHS || initialFilter.MONTHS)

    if (debounce) {
      condition.push({
        value: debounce,
        field: 'FILTER',
        operator: 'LIKE',
      })
    }

    return {
      months,
      condition: [...condition, ...getConditionFromForm(FILTER)],
    }
  }, [debounce, form])

  const handleSearch = useCallback(
    (
      page = metadata.currentPage,
      size = metadata.pageSize,
      forceRefresh = false
    ) => {
      if (modalState && !forceRefresh) return
      const { months, condition: normalizedCondition } = getSearchPayload()
      setSelectedArticleIds([])

      getInventoryReplenishmentPagination({
        page,
        size,
        months,
        condition: normalizedCondition,
      })
      getInventoryReplenishmentSummary({
        page: 1,
        size: 1,
        months,
        condition: normalizedCondition,
      })
    },
    [debounce, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  const handleToggleSelection = useCallback(
    (record: InventoryReplenishment, checked: boolean) => {
      setSelectedSuggestion(undefined)
      setSelectedArticleIds((current) => {
        if (checked) {
          return current.includes(record.ARTICLE_ID)
            ? current
            : [...current, record.ARTICLE_ID]
        }

        return current.filter((item) => item !== record.ARTICLE_ID)
      })
    },
    []
  )

  const handleExportSummary = useCallback(
    async (format: 'excel' | 'pdf') => {
      try {
        const { months, condition } = getSearchPayload()
        const exportSize = Math.max(Number(metadata.totalRows || 0), 1)
        const { data } = await postRequest<InventoryReplenishment[]>(
          getQueryString(API_PATH_GET_INVENTORY_REPLENISHMENT_PAGINATION, {
            page: 1,
            size: exportSize,
            months,
          }),
          condition
        )

        const rows = data?.data || []
        if (!rows.length) {
          notification.warning({
            message: 'Sin datos',
            description:
              'No hay sugerencias para exportar con los filtros actuales.',
          })
          return
        }

        if (format === 'excel') {
          await exportInventoryReplenishmentSummaryExcel(rows, summary)
        } else {
          await exportInventoryReplenishmentSummaryPdf(rows, summary)
        }
      } catch (error) {
        errorHandler(error)
      }
    },
    [errorHandler, getSearchPayload, metadata.totalRows, notification, summary]
  )

  const handleGenerateInternalOrder = useCallback(async () => {
    if (!selectedSuggestions.length) {
      return
    }

    try {
      const order = await createInternalPurchaseOrder({
        ORDER_DATE: dayjs().toISOString(),
        NOTES: `Orden interna generada desde reposición para ${selectedSuggestions.length} artículos`,
        ITEMS: selectedSuggestions.map((item) => ({
          ARTICLE_ID: item.ARTICLE_ID,
          QUANTITY: Number(item.SUGGESTED_REPLENISHMENT || 1),
          UNIT_COST_REFERENCE: item.COST_REFERENCE,
          NOTES: `Generada desde sugerencia de reposición (${item.MONTH_WINDOW} meses)`,
        })),
      })

      setCreatedOrder(order)
      setPreviewState(true)
      setSelectedArticleIds([])

      notification.success({
        message: 'Orden interna generada',
        description: `Se creó la orden ${order.ORDER_NO}.`,
      })
    } catch (error) {
      errorHandler(error)
    }
  }, [
    createInternalPurchaseOrder,
    errorHandler,
    notification,
    selectedSuggestions,
  ])

  const filterContent = (
    <CustomRow width={'100%'}>
      <CustomFormItem
        label={'Estado'}
        name={['FILTER', 'STATE__IN']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '15rem' }}
          placeholder={'Seleccionar estados'}
          mode={'multiple'}
          options={[
            { label: 'Activos', value: 'A' },
            { label: 'Inactivos', value: 'I' },
          ]}
        />
      </CustomFormItem>

      <CustomFormItem
        label={'Tipo'}
        name={['FILTER', 'ITEM_TYPE__IN']}
        labelCol={{ span: 24 }}
      >
        <CustomSelect
          style={{ minWidth: '15rem' }}
          placeholder={'Seleccionar tipos'}
          mode={'multiple'}
          options={itemTypeOptions}
        />
      </CustomFormItem>

      <CustomFormItem label={'Ventana'} name={'MONTHS'} labelCol={{ span: 24 }}>
        <CustomSelect
          style={{ minWidth: '12rem' }}
          placeholder={'Meses'}
          options={monthOptions}
        />
      </CustomFormItem>

      <CustomCol xs={24} md={12} lg={6}>
        <CustomFormItem
          label={'Solo sugeridos'}
          name={['FILTER', 'IS_ACTIONABLE__EQ']}
          valuePropName={'checked'}
          labelCol={{ span: 24 }}
        >
          <CustomCheckbox />
        </CustomFormItem>
      </CustomCol>

      <CustomCol xs={24} md={12} lg={6}>
        <CustomFormItem
          label={'Solo bajo mínimo'}
          name={['FILTER', 'IS_BELOW_MINIMUM__EQ']}
          valuePropName={'checked'}
          labelCol={{ span: 24 }}
        >
          <CustomCheckbox />
        </CustomFormItem>
      </CustomCol>
    </CustomRow>
  )

  return (
    <>
      <CustomSpin
        spinning={isGetPending || isSummaryPending || isCreateOrderPending}
      >
        <CustomCard style={{ padding: 15 }}>
          <CustomRow
            width={'100%'}
            gutter={[16, 16]}
            style={{ marginBottom: 16 }}
          >
            <CustomCol xs={24} md={8}>
              <CustomCard>
                <CustomStatistic
                  title={'Artículos bajo mínimo'}
                  value={summary.BELOW_MINIMUM_COUNT}
                />
              </CustomCard>
            </CustomCol>

            <CustomCol xs={24} md={8}>
              <CustomCard>
                <CustomStatistic
                  title={'Cantidad total sugerida'}
                  value={summary.TOTAL_SUGGESTED_QUANTITY}
                  precision={2}
                  formatter={(value) => formatNumber(Number(value))}
                />
              </CustomCard>
            </CustomCol>

            <CustomCol xs={24} md={8}>
              <CustomCard>
                <CustomStatistic
                  title={'Valor estimado'}
                  value={summary.ESTIMATED_VALUE}
                  precision={2}
                  formatter={(value) => `RD$ ${formatNumber(Number(value))}`}
                />
              </CustomCard>
            </CustomCol>
          </CustomRow>

          <SearchBar
            form={form}
            createText={
              selectedSuggestions.length
                ? `Entrada masiva (${selectedSuggestions.length})`
                : 'Nueva entrada'
            }
            searchPlaceholder={'Buscar sugerencias de reposición...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedSuggestion(undefined)
              setModalState(true)
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch(1, metadata.pageSize)}
          />

          <CustomRow
            justify={'space-between'}
            width={'100%'}
            style={{ marginBottom: 12 }}
          >
            <CustomText>
              Ventana analizada: {summary.MONTH_WINDOW} meses
            </CustomText>
            <CustomRow justify={'end'} gap={8}>
              <CustomText>
                Seleccionados para entrada masiva: {selectedSuggestions.length}
              </CustomText>
              <CustomButton
                icon={<FileExcelOutlined />}
                onClick={() => handleExportSummary('excel')}
                disabled={!metadata.totalRows}
              >
                Exportar Excel
              </CustomButton>
              <CustomButton
                icon={<DownloadOutlined />}
                onClick={() => handleExportSummary('pdf')}
                disabled={!metadata.totalRows}
              >
                Exportar PDF
              </CustomButton>
              <CustomButton
                type={'primary'}
                icon={<ShoppingCartOutlined />}
                disabled={!selectedSuggestions.length}
                onClick={handleGenerateInternalOrder}
              >
                Generar orden interna ({selectedSuggestions.length})
              </CustomButton>
            </CustomRow>
          </CustomRow>

          <InventoryReplenishmentList
            onChange={handleSearch}
            selectedArticleIds={selectedArticleIds}
            onToggleSelection={handleToggleSelection}
            onCreateMovement={(record) => {
              setSelectedArticleIds([])
              setSelectedSuggestion(record)
              setModalState(true)
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <InventoryMovementForm
          open={modalState}
          title={
            selectedSuggestion
              ? 'Registrar entrada desde sugerencia'
              : selectedSuggestions.length
                ? 'Registrar entrada masiva'
                : 'Formulario de movimiento'
          }
          initialValues={movementInitialValues}
          onClose={() => {
            setModalState(false)
            setSelectedSuggestion(undefined)
          }}
          onSuccess={() => {
            setModalState(false)
            setSelectedSuggestion(undefined)
            setSelectedArticleIds([])
            handleSearch(1, metadata.pageSize, true)
          }}
        />
      </ConditionalComponent>

      <ConditionalComponent condition={previewState}>
        <InternalPurchaseOrderPreviewModal
          open={previewState}
          order={createdOrder}
          onClose={() => {
            setPreviewState(false)
            setCreatedOrder(undefined)
          }}
        />
      </ConditionalComponent>
    </>
  )
}

export default Page
