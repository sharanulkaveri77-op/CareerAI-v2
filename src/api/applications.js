import { supabase } from './supabase'

const LOCAL_KEY = 'careeriq_job_applications'

function getLocalApplications() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalApplications(apps) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(apps))
  } catch {
    /* noop */
  }
}

export async function getApplications() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && !user.id?.startsWith('local-') && !user.id?.startsWith('demo-')) {
      const fetchApps = async () => {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*')
          .order('updated_at', { ascending: false })
        if (error) throw error
        return data || []
      }

      const res = await Promise.race([
        fetchApps(),
        new Promise((resolve) => setTimeout(() => resolve(null), 1000)),
      ])

      if (res) {
        saveLocalApplications(res)
        return res
      }
    }
  } catch {
    /* fall back to local storage */
  }

  return getLocalApplications()
}

export async function addApplication(appData) {
  const newApp = {
    id: 'app-' + Date.now(),
    company: appData.company || 'Unknown Company',
    role: appData.role || 'Software Engineer',
    location: appData.location || 'Remote / Hybrid',
    job_url: appData.job_url || '',
    status: appData.status || 'Applied',
    applied_at: appData.applied_at || new Date().toISOString().split('T')[0],
    deadline: appData.deadline || null,
    notes: appData.notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && !user.id?.startsWith('local-') && !user.id?.startsWith('demo-')) {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          company: newApp.company,
          role: newApp.role,
          location: newApp.location,
          job_url: newApp.job_url,
          status: newApp.status,
          applied_at: newApp.applied_at,
          deadline: newApp.deadline,
          notes: newApp.notes,
        })
        .select()
        .single()

      if (!error && data) {
        const local = getLocalApplications()
        saveLocalApplications([data, ...local.filter((a) => a.id !== data.id)])
        return data
      }
    }
  } catch {
    /* fallback to local save */
  }

  const local = getLocalApplications()
  const updated = [newApp, ...local]
  saveLocalApplications(updated)
  return newApp
}

export async function updateApplication(id, patch) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && !user.id?.startsWith('local-') && !user.id?.startsWith('demo-')) {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        const local = getLocalApplications()
        const updatedLocal = local.map((a) => (a.id === id ? data : a))
        saveLocalApplications(updatedLocal)
        return data
      }
    }
  } catch {
    /* fallback to local update */
  }

  const local = getLocalApplications()
  const updatedLocal = local.map((a) =>
    a.id === id ? { ...a, ...patch, updated_at: new Date().toISOString() } : a
  )
  saveLocalApplications(updatedLocal)
  return updatedLocal.find((a) => a.id === id) || patch
}

export async function deleteApplication(id) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && !user.id?.startsWith('local-') && !user.id?.startsWith('demo-')) {
      await supabase.from('job_applications').delete().eq('id', id)
    }
  } catch {
    /* ignore */
  }

  const local = getLocalApplications()
  const filtered = local.filter((a) => a.id !== id)
  saveLocalApplications(filtered)
  return true
}
