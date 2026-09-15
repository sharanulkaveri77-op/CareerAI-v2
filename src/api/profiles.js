import { supabase } from './supabase'

export async function getProfile() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    if (user.id?.startsWith('local-') || user.id?.startsWith('demo-')) {
      return {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'User',
        role: user.user_metadata?.role || 'student',
        usn: user.user_metadata?.usn || '1MS22CS001',
      }
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (error) return null
      return data
    }

    return await Promise.race([
      fetchProfile(),
      new Promise((resolve) => setTimeout(() => resolve(null), 1000)),
    ])
  } catch {
    return null
  }
}

export async function upsertProfile(patch) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    if (user.id?.startsWith('local-') || user.id?.startsWith('demo-')) {
      return { id: user.id, ...patch }
    }

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
  } catch {
    return { ...patch }
  }
}

export async function updateProfile(patch) {
  return upsertProfile(patch)
}

