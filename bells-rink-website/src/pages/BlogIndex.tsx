import React from 'react'
import { blogIndexHtml, SITE_NAME, SITE_URL } from '../lib/blog'
import { useInternalLinks } from '../lib/internalLinks'
import { usePageMeta } from '../lib/pageMeta'
import './BlogIndex.css'

// The list markup comes from scripts/build-blog.mjs (released posts only, newest first), the same
// markup that is pre-rendered into build/blog/index.html.
const BlogIndex: React.FC = () => {
  const onClick = useInternalLinks()
  usePageMeta({
    title: `Blog | ${SITE_NAME}`,
    description: `Skating know-how from ${SITE_NAME}.`,
    canonical: `${SITE_URL}/blog`,
  })
  return <div className="blog-index" onClick={onClick} dangerouslySetInnerHTML={{ __html: blogIndexHtml }} />
}

export default BlogIndex
