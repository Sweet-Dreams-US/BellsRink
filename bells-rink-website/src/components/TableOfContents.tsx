import React, { useState, useEffect, useMemo, useCallback } from 'react'
import './TableOfContents.css'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

function parseHeadings(html: string): TocItem[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h2, h3')
  const items: TocItem[] = []

  headings.forEach((heading) => {
    const text = heading.textContent?.trim() ?? ''
    if (!text) return
    // Create an id from the text
    const id =
      heading.getAttribute('id') ||
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    items.push({
      id,
      text,
      level: heading.tagName === 'H2' ? 2 : 3,
    })
  })

  return items
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const headings = useMemo(() => parseHeadings(content), [content])
  const [activeId, setActiveId] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)

  // Inject IDs into the actual DOM headings (after render)
  useEffect(() => {
    const articleEl = document.querySelector('.blog-content')
    if (!articleEl) return

    const domHeadings = articleEl.querySelectorAll('h2, h3')
    domHeadings.forEach((heading) => {
      const text = heading.textContent?.trim() ?? ''
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      if (!heading.getAttribute('id')) {
        heading.setAttribute('id', id)
      }
    })
  }, [content])

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    // Find the first visible heading
    const visible = entries.filter((e) => e.isIntersecting)
    if (visible.length > 0) {
      setActiveId(visible[0].target.getAttribute('id') ?? '')
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    })

    // Small delay to allow DOM IDs to be injected
    const timer = setTimeout(() => {
      headings.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el) observer.observe(el)
      })
    }, 200)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [headings, handleObserver])

  if (headings.length === 0) return null

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setIsExpanded(false)
  }

  return (
    <nav className={`toc ${isExpanded ? 'toc--expanded' : ''}`} aria-label="Table of Contents">
      <button
        className="toc__toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="toc__toggle-label">Contents</span>
        <svg className="toc__toggle-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="toc__content">
        <h4 className="toc__heading">Contents</h4>
        <ol className="toc__list">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`toc__item toc__item--h${heading.level} ${
                activeId === heading.id ? 'toc__item--active' : ''
              }`}
            >
              <button
                className="toc__link"
                onClick={() => handleClick(heading.id)}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

export default TableOfContents
