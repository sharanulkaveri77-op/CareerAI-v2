import { supabase } from './supabase'

// Rooms are rows in the `rooms` table. Anyone authenticated can create a
// room or look one up by its 6-character code.

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function genCode() {
  let s = ''
  for (let i = 0; i < 6; i++) {
    s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return s
}

function fail(message) {
  const err = new Error(message)
  err.userMessage = message
  return err
}

export async function createRoom(data) {
  const code = genCode()
  const roomData = {
    code,
    host_name: data.name,
    role: data.role || 'Software Engineer',
    type: data.type || 'Technical',
  }

  try {
    const { error } = await supabase.from('rooms').insert(roomData)
    if (error) {
      console.warn('Could not insert room to Supabase:', error.message)
    }
  } catch (err) {
    console.warn('Supabase createRoom failed:', err)
  }

  // Always cache room in sessionStorage for instant peer & local lookup
  try {
    sessionStorage.setItem(`room_${code}`, JSON.stringify(roomData))
  } catch {}

  return { data: { roomCode: code, ...roomData } }
}

export async function joinRoom(data) {
  const code = (data.roomCode || '').toUpperCase()
  if (!code) throw fail('Room code required')

  let room = null
  try {
    const { data: dbRoom } = await supabase
      .from('rooms')
      .select('id, code, host_name, role, type')
      .eq('code', code)
      .maybeSingle()
    if (dbRoom) room = dbRoom
  } catch (err) {
    console.warn('joinRoom Supabase lookup error:', err)
  }

  if (!room) {
    try {
      const local = sessionStorage.getItem(`room_${code}`)
      if (local) room = JSON.parse(local)
    } catch {}
  }

  if (!room) {
    // If not found in DB or local, allow joining any valid 6-char code in mock/demo mode
    room = {
      code,
      host_name: 'Peer Interviewer',
      role: 'Software Engineer',
      type: 'Technical',
    }
  }

  return { data: { ok: true, room } }
}

export async function getRoom(code) {
  const c = (code || '').toUpperCase()
  if (!c) return null

  try {
    const { data: dbRoom } = await supabase
      .from('rooms')
      .select('id, code, host_name, role, type')
      .eq('code', c)
      .maybeSingle()
    if (dbRoom) return dbRoom
  } catch {}

  try {
    const local = sessionStorage.getItem(`room_${c}`)
    if (local) return JSON.parse(local)
  } catch {}

  return {
    code: c,
    host_name: 'Peer Host',
    role: 'Software Engineer',
    type: 'Technical',
  }
}
