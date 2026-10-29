import { supabase } from './supabase'

const LOCAL_PROFILE_KEY = 'careeriq_user_profile'

function getLocalProfile() {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveLocalProfile(data) {
  try {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(data))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('careeriq:datachange', { detail: { key: LOCAL_PROFILE_KEY, data } }))
    }
  } catch {
    /* noop */
  }
}

export async function getProfile() {
  const local = getLocalProfile()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return local

    if (user.id?.startsWith('local-') || user.id?.startsWith('demo-')) {
      const fallback = local || {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'User',
        role: user.user_metadata?.role || 'student',
        usn: user.user_metadata?.usn || '1MS22CS001',
      }
      return fallback
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

    const remote = await Promise.race([
      fetchProfile(),
      new Promise((resolve) => setTimeout(() => resolve(null), 1000)),
    ])
    if (remote) {
      saveLocalProfile(remote)
      return remote
    }
    return local
  } catch {
    return local
  }
}

export async function upsertProfile(patch) {
  const current = getLocalProfile() || {}
  const merged = { ...current, ...patch, updated_at: new Date().toISOString() }
  saveLocalProfile(merged)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id?.startsWith('local-') || user.id?.startsWith('demo-')) {
      return { id: user?.id || 'local-user', ...merged }
    }

    const payload = {
      ...merged,
      id: user.id,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single()

    if (error) throw error
    if (data) {
      saveLocalProfile(data)
      return data
    }
  } catch {
    /* fallback to local profile */
  }
  return merged
}

export async function updateProfile(patch) {
  return upsertProfile(patch)
}
