import { supabase } from './supabase'

// Storage Keys for Local State Persistence
const KEYS = {
  STUDENTS: 'careeriq_admin_students',
  INTERVIEWS: 'careeriq_admin_interviews',
  MATERIALS: 'careeriq_admin_materials',
  QUIZZES: 'careeriq_admin_quizzes',
  ASSIGNMENTS: 'careeriq_admin_assignments',
}

// Initial Mock Datasets
const MOCK_STUDENTS = [
  {
    id: 's-101',
    full_name: 'Aarav Sharma',
    usn: '1MS22CS001',
    email: 'aarav.sharma@example.com',
    current_role: 'Full Stack Engineer',
    readiness_score: 88,
    status: 'Active',
    resume_score: 92,
    dsa_solved: 145,
    mock_interviews_completed: 6,
    joined_date: '2024-01-15',
  },
  {
    id: 's-102',
    full_name: 'Ananya Roy',
    usn: '1MS22CS042',
    email: 'ananya.roy@example.com',
    current_role: 'Frontend Developer',
    readiness_score: 76,
    status: 'Active',
    resume_score: 84,
    dsa_solved: 98,
    mock_interviews_completed: 4,
    joined_date: '2024-02-01',
  },
  {
    id: 's-103',
    full_name: 'Rohan Gupta',
    usn: '1MS22CS089',
    email: 'rohan.gupta@example.com',
    current_role: 'Backend Architect',
    readiness_score: 94,
    status: 'Placed',
    resume_score: 95,
    dsa_solved: 210,
    mock_interviews_completed: 9,
    joined_date: '2023-11-10',
  },
  {
    id: 's-104',
    full_name: 'Priya Nair',
    usn: '1MS22IS012',
    email: 'priya.nair@example.com',
    current_role: 'Data Engineer',
    readiness_score: 65,
    status: 'In Training',
    resume_score: 70,
    dsa_solved: 62,
    mock_interviews_completed: 2,
    joined_date: '2024-03-05',
  },
  {
    id: 's-105',
    full_name: 'Vikram Mehta',
    usn: '1MS22CS150',
    email: 'vikram.mehta@example.com',
    current_role: 'DevOps & Cloud Engineer',
    readiness_score: 82,
    status: 'Active',
    resume_score: 88,
    dsa_solved: 112,
    mock_interviews_completed: 5,
    joined_date: '2024-01-20',
  },
]

const MOCK_INTERVIEWS = [
  {
    id: 'int-1',
    student_name: 'Aarav Sharma',
    usn: '1MS22CS001',
    type: 'AI Mock',
    role: 'Full Stack Engineer',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    status: 'Scheduled',
    interviewer: 'AI Copilot Engine',
    score: null,
  },
  {
    id: 'int-2',
    student_name: 'Ananya Roy',
    usn: '1MS22CS042',
    type: 'Expert Review',
    role: 'Frontend Developer',
    scheduled_at: new Date(Date.now() + 172800000).toISOString(),
    status: 'Scheduled',
    interviewer: 'Sr. Eng Lead (Ex-Google)',
    score: null,
  },
  {
    id: 'int-3',
    student_name: 'Rohan Gupta',
    usn: '1MS22CS089',
    type: 'Peer Mock',
    role: 'Backend Architect',
    scheduled_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'Completed',
    interviewer: 'Priya Nair',
    score: 92,
  },
  {
    id: 'int-4',
    student_name: 'Vikram Mehta',
    usn: '1MS22CS150',
    type: 'AI Mock',
    role: 'DevOps & Cloud Engineer',
    scheduled_at: new Date(Date.now() - 172800000).toISOString(),
    status: 'Feedback Pending',
    interviewer: 'AI Copilot Engine',
    score: 80,
  },
]

