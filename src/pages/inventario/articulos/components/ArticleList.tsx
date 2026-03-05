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
import { Article } from 'src/services/articles/article.types'
import { useArticleStore } from 'src/store/article.store'

interface ArticleListProps {
  onUpdate?: (article: Article) => void
  onEdit?: (article: Article) => void
  onChange?: (current: number, size: number) => void
}

const articleTypeLabels: Record<string, string> = {
  RADIADOR: 'Radiador',
  REPUESTO: 'Repuesto',
  MATERIAL: 'Material',
  INSUMO: 'Insumo',
  OTRO: 'Otro',
}

const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '0.00'
  }
  return Number(value).toFixed(2)
}

const ArticleList: React.FC<ArticleListProps> = ({
  onEdit,
  onUpdate,
  onChange,
}) => {
  const { articleList, metadata } = useArticleStore()

  const columnsMap: ColumnsMap<Article> = {
    ARTICLE_ID: 'Codigo',
    CODE: 'Referencia',
    NAME: 'Nombre',
    ITEM_TYPE: {
      header: 'Tipo',
      render: (value) => articleTypeLabels[String(value)] || String(value),
    },
    UNIT_MEASURE: 'Unidad',
    CURRENT_STOCK: {
      header: 'Stock',
      render: (value) => formatNumber(Number(value)),
    },
    MIN_STOCK: {
      header: 'Min',
      render: (value) => formatNumber(Number(value)),
    },
    MAX_STOCK: {
      header: 'Max',
      render: (value) => (value === null ? '-' : formatNumber(Number(value))),
    },
    STATE: {
      header: 'Estado',
      render: (value) => (String(value) === 'A' ? 'Activo' : 'Inactivo'),
    },
  }

  const renderItem: ListProps<Article>['renderItem'] = (item) => (
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
        title={<CustomText disabled={item.STATE === 'I'}>{item.NAME}</CustomText>}
        description={
          <CustomSpace
            direction={'horizontal'}
            split={<CustomDivider type={'vertical'} />}
          >
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              {item.CODE}
            </CustomText>
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              {articleTypeLabels[item.ITEM_TYPE] || item.ITEM_TYPE}
            </CustomText>
            <CustomText style={{ fontSize: 12 }} disabled={item.STATE === 'I'}>
              Stock: {formatNumber(item.CURRENT_STOCK)}
            </CustomText>
            <CustomTag color={item.STATE === 'A' ? 'success' : 'default'}>
              <CustomText style={{ fontSize: 12 }}>
                {item.STATE === 'A' ? 'Activo' : 'Inactivo'}
              </CustomText>
            </CustomTag>
          </CustomSpace>
        }
      />
    </CustomListItem>
  )

  return (
    <CustomList
      columnsMap={columnsMap}
      exportOptions={{ title: 'Catalogo de articulos', orientation: 'landscape' }}
      dataSource={articleList}
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

export default ArticleList
