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

// Fire-and-forget save — never blocks or breaks the analysis flow if it fails.
export async function saveAnalysis({ userId, inputSummary, targetRole, skillsJson, gapJson }) {
  if (!isSupabaseConfigured || !userId) return
  try {
    await supabase.from('analyses').insert({
      user_id: userId,
      input_summary: inputSummary,
      target_role: targetRole,
      skills_json: skillsJson,
      gap_json: gapJson,
    })
  } catch (e) {
    // Silent — history is a nice-to-have, not core flow
    console.warn('History save failed', e)
  }
}

export async function listAnalyses(userId) {
  if (!isSupabaseConfigured || !userId) return []
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) return []
  return data
}
