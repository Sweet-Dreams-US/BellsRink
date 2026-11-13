/** How far through the article the reader is, from 0 to 1. */
export function articleProgress(): number {
  const el = document.querySelector('.blog-post__article') as HTMLElement | null
  if (!el) return 0
  const doc = document.documentElement
  const vh = window.innerHeight
  if (window.scrollY + vh >= doc.scrollHeight - 2) return 1
  const rect = el.getBoundingClientRect()
  if (rect.height <= 0) return 0
  return Math.min(1, Math.max(0, (vh * 0.35 - rect.top) / rect.height))
}

/** The last section heading the reader has scrolled to, or an empty string above the first one. */
export function activeHeadingId(ids: string[], offset = 140): string {
  let active = ''
  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    if (el.getBoundingClientRect().top <= offset) active = id
    else break
  }
  return active
}
