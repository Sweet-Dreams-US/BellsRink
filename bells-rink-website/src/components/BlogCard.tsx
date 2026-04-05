import React from 'react'
import { Link } from 'react-router-dom'
import { BlogPostWithCategory, getBlogImageUrl } from '../lib/blog'
import './BlogCard.css'

interface BlogCardProps {
  post: BlogPostWithCategory
  featured?: boolean
}

const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const imageUrl = post.featured_image ? getBlogImageUrl(post.featured_image) : null

  return (
    <article className={`blog-card ${featured ? 'blog-card--featured' : ''}`}>
      {imageUrl && (
        <Link to={`/blog/${post.slug}`} className="blog-card__image-link">
          <div className="blog-card__image-wrapper">
            <img
              src={imageUrl}
              alt={post.title}
              className="blog-card__image"
              loading="lazy"
            />
          </div>
        </Link>
      )}
      <div className="blog-card__body">
        {post.blog_categories && (
          <Link
            to={`/blog?category=${post.blog_categories.slug}`}
            className="blog-card__category"
          >
            {post.blog_categories.name}
          </Link>
        )}
        <h3 className="blog-card__title">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="blog-card__excerpt">{post.excerpt}</p>
        <div className="blog-card__meta">
          <span className="blog-card__author">{post.author_name}</span>
          <span className="blog-card__divider">·</span>
          <time className="blog-card__date" dateTime={post.published_at ?? ''}>
            {formattedDate}
          </time>
          <span className="blog-card__divider">·</span>
          <span className="blog-card__readtime">{post.read_time} min read</span>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
