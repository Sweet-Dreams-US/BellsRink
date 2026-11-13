#!/usr/bin/env node
/**
 * Blog build step for Bell's Skating Rink.
 *
 * The site is a static Create React App build, so the blog is gated at BUILD time:
 *
 *   node scripts/build-blog.mjs data    runs BEFORE react-scripts build
 *   node scripts/build-blog.mjs pages   runs AFTER  react-scripts build
 *
 * "data" reads the markdown posts in content/blog (the repo root folder the blog publisher
 * fills, or content/blog inside this app folder), keeps ONLY the posts whose release_on is on
 * or before today in Fort Wayne time (America/Indiana/Indianapolis), renders them to HTML and
 * writes src/generated/blog.json (+ public/blog-images for released posts). A post that is not
 * due yet is never read into the output, so it does not exist anywhere in the deployed files.
 *
 * "pages" writes the pre-rendered static pages (build/blog/index.html and
 * build/blog/<slug>/index.html, real HTML with the head tags, BlogPosting JSON-LD and the
 * article text), build/sitemap.xml and build/blog/rss.xml, again from released posts only.
 *
 * Posts are only ever read from content/blog files. No post text lives in this repo's code.
 * The daily blog routine redeploys this site on any day a post is due, which re-runs this.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Marked } from 'marked'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITE_URL = 'https://www.bellsrink.com'
const SITE_NAME = "Bell's Skating Rink"
const DEFAULT_IMAGE = `${SITE_URL}/images/roofuspartyhat.png`
const TZ = 'America/Indiana/Indianapolis'
const GENERATED = path.join(APP, 'src', 'generated')
const GENERATED_JSON = path.join(GENERATED, 'blog.json')
const PUBLIC_IMAGES = path.join(APP, 'public', 'blog-images')
const BUILD = path.join(APP, 'build')
const STATIC_ROUTES = ['/', '/about', '/events', '/gallery', '/parties', '/policies', '/terms', '/privacy', '/contact']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const warn = (...a) => console.warn('[blog]', ...a)
const log = (...a) => console.log('[blog]', ...a)

// ---------------------------------------------------------------- small helpers

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const stripTags = (html) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")

/** Today in Fort Wayne time as YYYY-MM-DD. */
function fortWayneToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

function dateLabel(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

function unquote(v) {
  const s = v.trim()
  if (s.length >= 2 && s[0] === s[s.length - 1] && (s[0] === '"' || s[0] === "'")) {
    const inner = s.slice(1, -1)
    return s[0] === '"' ? inner.replace(/\\"/g, '"').replace(/\\\\/g, '\\') : inner.replace(/''/g, "'")
  }
  return s
}

function parseFrontMatter(text) {
  const m = text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/)
  if (!m) throw new Error('no front matter')
  const fm = { sources: [] }
  let inSources = false
  let cur = null
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    if (/^\S/.test(line)) {
      inSources = false
      const kv = line.match(/^([A-Za-z_][\w-]*):[ \t]*(.*)$/)
      if (!kv) continue
      if (kv[1] === 'sources') {
        inSources = true
        continue
      }
      fm[kv[1]] = unquote(kv[2])
      continue
    }
    if (!inSources) continue
    const item = line.match(/^\s*-\s+([A-Za-z_][\w-]*):[ \t]*(.*)$/)
    if (item) {
      cur = { [item[1]]: unquote(item[2]) }
      fm.sources.push(cur)
      continue
    }
    const field = line.match(/^\s+([A-Za-z_][\w-]*):[ \t]*(.*)$/)
    if (field && cur) cur[field[1]] = unquote(field[2])
  }
  return { fm, body: m[2] ?? '' }
}

// ---------------------------------------------------------------- markdown

const BLOCKED_HTML = /<\s*\/?\s*(script|style|iframe|object|embed|form|input|button|link|meta|base)\b/i

function isExternal(href) {
  return /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?bellsrink\.com(\/|$)/i.test(href)
}

function safeHref(href) {
  const h = String(href || '').trim()
  if (/^\s*(javascript|data|vbscript):/i.test(h)) return '#'
  return h
}

