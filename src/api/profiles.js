import { supabase } from './supabase'

// All access is scoped to the authenticated user via auth.uid(),
// so it complies with the existing RLS policies on `profiles`.

export async function getProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertProfile(patch) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const payload = {
    ...patch,
    id: user.id,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(patch) {
  return upsertProfile(patch)
}
