import { supabase } from './supabase'

// All access is scoped to the authenticated user via auth.uid(),
// so it complies with the existing RLS policies on `resumes`.

export async function listResumes() {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function saveResume({ filename, file_url = null }) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('resumes')
    .insert({ user_id: user.id, filename, file_url })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteResume(id) {
  const { error } = await supabase.from('resumes').delete().eq('id', id)
  if (error) throw error
}
