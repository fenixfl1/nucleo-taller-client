import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSpin from 'src/components/custom/CustomSpin'
import { InventoryMovement } from 'src/services/inventory-movements/inventory-movement.types'
import {
  createInventoryMovementPdfObjectUrl,
  downloadInventoryMovementPdf,
  printInventoryMovementPdf,
  revokeInventoryMovementPdfObjectUrl,
} from 'src/utils/inventory-movement-pdf'

interface InventoryMovementPreviewModalProps {
  open?: boolean
  movement?: InventoryMovement
  onClose?: () => void
}

const InventoryMovementPreviewModal: React.FC<
  InventoryMovementPreviewModalProps
> = ({ open, movement, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState<string>()

  useEffect(() => {
    if (!open || !movement) {
      setPreviewUrl((current) => {
        revokeInventoryMovementPdfObjectUrl(current)
        return undefined
      })
      return
    }

    let active = true
    let generatedUrl: string | undefined

    void createInventoryMovementPdfObjectUrl(movement).then((nextUrl) => {
      generatedUrl = nextUrl
      if (!active) {
        revokeInventoryMovementPdfObjectUrl(nextUrl)
        return
      }

      setPreviewUrl((current) => {
        revokeInventoryMovementPdfObjectUrl(current)
        return nextUrl
      })
    })

    return () => {
      active = false
      revokeInventoryMovementPdfObjectUrl(generatedUrl)
    }
  }, [movement, open])

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={'Vista previa del movimiento'}
      width={'75vw'}
      style={{ top: 20 }}
      footer={
        <CustomRow justify={'end'} gap={10}>
          <CustomButton onClick={onClose}>Cerrar</CustomButton>
          <CustomButton
            icon={<PrinterOutlined />}
            disabled={!movement}
            onClick={() =>
              movement ? void printInventoryMovementPdf(movement) : undefined
            }
          >
            Imprimir
          </CustomButton>
          <CustomButton
            type={'primary'}
            icon={<DownloadOutlined />}
            disabled={!movement}
            onClick={() =>
              movement ? void downloadInventoryMovementPdf(movement) : undefined
            }
          >
            Descargar PDF
          </CustomButton>
        </CustomRow>
      }
    >
      <div style={{ minHeight: '75vh' }}>
        <CustomSpin spinning={Boolean(open && movement && !previewUrl)}>
          <ConditionalComponent condition={Boolean(previewUrl)}>
            <iframe
              title={'Vista previa detalle de movimiento'}
              src={previewUrl}
              style={{
                width: '100%',
                height: '75vh',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                background: '#fff',
              }}
            />
          </ConditionalComponent>

          <ConditionalComponent condition={Boolean(open && !movement)}>
            <CustomText>
              No hay movimiento disponible para previsualizar.
            </CustomText>
          </ConditionalComponent>
        </CustomSpin>
      </div>
    </CustomModal>
  )
}

export default InventoryMovementPreviewModal
