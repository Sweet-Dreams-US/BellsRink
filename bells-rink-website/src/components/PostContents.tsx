import React, { useCallback, useEffect, useState } from 'react'
import type { BlogTocItem } from '../lib/blog'
import { activeHeadingId, articleProgress } from '../lib/reading'
import './PostContents.css'

type Props = { toc: BlogTocItem[] }

/**
 * Table of contents for a post, built from its ## headings.
 * Desktop: a small panel pinned to a corner of the screen.
 * Mobile: a bar fixed to the bottom showing the current section and an arrow that opens the full
 * contents. If the site ever gets a bottom call bar, set --call-bar-height so this bar stacks above it.
 */
const PostContents: React.FC<Props> = ({ toc }) => {
  const [activeId, setActiveId] = useState('')
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!toc.length) return
    const ids = toc.map((t) => t.id)
    let frame = 0
    const update = () => {
      frame = 0
      setActiveId(activeHeadingId(ids))
      setProgress(articleProgress())
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [toc])

  // room at the bottom of the page for the mobile bar
  useEffect(() => {
    if (!toc.length) return
    document.body.classList.add('has-post-bar')
    return () => document.body.classList.remove('has-post-bar')
  }, [toc.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const jump = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setOpen(false)
  }, [])

  if (!toc.length) return null

  const percent = Math.round(progress * 100)
  const current = toc.find((t) => t.id === activeId)

  const list = (className: string) => (
    <ol className={className}>
      {toc.map((item) => (
        <li key={item.id} className={item.id === activeId ? 'is-active' : undefined}>
          <a href={`#${item.id}`} aria-current={item.id === activeId ? 'location' : undefined} onClick={(e) => jump(e, item.id)}>
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <>
      <aside className="post-panel" aria-label="Contents">
        <div className="post-panel__head">
          <span className="post-panel__title">In this post</span>
          <span className="post-panel__percent">{percent}% read</span>
        </div>
        <div className="post-panel__progress" role="progressbar" aria-label="Reading progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${percent}%` }} />
        </div>
        {list('post-panel__list')}
      </aside>

      {open && <button type="button" className="post-bar__scrim" aria-label="Close contents" tabIndex={-1} onClick={() => setOpen(false)} />}
      <div className={`post-bar${open ? ' post-bar--open' : ''}`}>
        <div className="post-bar__sheet" id="post-bar-sheet" hidden={!open}>
          {list('post-bar__list')}
        </div>
        <div className="post-bar__progress" role="progressbar" aria-label="Reading progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <button type="button" className="post-bar__toggle" aria-expanded={open} aria-controls="post-bar-sheet" onClick={() => setOpen((o) => !o)}>
          <span className="post-bar__text">
            <span className="post-bar__eyebrow">In this post</span>
            <span className="post-bar__current">{current ? current.text : 'Introduction'}</span>
          </span>
          <svg className="post-bar__arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 12.5L10 7.5L15 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  )
}

export default PostContents
