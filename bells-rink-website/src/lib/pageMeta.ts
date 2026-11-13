import { useEffect } from 'react'

// Values of the site shell (public/index.html), put back when a blog page is left.
const DEFAULT_TITLE = "Bell's Skating Rink | Family Roller Skating in New Haven, IN"
const DEFAULT_DESCRIPTION =
  "Bell's Skating Rink offers family-friendly roller skating fun in New Haven, Indiana. Birthday parties, public skate sessions, and special events. Call (260) 749-8214!"

type PageMeta = {
  title: string
  description: string
  canonical: string
  jsonLd?: object
}

/**
 * Keeps the document head in step with a blog page during client side navigation. On a direct
 * load the pre-rendered page already carries these tags, so this only repeats them.
 */
export function usePageMeta(meta: PageMeta | null) {
  const title = meta?.title
  const description = meta?.description
  const canonical = meta?.canonical
  const jsonLd = meta?.jsonLd ? JSON.stringify(meta.jsonLd) : ''

  useEffect(() => {
    if (!title || !description || !canonical) return
    document.title = title

    let desc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!desc) {
      desc = document.createElement('meta')
      desc.setAttribute('name', 'description')
      document.head.appendChild(desc)
    }
    desc.setAttribute('content', description)

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', canonical)

    let script = document.getElementById('blog-jsonld') as HTMLScriptElement | null
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.id = 'blog-jsonld'
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = jsonLd
    } else if (script) {
      script.remove()
    }

    return () => {
      document.title = DEFAULT_TITLE
      document.querySelector('meta[name="description"]')?.setAttribute('content', DEFAULT_DESCRIPTION)
      document.querySelector('link[rel="canonical"]')?.remove()
      document.getElementById('blog-jsonld')?.remove()
    }
  }, [title, description, canonical, jsonLd])
}
