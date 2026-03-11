import React, { cloneElement } from 'react'
import { AnyType, TriggersType } from 'src/types/general'
import { CustomModalWarning } from './custom/CustomModalMethods'

type Triggers = {
  [key in keyof TriggersType]: (e: AnyType) => void
}

interface ConditionalComponentProps extends Triggers {
  condition: boolean | undefined
  children: React.ReactNode
  visible?: boolean
  trigger?: keyof TriggersType
  message?: string
  fallback?: React.ReactNode
}

const ConditionalComponent: React.FC<ConditionalComponentProps> = ({
  condition,
  visible = false,
  trigger = 'onClick',
  message = 'No tienes autorización para ejecutar esta acción',
  fallback,
  ...props
}) => {
  const handleTrigger = (e: Event) => {
    e.preventDefault?.()
    if (condition) {
      if (React.isValidElement(props.children)) {
        props?.children?.props?.[trigger]?.(e)
      }
      ;(props as AnyType)?.[trigger]?.(e)
    } else if (visible && message) {
      CustomModalWarning({
        title: 'Aviso',
        content: message,
      })
    }
  }

  if (!condition) {
    if (visible && React.isValidElement(props.children)) {
      return cloneElement(props.children as AnyType, {
        [trigger]: handleTrigger,
      }) as React.ReactElement
    }

    return (fallback ?? null) as React.ReactElement
  }

  if (visible && React.isValidElement(props.children)) {
    return cloneElement(props.children as AnyType, {
      [trigger]: handleTrigger,
    }) as React.ReactElement
  }

  if (Array.isArray(props.children) || !React.isValidElement(props.children)) {
    return <>{props.children}</>
  }

  return props.children as React.ReactElement
}

export default ConditionalComponent
