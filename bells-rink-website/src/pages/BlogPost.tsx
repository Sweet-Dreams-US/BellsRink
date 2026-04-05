import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import ReadingProgress from '../components/ReadingProgress'
import TableOfContents from '../components/TableOfContents'
import BlogCard from '../components/BlogCard'
import {
  getBlogPost,
  getRelatedPosts,
  getAdjacentPosts,
  getBlogImageUrl,
  BlogPostWithCategory,
  BlogTag,
  AdjacentPosts,
} from '../lib/blog'
import './BlogPost.css'

type FullPost = BlogPostWithCategory & { tags: BlogTag[] }

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<FullPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPostWithCategory[]>([])
  const [adjacent, setAdjacent] = useState<AdjacentPosts>({ previous: null, next: null })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return

    const fetchData = async () => {
      setLoading(true)
      setNotFound(false)

      const data = await getBlogPost(slug)
      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setPost(data)

      // Fetch related and adjacent in parallel
      const [related, adj] = await Promise.all([
        data.category_id
          ? getRelatedPosts(data.id, data.category_id, 3)
          : Promise.resolve([]),
        data.published_at
          ? getAdjacentPosts(data.published_at)
          : Promise.resolve({ previous: null, next: null }),
      ])

      setRelatedPosts(related)
      setAdjacent(adj)
      setLoading(false)
    }

    fetchData().catch((err) => {
      console.error(err)
      setNotFound(true)
      setLoading(false)
    })

    // Scroll to top on slug change
    window.scrollTo(0, 0)
  }, [slug])

  // Meta tags + JSON-LD
  useEffect(() => {
    if (!post) return

    document.title = post.meta_title || `${post.title} | Bell's Skating Rink`

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    const desc = post.meta_description || post.excerpt
    setMeta('description', desc)
    setMeta('og:title', post.meta_title || post.title, true)
    setMeta('og:description', desc, true)
    setMeta('og:type', 'article', true)
    setMeta('og:url', window.location.href, true)
    if (post.og_image || post.featured_image) {
      setMeta('og:image', getBlogImageUrl(post.og_image || post.featured_image!), true)
    }

    // JSON-LD
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: desc,
      author: {
        '@type': 'Person',
        name: post.author_name,
      },
      datePublished: post.published_at,
      dateModified: post.updated_at,
      image: post.featured_image ? getBlogImageUrl(post.featured_image) : undefined,
      publisher: {
        '@type': 'Organization',
        name: "Bell's Skating Rink",
        url: window.location.origin,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href,
      },
    }

    let scriptEl = document.getElementById('blog-jsonld') as HTMLScriptElement | null
    if (!scriptEl) {
      scriptEl = document.createElement('script')
      scriptEl.id = 'blog-jsonld'
      scriptEl.type = 'application/ld+json'
      document.head.appendChild(scriptEl)
    }
    scriptEl.textContent = JSON.stringify(jsonLd)

    return () => {
      const el = document.getElementById('blog-jsonld')
      if (el) el.remove()
    }
  }, [post])

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="blog-post__loading">
          <div className="blog-post__spinner" />
          <p>Loading article...</p>
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="blog-post-page">
        <div className="blog-post__not-found">
          <h2>Article Not Found</h2>
          <p>The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="btn-layered btn-layered--primary">
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const imageUrl = post.featured_image ? getBlogImageUrl(post.featured_image) : null

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    ...(post.blog_categories
      ? [{ label: post.blog_categories.name, href: `/blog?category=${post.blog_categories.slug}` }]
      : []),
    { label: post.title },
  ]

  return (
    <div className="blog-post-page">
      <ReadingProgress />

      {/* Hero */}
      <section className="blog-post__hero">
        {imageUrl && (
          <div className="blog-post__hero-image-wrapper">
            <img
              src={imageUrl}
              alt={post.title}
              className="blog-post__hero-image"
              loading="lazy"
            />
            <div className="blog-post__hero-overlay" />
          </div>
        )}
        <div className="container blog-post__hero-content">
          <Breadcrumb items={breadcrumbItems} />
          {post.blog_categories && (
            <Link
              to={`/blog?category=${post.blog_categories.slug}`}
              className="blog-post__hero-category"
            >
              {post.blog_categories.name}
            </Link>
          )}
          <h1 className="blog-post__title display-heading">{post.title}</h1>
          <div className="blog-post__meta">
            {post.author_avatar && (
              <img
                src={getBlogImageUrl(post.author_avatar)}
                alt={post.author_name}
                className="blog-post__avatar"
                loading="lazy"
              />
            )}
            <div className="blog-post__meta-text">
              <span className="blog-post__author">{post.author_name}</span>
              <span className="blog-post__meta-details">
                <time dateTime={post.published_at ?? ''}>{formattedDate}</time>
                <span className="blog-post__meta-dot">·</span>
                <span>{post.read_time} min read</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container">
        <div className="blog-post__layout">
          {/* Main content */}
          <article className="blog-post__article">
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="blog-post__tags">
                <span className="blog-post__tags-label">Tags:</span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/blog?tag=${tag.slug}`}
                    className="blog-post__tag"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="blog-post__sidebar">
            <TableOfContents content={post.content} />
          </aside>
        </div>

        {/* Previous / Next */}
        {(adjacent.previous || adjacent.next) && (
          <nav className="blog-post__adjacent" aria-label="Adjacent posts">
            {adjacent.previous ? (
              <Link to={`/blog/${adjacent.previous.slug}`} className="blog-post__adj-link blog-post__adj-link--prev">
                <span className="blog-post__adj-direction">← Previous</span>
                <span className="blog-post__adj-title">{adjacent.previous.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {adjacent.next ? (
              <Link to={`/blog/${adjacent.next.slug}`} className="blog-post__adj-link blog-post__adj-link--next">
                <span className="blog-post__adj-direction">Next →</span>
                <span className="blog-post__adj-title">{adjacent.next.title}</span>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        )}

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="blog-post__related">
            <h2 className="blog-post__related-title">Related Articles</h2>
            <div className="blog-post__related-grid">
              {relatedPosts.map((rp) => (
                <BlogCard key={rp.id} post={rp} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default BlogPost
