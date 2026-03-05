import { DeleteOutlined, EditOutlined, StopOutlined } from '@ant-design/icons'
import { ListProps } from 'antd'
import React from 'react'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { CustomText } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import { ColumnsMap } from 'src/components/custom/CustomTable'
import CustomTag from 'src/components/custom/CustomTag'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import { DISABLED_COLOR } from 'src/constants/colors'
import { Customer } from 'src/services/customers/customer.types'
import { useCustomerStore } from 'src/store/customer.store'
import formatter from 'src/utils/formatter'

interface CustomerListProps {
  onUpdate?: (customer: Customer) => void
  onEdit?: (customer: Customer) => void
  onChange?: (current: number, size: number) => void
}

const CustomerList: React.FC<CustomerListProps> = ({
  onEdit,
  onUpdate,
  onChange,
}) => {
  const { customerList, metadata } = useCustomerStore()

  const columnsMap: ColumnsMap<Customer> = {
    PERSON_ID: 'Código',
    NAME: 'Nombre',
    LAST_NAME: 'Apellido',
    IDENTITY_DOCUMENT: 'Documento',
    EMAIL: 'Correo',
    PHONE: {
      header: 'Teléfono',
      render: (value: string) => formatter({ value, format: 'phone' }),
    },
    STATE: {
      header: 'Estado',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
    CREATED_AT: 'F.Registro',
  }

  const renderItem: ListProps<Customer>['renderItem'] = (item) => (
    <CustomListItem
      actions={[
        <CustomTooltip title={'Editar'} key={'edit'}>
          <CustomButton
            type={'link'}
            icon={<EditOutlined />}
            disabled={item.STATE === 'I'}
            onClick={() => onEdit?.(item)}
          />
        </CustomTooltip>,
        <CustomTooltip
          key={'state'}
          title={item.STATE === 'A' ? 'Inhabilitar' : 'Habilitar'}
        >
          <CustomButton
            onClick={() => onUpdate?.(item)}
            size={'large'}
            danger={item.STATE === 'A'}
            type={'link'}
            icon={
              item.STATE === 'A' ? (
                <DeleteOutlined />
              ) : (
                <StopOutlined style={{ color: DISABLED_COLOR }} />
              )
            }
          />
        </CustomTooltip>,
      ]}
    >
      <CustomListItemMeta
        title={
          <CustomText disabled={item.STATE === 'I'}>
            {`${item.NAME} ${item.LAST_NAME || ''}`.trim()}
          </CustomText>
        }
        description={
          <CustomSpace
            direction={'horizontal'}
            split={item.IDENTITY_DOCUMENT ? <CustomDivider type={'vertical'} /> : undefined}
          >
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              {formatter({
                value: item.IDENTITY_DOCUMENT,
                format: 'document',
              }) || 'Sin documento'}
            </CustomText>

            <CustomSpace direction={'horizontal'}>
              <CustomTag color={item.STATE === 'A' ? 'success' : 'default'}>
                <CustomText style={{ fontSize: 12 }}>
                  {item.STATE === 'A' ? 'Activo' : 'Inactivo'}
                </CustomText>
              </CustomTag>
            </CustomSpace>
          </CustomSpace>
        }
      />
    </CustomListItem>
  )

  return (
    <CustomList
      columnsMap={columnsMap}
      exportOptions={{ title: 'Lista de clientes', orientation: 'landscape' }}
      dataSource={customerList}
      renderItem={renderItem}
      pagination={{
        current: metadata.currentPage,
        onChange,
        pageSize: metadata.pageSize,
        pageSizeOptions: [5, 10, 15, 20, 25, 50, 75, 100],
        showSizeChanger: true,
        total: Number(metadata.totalRows ?? 0),
      }}
    />
  )
}

export default CustomerList
