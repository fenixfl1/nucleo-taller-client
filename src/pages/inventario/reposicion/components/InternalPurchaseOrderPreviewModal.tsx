import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomSpin from 'src/components/custom/CustomSpin'
import { InternalPurchaseOrder } from 'src/services/internal-purchase-orders/internal-purchase-order.types'
import {
  createInternalPurchaseOrderPdfObjectUrl,
  downloadInternalPurchaseOrderPdf,
  printInternalPurchaseOrderPdf,
  revokeInternalPurchaseOrderPdfObjectUrl,
} from 'src/utils/internal-purchase-order-pdf'

interface InternalPurchaseOrderPreviewModalProps {
  open?: boolean
  order?: InternalPurchaseOrder
  onClose?: () => void
}

const InternalPurchaseOrderPreviewModal: React.FC<
  InternalPurchaseOrderPreviewModalProps
> = ({ open, order, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState<string>()

  useEffect(() => {
    if (!open || !order) {
      setPreviewUrl((current) => {
        revokeInternalPurchaseOrderPdfObjectUrl(current)
        return undefined
      })
      return
    }

    let active = true
    let generatedUrl: string | undefined

    void createInternalPurchaseOrderPdfObjectUrl(order).then((nextUrl) => {
      generatedUrl = nextUrl
      if (!active) {
        revokeInternalPurchaseOrderPdfObjectUrl(nextUrl)
        return
      }

      setPreviewUrl((current) => {
        revokeInternalPurchaseOrderPdfObjectUrl(current)
        return nextUrl
      })
    })

    return () => {
      active = false
      revokeInternalPurchaseOrderPdfObjectUrl(generatedUrl)
    }
  }, [open, order])

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={'Vista previa orden interna'}
      width={'88vw'}
      style={{ top: 20 }}
      footer={
        <CustomSpace>
          <CustomButton onClick={onClose}>Cerrar</CustomButton>
          <CustomButton
            icon={<PrinterOutlined />}
            disabled={!order}
            onClick={() =>
              order ? void printInternalPurchaseOrderPdf(order) : undefined
            }
          >
            Imprimir
          </CustomButton>
          <CustomButton
            type={'primary'}
            icon={<DownloadOutlined />}
            disabled={!order}
            onClick={() =>
              order ? void downloadInternalPurchaseOrderPdf(order) : undefined
            }
          >
            Descargar PDF
          </CustomButton>
        </CustomSpace>
      }
    >
      <div style={{ minHeight: '75vh' }}>
        <CustomSpin spinning={Boolean(open && order && !previewUrl)}>
          <ConditionalComponent condition={Boolean(previewUrl)}>
            <iframe
              title={'Vista previa orden interna'}
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

          <ConditionalComponent condition={Boolean(open && !order)}>
            <CustomText>No hay orden interna disponible para previsualizar.</CustomText>
          </ConditionalComponent>
        </CustomSpin>
      </div>
    </CustomModal>
  )
}

export default InternalPurchaseOrderPreviewModal
