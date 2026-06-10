import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

// ── Posts ──────────────────────────────────────────────────────────────────
export async function getPosts({ status } = {}) {
  let query = supabase
    .from('posts')
    .select('id, slug, titulo, excerpt, cover_url, tags, status, published_at, created_at')
    .order('published_at', { ascending: false, nullsFirst: false })

  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function savePost(post) {
  const { data: { user } } = await supabase.auth.getUser()
  const payload = { ...post, author_id: user.id }
  if (post.id) {
    const { data, error } = await supabase.from('posts').update(payload).eq('id', post.id).select().single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase.from('posts').insert(payload).select().single()
    if (error) throw error
    return data
  }
}

export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

// ── Storage ────────────────────────────────────────────────────────────────
export async function uploadImage(file, bucket = 'blog-images') {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
