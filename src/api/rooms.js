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
  const { error } = await supabase.from('rooms').insert({
    code,
    host_name: data.name,
    role: data.role || null,
    type: data.type || null,
  })
  if (error) {
    throw fail(error.message || 'Could not create room')
  }
  return { data: { roomCode: code } }
}

export async function joinRoom(data) {
  const code = (data.roomCode || '').toUpperCase()
  if (!code) throw fail('Room code required')

  const { data: room, error } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', code)
    .maybeSingle()

  if (error) {
    throw fail('Could not join room')
  }
  if (!room) {
    throw fail('Room not found — double-check the code')
  }
  return { data: { ok: true } }
}
