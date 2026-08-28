import { supabase } from '../api/supabase'

export const studentSignup = async (data) => {
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.full_name } }
  })
  return { error }
}

export const studentLogin = async (data) => {
  const { error, data: { session } } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  })
  if (session) {
    localStorage.setItem('careerai_token', session.access_token)
  }
  return { error }
}

export const adminSignup = async (data) => {
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.name, role: 'admin' } }
  })
  return { error }
}

export const adminLogin = async (data) => {
  const { error, data: { session } } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  })
  if (session) {
    localStorage.setItem('careerai_token', session.access_token)
  }
  return { error }
}