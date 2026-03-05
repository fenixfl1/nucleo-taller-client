export const normalizePath = (path = ''): string => {
  if (!path) return '/'
  if (path === '/') return '/'
  return path.startsWith('/') ? path.replace(/\/+$/, '') : `/${path}`
}

export const buildActivityPath = (
  activityId: string | undefined,
  path: string
): string => {
  const normalizedPath = normalizePath(path)
  const normalizedActivity = `${activityId || ''}`.trim()

  if (!normalizedActivity) {
    return normalizedPath
  }

  if (normalizedPath === `/${normalizedActivity}`) {
    return normalizedPath
  }

  if (normalizedPath.startsWith(`/${normalizedActivity}/`)) {
    return normalizedPath
  }

  if (normalizedPath === '/') {
    return `/${normalizedActivity}`
  }

  return `/${normalizedActivity}${normalizedPath}`
}

export const getPathWithoutActivity = (pathname = ''): string => {
  const normalizedPath = normalizePath(pathname)
  const segments = normalizedPath.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return normalizedPath
  }

  return `/${segments.slice(1).join('/')}`
}