const MOCK_MATERIALS = [
  {
    id: 'mat-1',
    title: 'Mastering Dynamic Programming: Patterns & Sheet',
    category: 'DSA',
    type: 'PDF',
    url: 'https://example.com/dp-guide.pdf',
    author: 'Placement Cell',
    created_at: '2024-03-01',
  },
  {
    id: 'mat-2',
    title: 'Top 50 System Design Interview Questions & Diagrams',
    category: 'System Design',
    type: 'Article',
    url: 'https://example.com/system-design',
    author: 'Tech Mentors',
    created_at: '2024-02-20',
  },
  {
    id: 'mat-3',
    title: 'ATS-Friendly Tech Resume Template & Action Verbs Guide',
    category: 'Resume',
    type: 'PDF',
    url: 'https://example.com/resume-template.pdf',
    author: 'Career Advisory',
    created_at: '2024-01-10',
  },
  {
    id: 'mat-4',
    title: 'Behavioral Interviews: STAR Method Masterclass',
    category: 'HR & Soft Skills',
    type: 'Video',
    url: 'https://example.com/star-method',
    author: 'HR Lead',
    created_at: '2024-02-14',
  },
  {
    id: 'mat-5',
    title: 'Quantitative Aptitude Formula Sheet & Shortcuts',
    category: 'Aptitude',
    type: 'Cheatsheet',
    url: 'https://example.com/aptitude-sheet',
    author: 'Aptitude Trainer',
    created_at: '2024-03-05',
  },
]

const MOCK_QUIZZES = [
  {
    id: 'q-1',
    title: 'Data Structures & Algorithms Benchmark Quiz',
    description: 'Assess arrays, linked lists, trees, and time complexity knowledge.',
    category: 'DSA',
    duration_mins: 30,
    question_count: 20,
    active: true,
    created_at: '2024-02-10',
  },
  {
    id: 'q-2',
    title: 'System Design & Distributed Systems Core Fundamentals',
    description: 'Evaluate knowledge of load balancing, caching, and database sharding.',
    category: 'System Design',
    duration_mins: 45,
    question_count: 25,
    active: true,
    created_at: '2024-02-18',
  },
  {
    id: 'q-3',
    title: 'Aptitude & Analytical Reasoning Screening Test',
    description: 'Speed and accuracy practice for campus recruitment filtering rounds.',
    category: 'Aptitude',
    duration_mins: 20,
    question_count: 15,
    active: true,
    created_at: '2024-03-01',
  },
]

const MOCK_ASSIGNMENTS = [
  {
    id: 'asg-1',
    title: 'Build a High-Throughput URL Shortener (System Design)',
    description: 'Implement key storage schema, rate limiting, and write-up architectural tradeoffs.',
    target_batch: '2025 Batch',
    due_date: new Date(Date.now() + 432000000).toISOString(),
    submitted_count: 34,
    total_students: 45,
    created_at: '2024-03-02',
  },
  {
    id: 'asg-2',
    title: 'LeetCode 75 Blind Practice Submission Week 3',
    description: 'Submit problem solutions for Two Pointers, Sliding Window, and Graph Traversal.',
    target_batch: '2026 Batch',
    due_date: new Date(Date.now() + 259200000).toISOString(),
    submitted_count: 68,
    total_students: 80,
    created_at: '2024-03-04',
  },
]

// Helper functions for local storage persistence
function getStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* noop */
  }
}

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '')

export async function getAdminSummary() {
  let studentsCount = 0
  let interviewsCount = 0
  let materialsCount = 0
  let quizzesCount = 0
  let assignmentsCount = 0

  try {
    const [st, int, mat, qz, asg] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('interviews').select('*', { count: 'exact', head: true }),
      supabase.from('materials').select('*', { count: 'exact', head: true }),
      supabase.from('quizzes').select('*', { count: 'exact', head: true }),
      supabase.from('assignments').select('*', { count: 'exact', head: true }),
    ])
    studentsCount = st.count || 0
    interviewsCount = int.count || 0
    materialsCount = mat.count || 0
    quizzesCount = qz.count || 0
    assignmentsCount = asg.count || 0
  } catch {
    /* fallback to local */
  }

  const localStudents = getStorage(KEYS.STUDENTS, MOCK_STUDENTS)
  const localInterviews = getStorage(KEYS.INTERVIEWS, MOCK_INTERVIEWS)
  const localMaterials = getStorage(KEYS.MATERIALS, MOCK_MATERIALS)
  const localQuizzes = getStorage(KEYS.QUIZZES, MOCK_QUIZZES)
  const localAssignments = getStorage(KEYS.ASSIGNMENTS, MOCK_ASSIGNMENTS)

  return {
    data: {
      students: studentsCount || localStudents.length,
      interviews: interviewsCount || localInterviews.length,
      materials: materialsCount || localMaterials.length,
      quizzes: quizzesCount || localQuizzes.length,
      assignments: assignmentsCount || localAssignments.length,
    },
  }
}

