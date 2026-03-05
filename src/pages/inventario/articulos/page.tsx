import React, { useCallback, useEffect, useState } from 'react'
import { App, Form } from 'antd'
import SearchBar from 'src/components/SearchBar'
import useDebounce from 'src/hooks/use-debounce'
import CustomCard from 'src/components/custom/CustomCard'
import ConditionalComponent from 'src/components/ConditionalComponent'
import { AdvancedCondition } from 'src/types/general'
import CustomSpin from 'src/components/custom/CustomSpin'
import CustomRow from 'src/components/custom/CustomRow'
import CustomFormItem from 'src/components/custom/CustomFormItem'
import CustomSelect from 'src/components/custom/CustomSelect'
import { getConditionFromForm } from 'src/utils/get-condition-from-form'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useArticleStore } from 'src/store/article.store'
import { Article } from 'src/services/articles/article.types'
import { useGetArticlePaginationMutation } from 'src/services/articles/useGetArticlePaginationMutation'
import { useUpdateArticleMutation } from 'src/services/articles/useUpdateArticleMutation'
import ArticleList from './components/ArticleList'
import ArticleForm from './components/ArticleForm'

const initialFilter = {
  FILTER: {
    STATE__IN: ['A', 'I'],
  },
}

const itemTypeOptions = [
  { label: 'Radiadores', value: 'RADIADOR' },
  { label: 'Repuestos', value: 'REPUESTO' },
  { label: 'Materiales', value: 'MATERIAL' },
  { label: 'Insumos', value: 'INSUMO' },
  { label: 'Otros', value: 'OTRO' },
]

const ArticlePage: React.FC = () => {
  const [errorHandler] = useErrorHandler()
  const { modal, notification } = App.useApp()
  const [form] = Form.useForm()
  const [selectedArticle, setSelectedArticle] = useState<Article>()
  const [modalState, setModalState] = useState<boolean>()
  const [searchKey, setSearchKey] = useState<string>('')
  const debounce = useDebounce(searchKey)

  const { metadata } = useArticleStore()

  const { mutate: getArticlePagination, isPending: isGetPending } =
    useGetArticlePaginationMutation()
  const { mutateAsync: updateArticle, isPending: isUpdatePending } =
    useUpdateArticleMutation()

  const handleSearch = useCallback(
    (page = metadata.currentPage, size = metadata.pageSize) => {
      if (modalState) return
      const { FILTER = initialFilter.FILTER } = form.getFieldsValue()
      const condition: AdvancedCondition[] = []

      if (debounce) {
        condition.push({
          value: debounce,
          field: 'FILTER',
          operator: 'LIKE',
        })
      }

      const filter = getConditionFromForm(FILTER)
      getArticlePagination({ page, size, condition: [...condition, ...filter] })
    },
    [debounce, modalState]
  )

  useEffect(handleSearch, [handleSearch])

  const toggleModal = () => setModalState((prev) => !prev)

  const handleChangeState = (article: Article) => {
    modal.confirm({
      title: 'Confirmacion',
      content: 'Seguro que desea cambiar el estado del articulo?',
      onOk: async () => {
        try {
          await updateArticle({
            ARTICLE_ID: article.ARTICLE_ID,
            STATE: article.STATE === 'A' ? 'I' : 'A',
          })

          notification.success({
            message: 'Operacion exitosa',
            description: 'El estado del articulo fue actualizado con exito.',
          })

          handleSearch()
        } catch (error) {
          errorHandler(error)
        }
      },
    })
  }

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
    </CustomRow>
  )

  return (
    <>
      <CustomSpin spinning={isGetPending || isUpdatePending}>
        <CustomCard style={{ padding: 15 }}>
          <SearchBar
            form={form}
            createText={'Nuevo Articulo'}
            searchPlaceholder={'Buscar artículos...'}
            onSearch={setSearchKey}
            onCreate={() => {
              setSelectedArticle(undefined)
              toggleModal()
            }}
            filterContent={filterContent}
            initialValue={initialFilter}
            onFilter={() => handleSearch()}
          />

          <ArticleList
            onChange={handleSearch}
            onUpdate={handleChangeState}
            onEdit={(record) => {
              setSelectedArticle(record)
              toggleModal()
            }}
          />
        </CustomCard>
      </CustomSpin>

      <ConditionalComponent condition={modalState}>
        <ArticleForm
          article={selectedArticle}
          open={modalState}
          onClose={toggleModal}
          onSuccess={handleSearch}
        />
      </ConditionalComponent>
    </>
  )
}

export default ArticlePage
