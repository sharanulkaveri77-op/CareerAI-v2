import { supabase } from './supabase'

const DEFAULT_TRENDS = [
  { month: 'Jan', Demand: 65, Salary: 70 },
  { month: 'Feb', Demand: 72, Salary: 73 },
  { month: 'Mar', Demand: 80, Salary: 78 },
  { month: 'Apr', Demand: 85, Salary: 82 },
  { month: 'May', Demand: 91, Salary: 88 },
  { month: 'Jun', Demand: 95, Salary: 92 },
]

async function safeCount(table) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    if (error) return 0
    return count || 0
  } catch {
    return 0
  }
}

function getLocalSummary() {
  let skills = []
  let savedRoles = 0
  let onboarding = {}
  let profile = {}

  try {
    const rawSkills = localStorage.getItem('careeriq_skills')
    if (rawSkills) skills = JSON.parse(rawSkills)
  } catch {
    /* noop */
  }

  try {
    const rawRoles = localStorage.getItem('careeriq_saved_roles')
    if (rawRoles) savedRoles = (JSON.parse(rawRoles) || []).length
  } catch {
    /* noop */
  }

  try {
    const rawOnb = localStorage.getItem('careeriq_onboarding')
    if (rawOnb) onboarding = JSON.parse(rawOnb) || {}
  } catch {
    /* noop */
  }

  try {
    const rawProf = localStorage.getItem('careeriq_user_profile')
    if (rawProf) profile = JSON.parse(rawProf) || {}
  } catch {
    /* noop */
  }

  const targetRole = profile.target_role || onboarding.targetRole || 'Full Stack Engineer'
  const currentRole = profile.current_role || onboarding.degree || 'Computer Science Student'
  const fullName = profile.full_name || onboarding.fullName || ''

  const skillGaps = Math.max(
    1,
    skills.filter((s) => ['beginner', 'intermediate'].includes((s.level || '').toLowerCase())).length
  )
  const advanced = skills.filter((s) => ['advanced', 'expert'].includes((s.level || '').toLowerCase())).length

  const careerHealth = Math.min(
    100,
    Math.max(
      65,
      (currentRole ? 20 : 0) +
        (targetRole ? 15 : 0) +
        Math.min(25, (skills.length || 3) * 5) +
        Math.min(20, advanced * 6) +
        Math.min(20, savedRoles * 5) +
        (fullName ? 10 : 0)
    )
  )

  return {
    profileComplete: !!fullName && skills.length > 0,
    currentRole,
    skillGaps,
    savedRoles,
    targetRole,
    careerHealth,
  }
}

export async function getSummary() {
  const fetchSummary = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id?.startsWith('local-') || user.id?.startsWith('demo-')) {
      return getLocalSummary()
    }

    let profile = null
    let skills = []
    try {
      const p = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (!p.error) profile = p.data
      const s = await supabase.from('skills').select('name, level')
      if (!s.error) skills = s.data || []
    } catch {
      /* fall through with defaults */
    }

    const savedRoles = await safeCount('saved_roles')
    const skillGaps = skills.filter((s) =>
      ['beginner', 'intermediate'].includes((s.level || '').toLowerCase())
    ).length
    const advanced = skills.filter((s) =>
      ['advanced', 'expert'].includes((s.level || '').toLowerCase())
    ).length

    const currentRole = profile?.current_role || ''
    const targetRole = profile?.target_role || ''
    const profileComplete = !!currentRole && skills.length > 0

    const careerHealth = Math.min(
      100,
      (currentRole ? 20 : 0) +
        (targetRole ? 15 : 0) +
        Math.min(25, skills.length * 5) +
        Math.min(20, advanced * 5) +
        Math.min(20, savedRoles * 5) +
        (profile?.full_name ? 10 : 0)
    )

    return {
      profileComplete,
      currentRole,
      skillGaps,
      savedRoles,
      targetRole,
      careerHealth,
    }
  }

  // Fast 1s timeout safeguard so remote DB roundtrips don't freeze dashboard load
  try {
    const res = await Promise.race([
      fetchSummary(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000)),
    ])
    return { data: res }
  } catch {
    return {
      data: getLocalSummary(),
    }
  }
}

export async function getTrends() {
  return { data: DEFAULT_TRENDS }
}