export async function getStudents() {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, usn, current_role, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      const items = data.map((p) => ({
        id: p.id,
        full_name: p.full_name || 'Student',
        usn: p.usn || '1MS22CS001',
        email: `${p.full_name?.toLowerCase().replace(/\s+/g, '.') || 'student'}@example.com`,
        current_role: p.current_role || 'Full Stack Engineer',
        readiness_score: 82,
        status: 'Active',
        resume_score: 85,
        dsa_solved: 110,
        mock_interviews_completed: 4,
        joined_date: fmtDate(p.created_at),
      }))
      return { data: { items } }
    }
  } catch {
    /* proceed to local fallback */
  }

  const items = getStorage(KEYS.STUDENTS, MOCK_STUDENTS)
  return { data: { items } }
}

export async function getInterviews() {
  try {
    const { data } = await supabase
      .from('interviews')
      .select('id, type, role, scheduled_at, student_name')
      .order('scheduled_at', { ascending: true })

    if (data && data.length > 0) {
      const items = data.map((i) => ({
        id: i.id,
        student_name: i.student_name || 'Candidate',
        usn: '1MS22CS001',
        type: i.type || 'AI Mock',
        role: i.role || 'Full Stack Engineer',
        scheduled_at: i.scheduled_at || new Date().toISOString(),
        status: 'Scheduled',
        interviewer: 'AI Copilot Engine',
        score: null,
      }))
      return { data: { items } }
    }
  } catch {
    /* fallback to local */
  }

  const items = getStorage(KEYS.INTERVIEWS, MOCK_INTERVIEWS)
  return { data: { items } }
}

export async function getMaterials() {
  try {
    const { data } = await supabase
      .from('materials')
      .select('id, title, category, type, created_at')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      const items = data.map((m) => ({
        id: m.id,
        title: m.title,
        category: m.category || 'General',
        type: m.type || 'Article',
        url: 'https://example.com',
        author: 'Admin',
        created_at: fmtDate(m.created_at),
      }))
      return { data: { items } }
    }
  } catch {
    /* fallback */
  }

  const items = getStorage(KEYS.MATERIALS, MOCK_MATERIALS)
  return { data: { items } }
}

export async function getQuizzes() {
  try {
    const { data } = await supabase
      .from('quizzes')
      .select('id, title, description, created_at')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      const items = data.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description || '',
        category: 'DSA',
        duration_mins: 30,
        question_count: 15,
        active: true,
        created_at: fmtDate(q.created_at),
      }))
      return { data: { items } }
    }
  } catch {
    /* fallback */
  }

  const items = getStorage(KEYS.QUIZZES, MOCK_QUIZZES)
  return { data: { items } }
}

export async function getAssignments() {
  try {
    const { data } = await supabase
      .from('assignments')
      .select('id, title, description, due_date, created_at')
      .order('due_date', { ascending: true })

    if (data && data.length > 0) {
      const items = data.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description || '',
        target_batch: 'All Batches',
        due_date: a.due_date,
        submitted_count: 20,
        total_students: 50,
        created_at: fmtDate(a.created_at),
      }))
      return { data: { items } }
    }
  } catch {
    /* fallback */
  }

  const items = getStorage(KEYS.ASSIGNMENTS, MOCK_ASSIGNMENTS)
  return { data: { items } }
}

export async function getPerformance() {
  return {
    data: {
      cohortReadinessAvg: 81,
      totalPlaced: 38,
      interviewsCompletedThisMonth: 142,
      domainReadiness: [
        { domain: 'DSA & Algorithms', score: 85, target: 90 },
        { domain: 'System Design', score: 74, target: 80 },
        { domain: 'Web & Full Stack', score: 89, target: 85 },
        { domain: 'Aptitude & Logic', score: 78, target: 85 },
        { domain: 'Communication / HR', score: 82, target: 85 },
      ],
      monthlyTrends: [
        { month: 'Oct', avgScore: 68, interviews: 45 },
        { month: 'Nov', avgScore: 72, interviews: 68 },
        { month: 'Dec', avgScore: 75, interviews: 80 },
        { month: 'Jan', avgScore: 79, interviews: 110 },
        { month: 'Feb', avgScore: 81, interviews: 135 },
        { month: 'Mar', avgScore: 86, interviews: 152 },
      ],
    },
  }
}

