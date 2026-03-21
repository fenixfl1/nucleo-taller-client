import React from 'react'
import { Navigate } from 'react-router'
import { buildActivityPath } from 'src/utils/activity-path'

const CatalogosPage: React.FC = () => {
  return (
    <Navigate replace to={buildActivityPath('0-8-1', '/configuracion/servicios')} />
  )
}

export default CatalogosPage
