import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // After Supabase setup, this will verify auth and redirect by role.
  // For now, go directly to module selector.
  redirect('/dashboard/select')
}
