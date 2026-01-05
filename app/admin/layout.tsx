import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { getCurrentUser } from '@/lib/get-session'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!user.role.startsWith('ADMIN_')) {
    redirect('/')
  }

  return (
    <MainLayout role={user.role} nome={user.nome}>
      {children}
    </MainLayout>
  )
}