function makeMarked({ slug, toc, usedIds, images }) {
  return new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      heading(token) {
        const inner = this.parser.parseInline(token.tokens)
        if (token.depth !== 2) return `<h${token.depth}>${inner}</h${token.depth}>\n`
        const base =
          stripTags(inner)
            .toLowerCase()
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'section'
        let id = base
        let n = 2
        while (usedIds.has(id)) id = `${base}-${n++}`
        usedIds.add(id)
        toc.push({ id, text: stripTags(inner).trim() })
        return `<h2 id="${id}">${inner}</h2>\n`
      },
      link(token) {
        const href = safeHref(token.href)
        const inner = this.parser.parseInline(token.tokens)
        const title = token.title ? ` title="${esc(token.title)}"` : ''
        const ext = isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${esc(href)}"${title}${ext}>${inner}</a>`
      },
      image(token) {
        const src = assetUrl(slug, token.href, images)
        const title = token.title ? ` title="${esc(token.title)}"` : ''
        return `<img src="${esc(src)}" alt="${esc(token.text)}"${title} loading="lazy" decoding="async">`
      },
      html(token) {
        const raw = token.text ?? token.raw ?? ''
        if (BLOCKED_HTML.test(raw)) return esc(raw)
        return raw.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/javascript:/gi, '')
      },
    },
  })
}

/** Maps an image reference from a post to its public URL and records the file to copy. */
function assetUrl(slug, ref, images) {
  const r = String(ref || '').trim()
  if (/^(https?:)?\/\//i.test(r) || r.startsWith('data:')) return r
  if (r.startsWith('/')) return r
  const rel = r.replace(/^\.?\//, '')
  const inner = rel.startsWith('images/') ? rel.slice('images/'.length) : `${slug}/${path.basename(rel)}`
  const safe = inner.split('/').filter((p) => p && p !== '..').join('/')
  images.set(safe, rel)
  return `/blog-images/${safe}`
}

function renderCallout(kind, title, inner, md) {
  let html = md.parse(inner.trim())
  const buttons = []
  // The link inside a tip is a BUTTON under the tip text, never an inline link.
  if (kind === 'tip') {
    const anchorRe = /<a\b[^>]*>[\s\S]*?<\/a>/g
    const innerOf = (a) => a.replace(/^<a\b[^>]*>/, '').replace(/<\/a>$/, '')
    html = html.replace(/<p>([\s\S]*?)<\/p>\n?/g, (whole, text) => {
      const found = text.match(anchorRe)
      if (!found) return whole
      buttons.push(...found)
      // a link that ends the paragraph is only the button; a link inside a sentence keeps its words
      let rest = text.replace(/(?:\s*<a\b[^>]*>[\s\S]*?<\/a>)+\s*$/, '')
      rest = rest.replace(anchorRe, (a) => innerOf(a))
      return stripTags(rest).trim() ? `<p>${rest}</p>\n` : ''
    })
    html = html.replace(anchorRe, (a) => {
      buttons.push(a)
      return innerOf(a)
    })
  }
  const actions = buttons.length
    ? `<div class="callout__actions">${buttons
        .map((a) => a.replace(/^<a\b/, () => '<a class="btn-layered btn-layered--primary callout__button"'))
        .join('')}</div>`
    : ''
  const label = kind === 'tip' ? 'Tip' : 'Note'
  return (
    `<aside class="callout callout--${kind}" aria-label="${label}${title ? `: ${esc(title)}` : ''}">` +
    `<p class="callout__label">${label}</p>` +
    (title ? `<p class="callout__title">${esc(title)}</p>` : '') +
    `<div class="callout__body">${html}</div>${actions}</aside>\n`
  )
}

function renderBody(slug, body, images) {
  const toc = []
  const usedIds = new Set()
  const md = makeMarked({ slug, toc, usedIds, images })
  const re = /^:::(tip|note)[ \t]*([^\n]*)\n([\s\S]*?)\n:::[ \t]*$/gm
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(body)) !== null) {
    out += md.parse(body.slice(last, m.index))
    out += renderCallout(m[1], m[2].trim(), m[3], md)
    last = m.index + m[0].length
  }
  out += md.parse(body.slice(last))
  out = out.replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>')
  return { html: out, toc }
}

// ---------------------------------------------------------------- reading the posts

function contentDirs() {
  const dirs = []
  if (process.env.BLOG_CONTENT_DIR) dirs.push(path.resolve(process.env.BLOG_CONTENT_DIR))
  else dirs.push(path.resolve(APP, '..', 'content', 'blog'), path.join(APP, 'content', 'blog'))
  return dirs.filter((d) => fs.existsSync(d) && fs.statSync(d).isDirectory())
}

