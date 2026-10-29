import { supabase } from './supabase'

const LOCAL_RESUMES_KEY = 'careeriq_saved_resumes'

function getLocalResumes() {
  try {
    const raw = localStorage.getItem(LOCAL_RESUMES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalResumes(list) {
  try {
    localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(list))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('careeriq:datachange', { detail: { key: LOCAL_RESUMES_KEY, list } }))
    }
  } catch {
    /* noop */
  }
}

export async function listResumes() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && !user.id?.startsWith('local-') && !user.id?.startsWith('demo-')) {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        saveLocalResumes(data)
        return data
      }
    }
  } catch {
    /* fallback to local storage */
  }

  return getLocalResumes()
}

export async function saveResume({ filename, file_url = null }) {
  const newResume = {
    id: 'resume-' + Date.now(),
    filename: filename || 'Resume_Document',
    file_url,
    created_at: new Date().toISOString(),
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && !user.id?.startsWith('local-') && !user.id?.startsWith('demo-')) {
      const { data, error } = await supabase
        .from('resumes')
        .insert({ user_id: user.id, filename, file_url })
        .select()
        .single()

      if (!error && data) {
        const local = getLocalResumes()
        saveLocalResumes([data, ...local.filter((r) => r.id !== data.id)])
        return data
      }
    }
  } catch {
    /* fallback to local */
  }

  const local = getLocalResumes()
  const updated = [newResume, ...local]
  saveLocalResumes(updated)
  return newResume
}

export async function deleteResume(id) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && !user.id?.startsWith('local-') && !user.id?.startsWith('demo-')) {
      await supabase.from('resumes').delete().eq('id', id)
    }
  } catch {
    /* ignore */
  }

  const local = getLocalResumes()
  const updated = local.filter((r) => r.id !== id)
  saveLocalResumes(updated)
  return true
}
