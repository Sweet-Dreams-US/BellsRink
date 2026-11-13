import React from 'react'
import { Link, useParams } from 'react-router-dom'
import PostContents from '../components/PostContents'
import ReadingProgress from '../components/ReadingProgress'
import { getBlogPost, SITE_NAME, SITE_URL } from '../lib/blog'
import { useInternalLinks } from '../lib/internalLinks'
import { usePageMeta } from '../lib/pageMeta'
import '../components/Breadcrumb.css'
import './BlogPost.css'

// The post markup comes from scripts/build-blog.mjs (released posts only), the same markup that is
// pre-rendered into build/blog/<slug>/index.html.
const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const post = getBlogPost(slug)
  const onClick = useInternalLinks()

  usePageMeta(
    post
      ? {
          title: `${post.title} | ${SITE_NAME}`,
          description: post.description || post.title,
          canonical: `${SITE_URL}/blog/${post.slug}`,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.release_on,
            dateModified: post.release_on,
            url: `${SITE_URL}/blog/${post.slug}`,
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
            author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
            publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          },
        }
      : null
  )

  if (!post) {
    return (
      <div className="blog-post-page">
        <div className="blog-post__not-found">
          <h1>Post not found</h1>
          <p>That post is not available.</p>
          <Link to="/blog" className="btn-layered btn-layered--primary">
            Back to the blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-post-page" onClick={onClick}>
      <div className="blog-post-html" dangerouslySetInnerHTML={{ __html: post.html }} />
      <ReadingProgress />
      <PostContents toc={post.toc} />
    </div>
  )
}

export default BlogPost