function loadReleasedPosts(today) {
  const posts = new Map()
  let seen = 0
  let held = 0
  for (const dir of contentDirs()) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
      seen++
      try {
        const { fm, body } = parseFrontMatter(fs.readFileSync(path.join(dir, file), 'utf8'))
        const fileDate = (file.match(/^(\d{4}-\d{2}-\d{2})-/) || [])[1]
        const releaseOn = (fm.release_on || fileDate || '').trim()
        const slug = (fm.slug || file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')).trim()
        if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseOn)) continue // no date yet: never shown
        if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error(`bad slug "${slug}"`)
        if (releaseOn > today) {
          held++
          continue // not due: not read into the output at all
        }
        if (!fm.title) throw new Error('no title')
        const images = new Map()
        const { html, toc } = renderBody(slug, body, images)
        let cover = ''
        if (fm.cover_image) cover = assetUrl(slug, fm.cover_image, images)
        posts.set(slug, {
          slug,
          title: fm.title,
          release_on: releaseOn,
          dateLabel: dateLabel(releaseOn),
          reading_minutes: Number(fm.reading_minutes) || Math.max(1, Math.round(body.split(/\s+/).length / 220)),
          description: fm.description || '',
          cover,
          sources: fm.sources.filter((s) => s.title || s.url),
          toc,
          bodyHtml: html,
          _images: images,
          _dir: dir,
        })
      } catch (e) {
        warn(`skipped ${file}: ${e.message}`)
      }
    }
  }
  const list = [...posts.values()].sort((a, b) => (a.release_on < b.release_on ? 1 : a.release_on > b.release_on ? -1 : a.slug.localeCompare(b.slug)))
  log(`${seen} post file(s) found, ${list.length} released, ${held} not due yet (left out)`)
  return list
}

// ---------------------------------------------------------------- page markup (shared by the SPA and the pre-render)

function postHtml(p) {
  const sources = p.sources.length
    ? `<section class="blog-post__sources" aria-labelledby="sources-title"><h2 id="sources-title" class="blog-post__sources-title">Sources</h2><ol class="blog-post__sources-list">${p.sources
        .map((s) => {
          const t = s.url
            ? `<a href="${esc(safeHref(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.title || s.url)}</a>`
            : esc(s.title)
          return `<li>${t}${s.author ? `, ${esc(s.author)}` : ''}</li>`
        })
        .join('')}</ol></section>`
    : ''
  const cover = p.cover ? `<figure class="blog-post__cover"><img src="${esc(p.cover)}" alt="${esc(p.title)}" decoding="async"></figure>` : ''
  return (
    `<section class="blog-post__hero"><div class="blog-post__frame"><div class="blog-post__hero-content">` +
    `<nav class="breadcrumb" aria-label="Breadcrumb"><ol class="breadcrumb__list">` +
    `<li class="breadcrumb__item"><a class="breadcrumb__link" href="/">Home</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>` +
    `<li class="breadcrumb__item"><a class="breadcrumb__link" href="/blog">Blog</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>` +
    `<li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">${esc(p.title)}</span></li>` +
    `</ol></nav>` +
    `<h1 class="blog-post__title display-heading">${esc(p.title)}</h1>` +
    `<p class="blog-post__meta"><time datetime="${p.release_on}">${esc(p.dateLabel)}</time>` +
    `<span class="blog-post__meta-dot" aria-hidden="true">·</span><span>${p.reading_minutes} min read</span></p>` +
    `</div></div></section>` +
    `<div class="blog-post__frame"><div class="blog-post__layout"><article class="blog-post__article">` +
    cover +
    `<div class="blog-content">${p.bodyHtml}</div>${sources}` +
    `<p class="blog-post__back"><a class="blog-post__back-link" href="/blog">All posts</a></p>` +
    `</article><div class="blog-post__rail" aria-hidden="true"></div></div></div>`
  )
}

