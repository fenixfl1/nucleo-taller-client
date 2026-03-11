import React from 'react'
import { Navigate } from 'react-router'
import { buildActivityPath } from 'src/utils/activity-path'

const Page: React.FC = () => {
  return (
    <Navigate replace to={buildActivityPath('0-1-2', '/dashboard/reportes')} />
  )
}

export default Page
