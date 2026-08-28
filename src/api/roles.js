import { supabase } from './supabase'
import { invokeAi } from './ai'

// Role discovery is AI-generated; saved roles live in the user-scoped
// `saved_roles` table (RLS via auth.uid()). Rows are mapped back to the
// `_id` shape the UI expects.

export async function searchRoles(q) {
  try {
    return await invokeAi('roles-search', { q })
  } catch {
    const query = (q || '').toLowerCase()
    const allRoles = [
      {
        _id: 'role-1',
        title: 'Full Stack Software Engineer',
        summary: 'Design and build end-to-end web applications using React, Node.js, and cloud infrastructure.',
        demand: 'Very High',
        salary: '$110,000 - $155,000',
      },
      {
        _id: 'role-2',
        title: 'AI / Machine Learning Engineer',
        summary: 'Develop, train, and deploy LLM applications, neural networks, and automated data pipelines.',
        demand: 'Very High',
        salary: '$130,000 - $185,000',
      },
      {
        _id: 'role-3',
        title: 'Frontend Engineer',
        summary: 'Craft high-performance, responsive UI components and interactive web applications.',
        demand: 'High',
        salary: '$95,000 - $140,000',
      },
      {
        _id: 'role-4',
        title: 'Cloud & DevOps Engineer',
        summary: 'Manage CI/CD pipelines, Kubernetes clusters, Docker containers, and multi-cloud architectures.',
        demand: 'High',
        salary: '$115,000 - $160,000',
      },
      {
        _id: 'role-5',
        title: 'Data Analyst / Scientist',
        summary: 'Extract insights from complex datasets using Python, SQL, Tableau, and statistical models.',
        demand: 'Medium-High',
        salary: '$90,000 - $135,000',
      },
    ]
    const filtered = allRoles.filter(
      (r) => r.title.toLowerCase().includes(query) || r.summary.toLowerCase().includes(query)
    )
    return { data: { roles: filtered.length ? filtered : allRoles } }
  }
}

const LOCAL_ROLES_KEY = 'careeriq_saved_roles'

function getLocalRoles() {
  try {
    const raw = localStorage.getItem(LOCAL_ROLES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalRoles(list) {
  try {
    localStorage.setItem(LOCAL_ROLES_KEY, JSON.stringify(list))
  } catch {
    /* noop */
  }
}

export async function getSavedRoles() {
  try {
    const { data, error } = await supabase
      .from('saved_roles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    const roles = (data || []).map((r) => ({
      _id: r.id,
      title: r.title,
      summary: r.summary || '',
      demand: r.demand,
      salary: r.salary,
    }))
    return { data: { roles } }
  } catch {
    return { data: { roles: getLocalRoles() } }
  }
}

export async function saveRole(role) {
  let saved = null
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const payload = {
        user_id: user.id,
        title: role.title,
        summary: role.summary || '',
        demand: role.demand ?? null,
        salary: role.salary ?? null,
      }
      const { data: created, error } = await supabase
        .from('saved_roles')
        .insert(payload)
        .select()
        .single()
      if (!error && created) {
        saved = {
          _id: created.id,
          title: created.title,
          summary: created.summary || '',
          demand: created.demand,
          salary: created.salary,
        }
      }
    }
  } catch {
    /* fallback */
  }

  if (!saved) {
    saved = {
      _id: role._id || 'saved-' + Date.now(),
      title: role.title,
      summary: role.summary || '',
      demand: role.demand,
      salary: role.salary,
    }
    const current = getLocalRoles()
    if (!current.some((r) => r.title === saved.title)) {
      current.push(saved)
      saveLocalRoles(current)
    }
  }

  return { data: { role: saved } }
}

export async function removeSavedRole(id) {
  try {
    await supabase.from('saved_roles').delete().eq('id', id)
  } catch {
    /* noop */
  }
  const current = getLocalRoles().filter((r) => r._id !== id)
  saveLocalRoles(current)
}