function indexHtml(posts) {
  const hero =
    `<section class="blog-index__hero"><div class="container">` +
    `<h1 class="blog-index__title display-heading">Blog</h1>` +
    `<p class="blog-index__subtitle">Skating know-how from ${esc(SITE_NAME)}.</p></div></section>`
  if (!posts.length) {
    return (
      hero +
      `<div class="container"><div class="blog-index__empty"><h2>No posts yet</h2><p>Our first post is on its way. Check back soon.</p></div></div>`
    )
  }
  const cards = posts
    .map((p) => {
      const href = `/blog/${p.slug}`
      const img = p.cover
        ? `<a class="blog-card__image-link" href="${href}" tabindex="-1" aria-hidden="true"><div class="blog-card__image-wrapper"><img class="blog-card__image" src="${esc(p.cover)}" alt="" loading="lazy" decoding="async"></div></a>`
        : ''
      return (
        `<li class="blog-index__item"><article class="blog-card">${img}<div class="blog-card__body">` +
        `<h2 class="blog-card__title"><a href="${href}">${esc(p.title)}</a></h2>` +
        `<p class="blog-card__meta"><time datetime="${p.release_on}">${esc(p.dateLabel)}</time>` +
        `<span class="blog-card__divider" aria-hidden="true">·</span><span>${p.reading_minutes} min read</span></p>` +
        `<p class="blog-card__excerpt">${esc(p.description)}</p>` +
        `<a class="blog-card__more" href="${href}">Read the post</a>` +
        `</div></article></li>`
      )
    })
    .join('')
  return hero + `<div class="container"><ol class="blog-index__list">${cards}</ol></div>`
}

// ---------------------------------------------------------------- phase 1: data

function copyImages(posts) {
  fs.rmSync(PUBLIC_IMAGES, { recursive: true, force: true })
  let n = 0
  for (const p of posts) {
    for (const [target, rel] of p._images) {
      const roots = [p._dir, path.dirname(p._dir)]
      const from = roots.map((r) => path.join(r, rel)).find((f) => fs.existsSync(f))
      if (!from) {
        warn(`image not found for ${p.slug}: ${rel}`)
        continue
      }
      const to = path.join(PUBLIC_IMAGES, target)
      fs.mkdirSync(path.dirname(to), { recursive: true })
      fs.copyFileSync(from, to)
      n++
    }
  }
  if (n) log(`${n} image file(s) copied for released posts`)
}

function phaseData() {
  const today = fortWayneToday()
  const posts = loadReleasedPosts(today)
  fs.mkdirSync(GENERATED, { recursive: true })
  copyImages(posts)
  const out = {
    today,
    siteUrl: SITE_URL,
    indexHtml: indexHtml(posts),
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      release_on: p.release_on,
      dateLabel: p.dateLabel,
      reading_minutes: p.reading_minutes,
      description: p.description,
      cover: p.cover,
      toc: p.toc,
      sources: p.sources,
      html: postHtml(p),
    })),
  }
  fs.writeFileSync(GENERATED_JSON, JSON.stringify(out))
  log(`wrote ${path.relative(APP, GENERATED_JSON)} for ${out.posts.length} post(s), date ${today}`)
}

// ---------------------------------------------------------------- phase 2: pages

function setTag(html, re, tag) {
  return re.test(html) ? html.replace(re, () => tag) : html.replace('</head>', () => `${tag}</head>`)
}

