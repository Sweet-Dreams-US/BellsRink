import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Post and index markup is plain HTML (the same markup is pre-rendered for search engines).
 * This turns clicks on its site links into client side navigation, like the rest of the site.
 */
export function useInternalLinks() {
  const navigate = useNavigate()
  return useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const href = anchor.getAttribute('href') || ''
      if (!href.startsWith('/') || href.startsWith('//')) return
      e.preventDefault()
      navigate(href)
      window.scrollTo({ top: 0 })
    },
    [navigate]
  )
}
