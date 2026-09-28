import { supabase, isSupabaseConfigured } from './supabaseClient'

export async function signUp(email, password) {
  if (!isSupabaseConfigured) return { error: 'Auth not configured' }
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error: error?.message }
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured) return { error: 'Auth not configured' }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error: error?.message }
}

export async function signOut() {
  if (!isSupabaseConfigured) return
  await supabase.auth.signOut()
}

export function onAuthChange(callback) {
  if (!isSupabaseConfigured) return () => {}
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
  return () => sub.subscription.unsubscribe()
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

function friendlyError(error) {
  if (!error) return null
  // Postgres/PostgREST returns 404 (or a "relation does not exist" message)
  // when the analyses table hasn't been created yet — the #1 setup mistake.
  const msg = error.message || String(error)
  if (error.code === 'PGRST205' || /relation .* does not exist/i.test(msg) || error.status === 404) {
    return 'The "analyses" table doesn\u2019t exist yet — run supabase_schema.sql in your Supabase SQL Editor.'
  }
  if (error.code === '42501' || /row-level security/i.test(msg)) {
    return 'Row-level security blocked this — check the policies in supabase_schema.sql were applied.'
  }
  return msg
}

// Returns { ok, error } instead of silently swallowing — callers decide
// whether/how to surface it, but nothing fails invisibly anymore.
export async function saveAnalysis({ userId, inputSummary, targetRole, skillsJson, gapJson }) {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured' }
  if (!userId) return { ok: false, error: 'Not signed in' }
  const { error } = await supabase.from('analyses').insert({
    user_id: userId,
    input_summary: inputSummary,
    target_role: targetRole,
    skills_json: skillsJson,
    gap_json: gapJson,
  })
  if (error) {
    const friendly = friendlyError(error)
    console.warn('History save failed:', error)
    return { ok: false, error: friendly }
  }
  return { ok: true }
}

export async function listAnalyses(userId) {
  if (!isSupabaseConfigured || !userId) return { ok: false, error: 'Not signed in', items: [] }
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) {
    const friendly = friendlyError(error)
    console.warn('History fetch failed:', error)
    return { ok: false, error: friendly, items: [] }
  }
  return { ok: true, items: data }
}
