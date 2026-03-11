import { DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import { DescriptionsProps } from 'antd'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDescriptions from 'src/components/custom/CustomDescription'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomDrawer from 'src/components/custom/CustomDrawer'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomTag from 'src/components/custom/CustomTag'
import { useGetOneInventoryMovementQuery } from 'src/services/inventory-movements/useGetOneInventoryMovementQuery'
import { downloadInventoryMovementPdf } from 'src/utils/inventory-movement-pdf'
import InventoryMovementPreviewModal from './InventoryMovementPreviewModal'

interface InventoryMovementDetailDrawerProps {
  movementId?: number
  open?: boolean
  onClose?: () => void
}

const movementTypeLabels: Record<string, string> = {
  ENTRY: 'Entrada manual',
  EXIT: 'Salida manual',
  ADJUSTMENT_IN: 'Ajuste positivo',
  ADJUSTMENT_OUT: 'Ajuste negativo',
  WORK_ORDER_CONSUMPTION: 'Consumo por orden',
  WORK_ORDER_REVERSAL: 'Reversión por orden',
  INTERNAL_PURCHASE_RECEIPT: 'Recepción de orden interna',
}

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'

const InventoryMovementDetailDrawer: React.FC<
  InventoryMovementDetailDrawerProps
> = ({ movementId, open, onClose }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const {
    data: movement,
    isLoading,
    isFetching,
  } = useGetOneInventoryMovementQuery(movementId, Boolean(open))

  const descriptionItems: DescriptionsProps['items'] = [
    {
      key: 'movement-no',
      label: 'Movimiento',
      children: movement?.MOVEMENT_NO,
    },
    {
      key: 'type',
      label: 'Tipo',
      children: movementTypeLabels[movement?.MOVEMENT_TYPE || ''] || movement?.MOVEMENT_TYPE,
    },
    {
      key: 'date',
      label: 'Fecha',
      children: formatDate(movement?.MOVEMENT_DATE),
    },
    {
      key: 'source',
      label: 'Origen',
      children: movement?.REFERENCE_SOURCE || 'N/A',
    },
    {
      key: 'reference-id',
      label: 'Referencia',
      children: movement?.REFERENCE_ID ?? 'N/A',
    },
    {
      key: 'state',
      label: 'Estado',
      children: (
        <CustomTag color={movement?.STATE === 'A' ? 'success' : 'default'}>
          {movement?.STATE === 'A' ? 'Activo' : 'Inactivo'}
        </CustomTag>
      ),
    },
    {
      key: 'notes',
      label: 'Notas',
      children: movement?.NOTES || 'N/A',
      span: 2,
    },
  ]

  return (
    <CustomDrawer
      open={open}
      onClose={onClose}
      width={'50%'}
      closable={false}
      title={'Detalle del movimiento'}
      extra={
        <CustomSpace direction={'horizontal'} width={'auto'}>
          <CustomButton
            icon={<EyeOutlined />}
            disabled={!movement}
            onClick={() => setPreviewOpen(true)}
          >
            Vista previa
          </CustomButton>
          <CustomButton
            type={'primary'}
            icon={<DownloadOutlined />}
            disabled={!movement}
            onClick={() =>
              movement ? void downloadInventoryMovementPdf(movement) : undefined
            }
          >
            PDF
          </CustomButton>
        </CustomSpace>
      }
    >
      <CustomSpin spinning={isLoading || isFetching}>
        <ConditionalComponent condition={Boolean(movement)}>
          <CustomDescriptions column={2} items={descriptionItems} />

          <CustomDivider />
          <CustomTitle level={5}>Artículos</CustomTitle>

          <CustomList
            dataSource={movement?.DETAILS || []}
            renderItem={(item) => (
              <CustomListItem>
                <CustomListItemMeta
                  title={
                    <CustomText>
                      {item.ARTICLE_CODE} - {item.ARTICLE_NAME}
                    </CustomText>
                  }
                  description={
                    <CustomText style={{ fontSize: 12 }}>
                      Cantidad: {Number(item.QUANTITY || 0).toFixed(2)} | Costo Ref.:
                      {' '}
                      {item.UNIT_COST_REFERENCE === null ||
                      item.UNIT_COST_REFERENCE === undefined
                        ? 'N/A'
                        : Number(item.UNIT_COST_REFERENCE).toFixed(2)}
                      {item.NOTES ? ` | ${item.NOTES}` : ''}
                    </CustomText>
                  }
                />
              </CustomListItem>
            )}
          />
        </ConditionalComponent>
      </CustomSpin>

      <InventoryMovementPreviewModal
        open={previewOpen}
        movement={movement}
        onClose={() => setPreviewOpen(false)}
      />
    </CustomDrawer>
  )
}

export default InventoryMovementDetailDrawer
