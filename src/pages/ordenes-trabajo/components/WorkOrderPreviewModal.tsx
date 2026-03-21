import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import ConditionalComponent from 'src/components/ConditionalComponent'
import CustomButton from 'src/components/custom/CustomButton'
import CustomModal from 'src/components/custom/CustomModal'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomRow from 'src/components/custom/CustomRow'
import CustomSpin from 'src/components/custom/CustomSpin'
import { WorkOrder } from 'src/services/work-orders/work-order.types'
import {
  createWorkOrderPdfObjectUrl,
  downloadWorkOrderPdf,
  printWorkOrderPdf,
  revokeWorkOrderPdfObjectUrl,
} from 'src/utils/work-order-pdf'

interface WorkOrderPreviewModalProps {
  open?: boolean
  workOrder?: WorkOrder
  onClose?: () => void
}

const WorkOrderPreviewModal: React.FC<WorkOrderPreviewModalProps> = ({
  open,
  workOrder,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>()

  useEffect(() => {
    if (!open || !workOrder) {
      setPreviewUrl((current) => {
        revokeWorkOrderPdfObjectUrl(current)
        return undefined
      })
      return
    }

    let active = true
    let generatedUrl: string | undefined

    void createWorkOrderPdfObjectUrl(workOrder).then((nextUrl) => {
      generatedUrl = nextUrl
      if (!active) {
        revokeWorkOrderPdfObjectUrl(nextUrl)
        return
      }

      setPreviewUrl((current) => {
        revokeWorkOrderPdfObjectUrl(current)
        return nextUrl
      })
    })

    return () => {
      active = false
      revokeWorkOrderPdfObjectUrl(generatedUrl)
    }
  }, [open, workOrder])

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={'Vista previa de la orden de trabajo'}
      width={'88vw'}
      style={{ top: 20 }}
      footer={
        <CustomRow justify={'end'} gap={10}>
          <CustomButton onClick={onClose}>Cerrar</CustomButton>
          <CustomButton
            icon={<PrinterOutlined />}
            disabled={!workOrder}
            onClick={() =>
              workOrder ? void printWorkOrderPdf(workOrder) : undefined
            }
          >
            Imprimir
          </CustomButton>
          <CustomButton
            type={'primary'}
            icon={<DownloadOutlined />}
            disabled={!workOrder}
            onClick={() =>
              workOrder ? void downloadWorkOrderPdf(workOrder) : undefined
            }
          >
            Descargar PDF
          </CustomButton>
        </CustomRow>
      }
    >
      <div style={{ minHeight: '75vh' }}>
        <CustomSpin spinning={Boolean(open && workOrder && !previewUrl)}>
          <ConditionalComponent condition={Boolean(previewUrl)}>
            <iframe
              title={'Vista previa detalle de orden de trabajo'}
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

          <ConditionalComponent condition={Boolean(open && !workOrder)}>
            <CustomText>
              No hay orden de trabajo disponible para previsualizar.
            </CustomText>
          </ConditionalComponent>
        </CustomSpin>
      </div>
    </CustomModal>
  )
}

export default WorkOrderPreviewModal
