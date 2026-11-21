import { createClient, type Session, type User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

function hasRealSupabaseConfig(url: string, anonKey: string) {
  const placeholderPattern = /(your-|example|placeholder|dummy|test)/i
  return Boolean(
    url
    && anonKey
    && url.includes('.supabase.co')
    && !placeholderPattern.test(url)
    && !placeholderPattern.test(anonKey),
  )
}

export const supabase =
  hasRealSupabaseConfig(supabaseUrl, supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

const DEMO_USER_ID = 'admin-demo-user'

export function readStoredSession(): Session | null {
  if (!supabase) {
    const raw = localStorage.getItem('grandforth_admin_demo_session')
    if (!raw) return null
    try {
      return JSON.parse(raw) as Session
    } catch {
      return null
    }
  }

  return null
}

export function writeStoredSession(session: Session | null) {
  if (!supabase && session) {
    localStorage.setItem('grandforth_admin_demo_session', JSON.stringify(session))
  }
}

function createDemoUser(email: string, fullName?: string): User {
  const user = {
    id: DEMO_USER_ID,
    app_metadata: { provider: 'demo' },
    user_metadata: { full_name: fullName ?? email.split('@')[0] },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
    email_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
    phone: null,
    confirmation_sent_at: null,
    invited_at: null,
    recovery_sent_at: null,
    identities: null,
    factors: null,
  } as unknown as User
  return user
}

export async function signInWithEmailPassword(email: string, password: string) {
  if (!supabase) {
    if (email === 'admin@grandforthlegal.com' && password === 'Admin123!') {
      const user = createDemoUser(email, 'Super Admin')
      const session = {
        access_token: 'demo-access-token',
        refresh_token: 'demo-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user,
      } as Session
      writeStoredSession(session)
      return { data: { session, user }, error: null }
    }
    return { data: { session: null, user: null }, error: { message: 'Invalid administrator credentials.' } }
  }

  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmailPassword(email: string, password: string, fullName: string) {
  if (!supabase) {
    const user = createDemoUser(email, fullName)
    const session = {
      access_token: 'demo-access-token',
      refresh_token: 'demo-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user,
    } as Session
    writeStoredSession(session)
    return { data: { session, user }, error: null }
  }

  return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
}

export async function signOut() {
  if (!supabase) {
    localStorage.removeItem('grandforth_admin_demo_session')
    return { error: null }
  }

  return supabase.auth.signOut()
}
