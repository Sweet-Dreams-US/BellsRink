import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Photo = {
  id: string
  title: string
  description: string | null
  category: string
  storage_path: string
  url: string
  width: number | null
  height: number | null
  sort_order: number
  is_visible: boolean
  created_at: string
}

/**
 * Fetch all visible photos, optionally filtered by category.
 */
export async function getPhotos(category?: string): Promise<Photo[]> {
  let query = supabase
    .from('photos')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/**
 * Get a public URL for a photo in the "photos" storage bucket.
 */
export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('photos').getPublicUrl(storagePath)
  return data.publicUrl
}

/**
 * Fetch distinct photo categories.
 */
export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('category')
    .eq('is_visible', true)

  if (error) throw error
  const unique = [...new Set((data ?? []).map((r: { category: string }) => r.category))]
  return unique.sort()
}
