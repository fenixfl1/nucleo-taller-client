import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSpin from 'src/components/custom/CustomSpin'
import { DeliveryReceipt } from 'src/services/delivery-receipts/delivery-receipt.types'
import { WorkOrder } from 'src/services/work-orders/work-order.types'
import {
  createDeliveryReceiptPdfObjectUrl,
  downloadDeliveryReceiptPdf,
  printDeliveryReceiptPdf,
  revokeDeliveryReceiptPdfObjectUrl,
} from 'src/utils/delivery-receipt-pdf'

interface DeliveryReceiptPreviewModalProps {
  open?: boolean
  receipt?: DeliveryReceipt
  workOrder?: WorkOrder
  onClose?: () => void
}

const DeliveryReceiptPreviewModal: React.FC<
  DeliveryReceiptPreviewModalProps
> = ({ open, receipt, workOrder, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState<string>()

  useEffect(() => {
    if (!open || !receipt) {
      setPreviewUrl((current) => {
        revokeDeliveryReceiptPdfObjectUrl(current)
        return undefined
      })
      return
    }

    let active = true
    let generatedUrl: string | undefined

    void createDeliveryReceiptPdfObjectUrl({ receipt, workOrder }).then(
      (nextUrl) => {
        generatedUrl = nextUrl
        if (!active) {
          revokeDeliveryReceiptPdfObjectUrl(nextUrl)
          return
        }

        setPreviewUrl((current) => {
          revokeDeliveryReceiptPdfObjectUrl(current)
          return nextUrl
        })
      }
    )

    return () => {
      active = false
      revokeDeliveryReceiptPdfObjectUrl(generatedUrl)
    }
  }, [open, receipt, workOrder])

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={'Vista previa del comprobante'}
      width={'88vw'}
      style={{ top: 20 }}
      footer={
        <CustomRow justify={'end'} gap={10}>
          <CustomButton onClick={onClose}>Cerrar</CustomButton>
          <CustomButton
            icon={<PrinterOutlined />}
            disabled={!receipt}
            onClick={() =>
              receipt
                ? void printDeliveryReceiptPdf({ receipt, workOrder })
                : undefined
            }
          >
            Imprimir
          </CustomButton>
          <CustomButton
            type={'primary'}
            icon={<DownloadOutlined />}
            disabled={!receipt}
            onClick={() =>
              receipt
                ? void downloadDeliveryReceiptPdf({ receipt, workOrder })
                : undefined
            }
          >
            Descargar PDF
          </CustomButton>
        </CustomRow>
      }
    >
      <div style={{ minHeight: '75vh' }}>
        <CustomSpin spinning={Boolean(open && receipt && !previewUrl)}>
          <ConditionalComponent condition={Boolean(previewUrl)}>
            <iframe
              title={'Vista previa comprobante interno'}
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

          <ConditionalComponent condition={Boolean(open && !receipt)}>
            <CustomText>
              No hay comprobante disponible para previsualizar.
            </CustomText>
          </ConditionalComponent>
        </CustomSpin>
      </div>
    </CustomModal>
  )
}

export default DeliveryReceiptPreviewModal
