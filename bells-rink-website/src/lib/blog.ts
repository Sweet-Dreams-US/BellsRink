import { supabase } from './supabase'

// ── Types ──

export type BlogCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export type BlogTag = {
  id: string
  name: string
  slug: string
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  category_id: string | null
  author_name: string
  author_avatar: string | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  read_time: number
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  updated_at: string
  created_at: string
  // Joined
  blog_categories?: BlogCategory | null
  tags?: BlogTag[]
}

export type BlogPostWithCategory = BlogPost & {
  blog_categories: BlogCategory | null
}

export type AdjacentPosts = {
  previous: Pick<BlogPost, 'title' | 'slug' | 'featured_image'> | null
  next: Pick<BlogPost, 'title' | 'slug' | 'featured_image'> | null
}

// ── Fetchers ──

export async function getBlogPosts(options?: {
  category?: string
  tag?: string
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
}): Promise<{ posts: BlogPostWithCategory[]; count: number }> {
  const {
    category,
    tag,
    search,
    featured,
    limit = 12,
    offset = 0,
  } = options ?? {}

  let query = supabase
    .from('blog_posts')
    .select('*, blog_categories(*)', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (featured !== undefined) {
    query = query.eq('is_featured', featured)
  }

  if (category) {
    // Filter by category slug via a subquery-style approach
    const { data: cat } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (cat) {
      query = query.eq('category_id', cat.id)
    } else {
      return { posts: [], count: 0 }
    }
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
  }

  if (tag) {
    // Get post IDs that have this tag
    const { data: tagRow } = await supabase
      .from('blog_tags')
      .select('id')
      .eq('slug', tag)
      .single()

    if (tagRow) {
      const { data: postTagRows } = await supabase
        .from('blog_post_tags')
        .select('post_id')
        .eq('tag_id', tagRow.id)

      const postIds = (postTagRows ?? []).map((r: { post_id: string }) => r.post_id)
      if (postIds.length === 0) return { posts: [], count: 0 }
      query = query.in('id', postIds)
    } else {
      return { posts: [], count: 0 }
    }
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) throw error

  return {
    posts: (data ?? []) as BlogPostWithCategory[],
    count: count ?? 0,
  }
}

export async function getBlogPost(slug: string): Promise<(BlogPostWithCategory & { tags: BlogTag[] }) | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) return null

  // Fetch tags for this post
  const { data: postTags } = await supabase
    .from('blog_post_tags')
    .select('tag_id')
    .eq('post_id', data.id)

  let tags: BlogTag[] = []
  if (postTags && postTags.length > 0) {
    const tagIds = postTags.map((pt: { tag_id: string }) => pt.tag_id)
    const { data: tagData } = await supabase
      .from('blog_tags')
      .select('*')
      .in('id', tagIds)
    tags = (tagData ?? []) as BlogTag[]
  }

  return { ...data, tags } as BlogPostWithCategory & { tags: BlogTag[] }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as BlogCategory[]
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as BlogTag[]
}

export async function getRelatedPosts(
  postId: string,
  categoryId: string,
  limit = 3
): Promise<BlogPostWithCategory[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(*)')
    .eq('is_published', true)
    .eq('category_id', categoryId)
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as BlogPostWithCategory[]
}

export async function getAdjacentPosts(publishedAt: string): Promise<AdjacentPosts> {
  const [prevResult, nextResult] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('title, slug, featured_image')
      .eq('is_published', true)
      .lt('published_at', publishedAt)
      .order('published_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('blog_posts')
      .select('title, slug, featured_image')
      .eq('is_published', true)
      .gt('published_at', publishedAt)
      .order('published_at', { ascending: true })
      .limit(1)
      .single(),
  ])

  return {
    previous: prevResult.data as AdjacentPosts['previous'],
    next: nextResult.data as AdjacentPosts['next'],
  }
}

/**
 * Get public URL for an image stored in Supabase storage.
 */
export function getBlogImageUrl(path: string): string {
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}