function renderPage(shell, { title, description, canonical, ogType, image, jsonLd, robots, body }) {
  let html = shell
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)}</title>`)
  html = setTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}"/>`)
  html = setTag(html, /<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${ogType}"/>`)
  html = setTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${esc(canonical)}"/>`)
  html = setTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}"/>`)
  html = setTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(description)}"/>`)
  html = setTag(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${esc(image)}"/>`)
  html = setTag(html, /<meta property="twitter:url" content="[^"]*"\s*\/?>/, `<meta property="twitter:url" content="${esc(canonical)}"/>`)
  html = setTag(html, /<meta property="twitter:title" content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${esc(title)}"/>`)
  html = setTag(html, /<meta property="twitter:description" content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${esc(description)}"/>`)
  html = setTag(html, /<meta property="twitter:image" content="[^"]*"\s*\/?>/, `<meta property="twitter:image" content="${esc(image)}"/>`)
  const extra =
    `<link rel="canonical" href="${esc(canonical)}"/>` +
    `<link rel="alternate" type="application/rss+xml" title="${esc(SITE_NAME)} Blog" href="${SITE_URL}/blog/rss.xml"/>` +
    (robots ? `<meta name="robots" content="${robots}"/>` : '') +
    (jsonLd ? `<script type="application/ld+json" id="blog-jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '')
  html = html.replace('</head>', () => `${extra}</head>`)
  if (!/<div id="root"><\/div>/.test(html)) throw new Error('build/index.html has no empty #root')
  return html.replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
}

function rssDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toUTCString()
}

function phasePages() {
  if (!fs.existsSync(GENERATED_JSON)) throw new Error('src/generated/blog.json missing: run the data phase first')
  const data = JSON.parse(fs.readFileSync(GENERATED_JSON, 'utf8'))
  const shellPath = path.join(BUILD, 'index.html')
  if (!fs.existsSync(shellPath)) throw new Error('build/index.html missing: run react-scripts build first')
  const shell = fs.readFileSync(shellPath, 'utf8')
  const posts = data.posts

  // /blog (always a real page; with no released post it says so and asks not to be indexed)
  const indexDesc = `Skating know-how from ${SITE_NAME}.`
  fs.mkdirSync(path.join(BUILD, 'blog'), { recursive: true })
  fs.writeFileSync(
    path.join(BUILD, 'blog', 'index.html'),
    renderPage(shell, {
      title: `Blog | ${SITE_NAME}`,
      description: indexDesc,
      canonical: `${SITE_URL}/blog`,
      ogType: 'website',
      image: DEFAULT_IMAGE,
      robots: posts.length ? '' : 'noindex,follow',
      body: `<div class="App"><main><div class="blog-index">${data.indexHtml}</div></main></div>`,
    })
  )

  for (const p of posts) {
    const url = `${SITE_URL}/blog/${p.slug}`
    const image = p.cover ? (p.cover.startsWith('http') ? p.cover : `${SITE_URL}${p.cover}`) : DEFAULT_IMAGE
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.release_on,
      dateModified: p.release_on,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      image,
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      ...(p.sources.length
        ? { citation: p.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, ...(s.author ? { author: s.author } : {}), ...(s.url ? { url: s.url } : {}) })) }
        : {}),
    }
    const dir = path.join(BUILD, 'blog', p.slug)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      renderPage(shell, {
        title: `${p.title} | ${SITE_NAME}`,
        description: p.description || p.title,
        canonical: url,
        ogType: 'article',
        image,
        jsonLd,
        body: `<div class="App"><main><div class="blog-post-page"><div class="blog-post-html">${p.html}</div></div></main></div>`,
      })
    )
  }

  // sitemap: site pages, plus the blog only when at least one post is released
  const urls = STATIC_ROUTES.map((r) => ({ loc: `${SITE_URL}${r === '/' ? '/' : r}` }))
  if (posts.length) {
    urls.push({ loc: `${SITE_URL}/blog`, lastmod: posts[0].release_on })
    for (const p of posts) urls.push({ loc: `${SITE_URL}/blog/${p.slug}`, lastmod: p.release_on })
  }
  fs.writeFileSync(
    path.join(BUILD, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
      `\n</urlset>\n`
  )

  // RSS feed: released posts only (none, no feed file)
  const feedPath = path.join(BUILD, 'blog', 'rss.xml')
  fs.rmSync(feedPath, { force: true })
  if (posts.length) {
    fs.writeFileSync(
      feedPath,
      `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n` +
        `<title>${esc(SITE_NAME)} Blog</title>\n<link>${SITE_URL}/blog</link>\n<description>${esc(indexDesc)}</description>\n<language>en-us</language>\n` +
        `<atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>\n` +
        posts
          .map(
            (p) =>
              `<item>\n<title>${esc(p.title)}</title>\n<link>${SITE_URL}/blog/${p.slug}</link>\n<guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>\n` +
              `<pubDate>${rssDate(p.release_on)}</pubDate>\n<description>${esc(p.description)}</description>\n</item>`
          )
          .join('\n') +
        `\n</channel>\n</rss>\n`
    )
  }
  log(`pre-rendered /blog and ${posts.length} post page(s), sitemap.xml${posts.length ? ', blog/rss.xml' : ''}`)
}

// ---------------------------------------------------------------- main

const phase = process.argv[2]
if (phase === 'data') phaseData()
else if (phase === 'pages') phasePages()
else {
  console.error('usage: node scripts/build-blog.mjs data|pages')
  process.exit(2)
}
