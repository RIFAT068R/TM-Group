import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin-only Supabase client using service role key
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Verify the requester is an admin
async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return false

  const role = (
    user.user_metadata?.role ||
    user.app_metadata?.role ||
    ''
  ).toLowerCase()

  return role === 'admin'
}

// GET /api/admin — list all users
export async function GET(req: Request) {
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 500 })
    if (error) throw error

    const users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      role: (u.user_metadata?.role || u.app_metadata?.role || 'viewer').toLowerCase(),
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
    }))

    return NextResponse.json({ users })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/admin — grant admin role to a user
export async function POST(req: Request) {
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const adminClient = getAdminClient()

    // Get existing user data first
    const { data: userData, error: fetchErr } = await adminClient.auth.admin.getUserById(userId)
    if (fetchErr) throw fetchErr

    const existingMeta = userData.user.user_metadata || {}

    // Grant admin role
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: { ...existingMeta, role: 'admin' }
    })
    if (error) throw error

    return NextResponse.json({ success: true, message: 'Admin role granted successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
