import { supabase } from './supabase'

// Admin portal reads. Row Level Security restricts these tables to users
// whose `profiles.role` is 'admin' — the client simply queries and lets
// RLS decide what it may see.

function fail(error, fallback) {
  const err = new Error(error?.message || fallback)
  err.userMessage = error?.message || fallback
  return err
}

async function countOf(table, filters = {}) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })
  for (const [col, val] of Object.entries(filters)) {
    query = query.eq(col, val)
  }
  const { count, error } = await query
  if (error) throw fail(error, 'Failed to load')
  return count || 0
}

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '')

export async function getAdminSummary() {
  const [
    students,
    interviews,
    materials,
    quizzes,
    assignments,
  ] = await Promise.all([
    countOf('profiles', { role: 'student' }),
    countOf('interviews'),
    countOf('materials'),
    countOf('quizzes'),
    countOf('assignments'),
  ])
  return { data: { students, interviews, materials, quizzes, assignments } }
}

export async function getStudents() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, usn, current_role, created_at')
    .eq('role', 'student')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw fail(error, 'Failed to load')
  const items = (data || []).map((p) => ({
    name: p.full_name || 'Student',
    subtitle: p.usn
      ? `${p.usn}${p.current_role ? ` · ${p.current_role}` : ''}`
      : p.current_role || '',
    meta: 'Active',
  }))
  return { data: { items } }
}

export async function getInterviews() {
  const { data, error } = await supabase
    .from('interviews')
    .select('id, type, role, scheduled_at, student_name')
    .order('scheduled_at', { ascending: true })
    .limit(50)

  if (error) throw fail(error, 'Failed to load')
  const items = (data || []).map((i) => ({
    name: i.student_name || 'Candidate',
    subtitle: [i.type, i.role].filter(Boolean).join(' · '),
    meta: i.scheduled_at ? fmtDate(i.scheduled_at) : 'Unscheduled',
  }))
  return { data: { items } }
}

export async function getMaterials() {
  const { data, error } = await supabase
    .from('materials')
    .select('id, title, category, type')
    .order('created_at', { ascending: false })

  if (error) throw fail(error, 'Failed to load')
  const items = (data || []).map((m) => ({
    name: m.title,
    subtitle: m.category || '',
    meta: m.type || '',
  }))
  return { data: { items } }
}

export async function getQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, description, created_at')
    .order('created_at', { ascending: false })

  if (error) throw fail(error, 'Failed to load')
  const items = (data || []).map((q) => ({
    name: q.title,
    subtitle: q.description || '',
    meta: fmtDate(q.created_at),
  }))
  return { data: { items } }
}

export async function getAssignments() {
  const { data, error } = await supabase
    .from('assignments')
    .select('id, title, description, due_date')
    .order('due_date', { ascending: true })

  if (error) throw fail(error, 'Failed to load')
  const items = (data || []).map((a) => ({
    name: a.title,
    subtitle: a.description || '',
    meta: a.due_date ? `Due ${fmtDate(a.due_date)}` : 'No due date',
  }))
  return { data: { items } }
}

export async function getPerformance() {
  const { data, error } = await supabase
    .from('performance')
    .select('id, category, score, recorded_at')
    .order('recorded_at', { ascending: false })
    .limit(50)

  if (error) throw fail(error, 'Failed to load')
  const items = (data || []).map((p) => ({
    name: p.category || 'Overall',
    subtitle: p.score != null ? `Avg score ${p.score}` : '',
    meta: fmtDate(p.recorded_at),
  }))
  return { data: { items } }
}