// Admin Mutation Functions
export async function addMaterial(materialData) {
  const newMaterial = {
    id: 'mat-' + Date.now(),
    title: materialData.title,
    category: materialData.category || 'DSA',
    type: materialData.type || 'PDF',
    url: materialData.url || 'https://example.com/resource',
    author: 'Admin Portal',
    created_at: new Date().toISOString().split('T')[0],
  }

  try {
    await supabase.from('materials').insert([{
      title: newMaterial.title,
      category: newMaterial.category,
      type: newMaterial.type,
    }])
  } catch {
    /* noop */
  }

  const list = getStorage(KEYS.MATERIALS, MOCK_MATERIALS)
  const updated = [newMaterial, ...list]
  setStorage(KEYS.MATERIALS, updated)
  return { data: newMaterial }
}

export async function deleteMaterial(id) {
  try {
    await supabase.from('materials').delete().eq('id', id)
  } catch {
    /* noop */
  }

  const list = getStorage(KEYS.MATERIALS, MOCK_MATERIALS)
  const updated = list.filter((m) => m.id !== id)
  setStorage(KEYS.MATERIALS, updated)
  return { success: true }
}

export async function createQuiz(quizData) {
  const newQuiz = {
    id: 'q-' + Date.now(),
    title: quizData.title,
    description: quizData.description || '',
    category: quizData.category || 'DSA',
    duration_mins: Number(quizData.duration_mins) || 30,
    question_count: Number(quizData.question_count) || 15,
    active: true,
    created_at: new Date().toISOString().split('T')[0],
  }

  try {
    await supabase.from('quizzes').insert([{
      title: newQuiz.title,
      description: newQuiz.description,
    }])
  } catch {
    /* noop */
  }

  const list = getStorage(KEYS.QUIZZES, MOCK_QUIZZES)
  const updated = [newQuiz, ...list]
  setStorage(KEYS.QUIZZES, updated)
  return { data: newQuiz }
}

export async function deleteQuiz(id) {
  try {
    await supabase.from('quizzes').delete().eq('id', id)
  } catch {
    /* noop */
  }

  const list = getStorage(KEYS.QUIZZES, MOCK_QUIZZES)
  const updated = list.filter((q) => q.id !== id)
  setStorage(KEYS.QUIZZES, updated)
  return { success: true }
}

export async function scheduleInterview(interviewData) {
  const newInterview = {
    id: 'int-' + Date.now(),
    student_name: interviewData.student_name,
    usn: interviewData.usn || '1MS22CS001',
    type: interviewData.type || 'AI Mock',
    role: interviewData.role || 'Full Stack Engineer',
    scheduled_at: interviewData.scheduled_at || new Date(Date.now() + 86400000).toISOString(),
    status: 'Scheduled',
    interviewer: interviewData.interviewer || 'AI Copilot Engine',
    score: null,
  }

  try {
    await supabase.from('interviews').insert([{
      type: newInterview.type,
      role: newInterview.role,
      scheduled_at: newInterview.scheduled_at,
      student_name: newInterview.student_name,
    }])
  } catch {
    /* noop */
  }

  const list = getStorage(KEYS.INTERVIEWS, MOCK_INTERVIEWS)
  const updated = [newInterview, ...list]
  setStorage(KEYS.INTERVIEWS, updated)
  return { data: newInterview }
}

export async function createAssignment(assignmentData) {
  const newAssignment = {
    id: 'asg-' + Date.now(),
    title: assignmentData.title,
    description: assignmentData.description || '',
    target_batch: assignmentData.target_batch || 'All Batches',
    due_date: assignmentData.due_date || new Date(Date.now() + 432000000).toISOString(),
    submitted_count: 0,
    total_students: 50,
    created_at: new Date().toISOString().split('T')[0],
  }

  try {
    await supabase.from('assignments').insert([{
      title: newAssignment.title,
      description: newAssignment.description,
      due_date: newAssignment.due_date,
    }])
  } catch {
    /* noop */
  }

  const list = getStorage(KEYS.ASSIGNMENTS, MOCK_ASSIGNMENTS)
  const updated = [newAssignment, ...list]
  setStorage(KEYS.ASSIGNMENTS, updated)
  return { data: newAssignment }
}

export async function deleteAssignment(id) {
  try {
    await supabase.from('assignments').delete().eq('id', id)
  } catch {
    /* noop */
  }

  const list = getStorage(KEYS.ASSIGNMENTS, MOCK_ASSIGNMENTS)
  const updated = list.filter((a) => a.id !== id)
  setStorage(KEYS.ASSIGNMENTS, updated)
  return { success: true }
}
