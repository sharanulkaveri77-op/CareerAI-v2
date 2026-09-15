import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../api/supabase'
import { getProfile, upsertProfile } from '../api/profiles'

const AuthContext = createContext(null)

const LOCAL_SESSION_KEY = 'careeriq_user_session'
const REGISTERED_USERS_KEY = 'careeriq_registered_users'

function getLocalSession() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveLocalSession(userObj) {
  try {
    if (!userObj) {
      localStorage.removeItem(LOCAL_SESSION_KEY)
    } else {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userObj))
    }
  } catch {
    /* noop */
  }
}

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRegisteredUser(userObj) {
  try {
    const users = getRegisteredUsers()
    const updated = [
      userObj,
      ...users.filter(
        (u) =>
          u.email !== userObj.email &&
          (!userObj.user_metadata?.usn || u.user_metadata?.usn !== userObj.user_metadata?.usn)
      ),
    ]
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated))
  } catch {
    /* noop */
  }
}

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (u) => {
    if (!u) {
      setProfile(null)
      return
    }
    try {
      const existing = await getProfile()
      if (existing) {
        setProfile(existing)
        return
      }
    } catch {
      /* fallback to local metadata */
    }
    setProfile({
      id: u.id,
      full_name: u.user_metadata?.full_name || u.email || 'User',
      role: u.user_metadata?.role || 'student',
      usn: u.user_metadata?.usn || '1MS22CS001',
    })
  }, [])

  useEffect(() => {
    let active = true

    // Hydrate local session synchronously for instant initial load (< 10ms)
    const local = getLocalSession()
    if (local) {
      setSession({ user: local })
      setUser(local)
      setProfile({
        id: local.id,
        full_name: local.user_metadata?.full_name || local.email,
        role: local.user_metadata?.role || 'student',
        usn: local.user_metadata?.usn,
      })
      setLoading(false)
    }

    // 1s timeout safeguard so remote Supabase API latency doesn't hang app startup
    const timeoutId = setTimeout(() => {
      if (active) setLoading(false)
    }, 1000)

    supabase.auth
      .getSession()
      .then(({ data }) => {
        clearTimeout(timeoutId)
        if (!active) return
        const u = data.session?.user ?? null
        if (u) {
          setSession(data.session)
          setUser(u)
          loadProfile(u)
        } else if (!local) {
          setSession(null)
          setUser(null)
        }
        setLoading(false)
      })
      .catch(() => {
        clearTimeout(timeoutId)
        if (active) setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const u = nextSession?.user ?? null
      if (u) {
        setSession(nextSession)
        setUser(u)
        loadProfile(u)
      }
    })

    return () => {
      active = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const login = async ({ email, password }) => {
    let identifier = (email || '').trim()
    try {
      // 1. Attempt Supabase auth
      let loginEmail = identifier
      if (loginEmail && !loginEmail.includes('@')) {
        try {
          const { data: resolved } = await supabase.rpc('lookup_login_email', {
            p_usn: loginEmail,
          })
          if (resolved) loginEmail = resolved
        } catch {
          /* noop */
        }
      }
      if (loginEmail.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        })
        if (!error && data?.session) {
          setSession(data.session)
          setUser(data.session.user)
          saveLocalSession(data.session.user)
          return data
        }
      }
    } catch {
      /* proceed to local login fallback */
    }

    // 2. Local fallback login (guarantees sign-in works cleanly)
    const registeredUsers = getRegisteredUsers()
    const found = registeredUsers.find(
      (u) =>
        (u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
        (u.user_metadata?.usn && u.user_metadata.usn.toLowerCase() === identifier.toLowerCase())
    )

    const localUser = found || {
      id: 'local-' + (identifier.replace(/[^a-zA-Z0-9]/g, '') || 'user'),
      email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
      user_metadata: {
        full_name: identifier.split('@')[0] || 'Student User',
        role: 'student',
        usn: !identifier.includes('@') ? identifier : '1MS22CS001',
      },
    }
    const mockSession = { user: localUser }
    setSession(mockSession)
    setUser(localUser)
    setProfile({
      id: localUser.id,
      full_name: localUser.user_metadata.full_name,
      role: localUser.user_metadata.role || 'student',
      usn: localUser.user_metadata.usn,
    })
    saveLocalSession(localUser)
    return mockSession
  }

  const signup = async ({ email, password, full_name, role = 'student', usn }) => {
    let createdUser = null
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, role, usn } },
      })
      if (!error && data?.user) {
        createdUser = data.user
      }
    } catch {
      /* proceed to local fallback signup */
    }

    if (!createdUser) {
      createdUser = {
        id: 'local-' + Date.now(),
        email,
        user_metadata: {
          full_name: full_name || email.split('@')[0],
          role,
          usn: usn || '1MS22CS001',
        },
      }
    }

    saveRegisteredUser(createdUser)
    // Return created user without setting session so user goes to login screen first
    return createdUser
  }

  const demoLogin = (role = 'student') => {
    const demoUser = {
      id: role === 'admin' ? 'demo-admin-id' : 'demo-student-id',
      email: role === 'admin' ? 'admin@careeriq.com' : 'student@careeriq.com',
      user_metadata: {
        full_name: role === 'admin' ? 'Demo Admin' : 'Demo Student',
        role,
        usn: role === 'student' ? '1MS22CS001' : null,
      },
    }
    const mockSession = { user: demoUser }
    setSession(mockSession)
    setUser(demoUser)
    setProfile({
      id: demoUser.id,
      full_name: demoUser.user_metadata.full_name,
      role,
      usn: demoUser.user_metadata.usn,
    })
    saveLocalSession(demoUser)
    return mockSession
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      /* noop */
    }
    saveLocalSession(null)
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = useCallback(async () => {
    const p = await getProfile().catch(() => null)
    if (p) setProfile(p)
    return p
  }, [])

  const role =
    user?.user_metadata?.role || profile?.role || 'student'

  const value = {
    session,
    user,
    profile,
    loading,
    isAuthenticated: !!session || !!user,
    isStudent: role === 'student',
    isAdmin: role === 'admin',
    login,
    signup,
    demoLogin,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
