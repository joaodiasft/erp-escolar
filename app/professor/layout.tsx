import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { getCurrentUser } from '@/lib/get-session'

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'PROFESSOR') {
    redirect('/')
  }

  return (
    <MainLayout role={user.role} nome={user.nome} userId={user.id}>
      {children}
    </MainLayout>
  )
}

