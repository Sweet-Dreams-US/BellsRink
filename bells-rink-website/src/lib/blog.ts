// The blog is gated at build time by scripts/build-blog.mjs, which reads the markdown posts in
// content/blog and writes src/generated/blog.json with ONLY the posts that are due (Fort Wayne
// time). Nothing here holds post text: posts come only from content/blog files.
import data from '../generated/blog.json'

export type BlogSource = { title?: string; author?: string; url?: string }
export type BlogTocItem = { id: string; text: string }
export type BlogPostData = {
  slug: string
  title: string
  release_on: string
  dateLabel: string
  reading_minutes: number
  description: string
  cover: string
  toc: BlogTocItem[]
  sources: BlogSource[]
  html: string
}
type BlogData = { today: string; siteUrl: string; indexHtml: string; posts: BlogPostData[] }

const blog = data as unknown as BlogData

export const SITE_URL = blog.siteUrl
export const SITE_NAME = "Bell's Skating Rink"
export const blogPosts: BlogPostData[] = blog.posts
export const blogIndexHtml: string = blog.indexHtml
/** The Blog link in the navigation shows only once at least one post is released. */
export const hasBlogPosts = blogPosts.length > 0

export function getBlogPost(slug?: string): BlogPostData | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
