import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import BlogCard from '../components/BlogCard'
import {
  getBlogPosts,
  getBlogCategories,
  getBlogTags,
  BlogPostWithCategory,
  BlogCategory,
  BlogTag,
} from '../lib/blog'
import './BlogIndex.css'

const POSTS_PER_PAGE = 9

const BlogIndex: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState<BlogPostWithCategory[]>([])
  const [featuredPost, setFeaturedPost] = useState<BlogPostWithCategory | null>(null)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '')

  const currentPage = parseInt(searchParams.get('page') ?? '1', 10)
  const activeCategory = searchParams.get('category') ?? ''
  const activeTag = searchParams.get('tag') ?? ''
  const activeSearch = searchParams.get('search') ?? ''

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  // Set meta
  useEffect(() => {
    document.title = 'Blog | Bell\'s Skating Rink'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Skating tips, rink news, party ideas, and more from Bell\'s Skating Rink.')
    }
  }, [])

  // Fetch categories & tags once
  useEffect(() => {
    getBlogCategories().then(setCategories).catch(console.error)
    getBlogTags().then(setTags).catch(console.error)
  }, [])

  // Fetch featured post once (only on first page with no filters)
  useEffect(() => {
    if (currentPage === 1 && !activeCategory && !activeTag && !activeSearch) {
      getBlogPosts({ featured: true, limit: 1 })
        .then(({ posts: fp }) => setFeaturedPost(fp[0] ?? null))
        .catch(console.error)
    } else {
      setFeaturedPost(null)
    }
  }, [currentPage, activeCategory, activeTag, activeSearch])

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * POSTS_PER_PAGE
      const { posts: data, count } = await getBlogPosts({
        category: activeCategory || undefined,
        tag: activeTag || undefined,
        search: activeSearch || undefined,
        limit: POSTS_PER_PAGE,
        offset,
      })
      setPosts(data)
      setTotalCount(count)
    } catch (err) {
      console.error('Error fetching blog posts:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, activeCategory, activeTag, activeSearch])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 when changing filters
    if (key !== 'page') {
      params.delete('page')
    }
    setSearchParams(params)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setParam('search', searchQuery.trim())
  }

  const handleCategoryClick = (slug: string) => {
    setParam('category', activeCategory === slug ? '' : slug)
  }

  const goToPage = (page: number) => {
    setParam('page', page > 1 ? String(page) : '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Filter out featured post from the grid if it's showing as hero
  const gridPosts = featuredPost
    ? posts.filter((p) => p.id !== featuredPost.id)
    : posts

  return (
    <div className="blog-index">
      {/* Hero */}
      <section className="blog-index__hero">
        <div className="container">
          <h1 className="blog-index__title display-heading">Blog</h1>
          <p className="blog-index__subtitle">
            Skating tips, rink news, party ideas, and everything in between.
          </p>

          {/* Search */}
          <form className="blog-index__search" onSubmit={handleSearch}>
            <div className="blog-index__search-input-wrapper">
              <svg className="blog-index__search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                className="blog-index__search-input"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="blog-index__search-clear"
                  onClick={() => {
                    setSearchQuery('')
                    setParam('search', '')
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <button type="submit" className="btn-layered btn-layered--primary blog-index__search-btn">
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="container">
        {/* Category pills */}
        <div className="blog-index__categories">
          <button
            className={`blog-index__category-pill ${!activeCategory ? 'blog-index__category-pill--active' : ''}`}
            onClick={() => setParam('category', '')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`blog-index__category-pill ${activeCategory === cat.slug ? 'blog-index__category-pill--active' : ''}`}
              onClick={() => handleCategoryClick(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active filters */}
        {(activeSearch || activeTag) && (
          <div className="blog-index__active-filters">
            {activeSearch && (
              <span className="blog-index__filter-tag">
                Search: "{activeSearch}"
                <button onClick={() => { setSearchQuery(''); setParam('search', '') }}>×</button>
              </span>
            )}
            {activeTag && (
              <span className="blog-index__filter-tag">
                Tag: {activeTag}
                <button onClick={() => setParam('tag', '')}>×</button>
              </span>
            )}
          </div>
        )}

        <div className="blog-index__layout">
          {/* Main content */}
          <div className="blog-index__main">
            {loading ? (
              <div className="blog-index__loading">
                <div className="blog-index__spinner" />
                <p>Loading articles...</p>
              </div>
            ) : gridPosts.length === 0 && !featuredPost ? (
              <div className="blog-index__empty">
                <h3>No articles found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                {/* Featured post */}
                {featuredPost && (
                  <div className="blog-index__featured">
                    <BlogCard post={featuredPost} featured />
                  </div>
                )}

                {/* Grid */}
                <div className="blog-index__grid">
                  {gridPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="blog-index__pagination" aria-label="Blog pagination">
                    <button
                      className="blog-index__page-btn"
                      disabled={currentPage <= 1}
                      onClick={() => goToPage(currentPage - 1)}
                    >
                      ← Previous
                    </button>

                    <div className="blog-index__page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          className={`blog-index__page-num ${page === currentPage ? 'blog-index__page-num--active' : ''}`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      className="blog-index__page-btn"
                      disabled={currentPage >= totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                    >
                      Next →
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="blog-index__sidebar">
            {/* Categories */}
            <div className="blog-index__sidebar-card">
              <h4 className="blog-index__sidebar-title">Categories</h4>
              <ul className="blog-index__sidebar-categories">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={`blog-index__sidebar-cat-link ${activeCategory === cat.slug ? 'active' : ''}`}
                      onClick={() => handleCategoryClick(cat.slug)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="blog-index__sidebar-card">
                <h4 className="blog-index__sidebar-title">Tags</h4>
                <div className="blog-index__tag-cloud">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      className={`blog-index__tag ${activeTag === tag.slug ? 'blog-index__tag--active' : ''}`}
                      onClick={() => setParam('tag', activeTag === tag.slug ? '' : tag.slug)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="blog-index__sidebar-card blog-index__sidebar-cta">
              <h4 className="blog-index__sidebar-title">Plan Your Visit</h4>
              <p>Ready to hit the rink? Check out our events or book a party!</p>
              <div className="blog-index__sidebar-cta-buttons">
                <Link to="/contact" className="btn-layered btn-layered--primary">
                  Contact Us
                </Link>
                <Link to="/parties" className="btn-layered btn-layered--accent">
                  Book a Party
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default BlogIndex
