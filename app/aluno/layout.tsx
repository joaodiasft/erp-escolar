import { redirect } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { getCurrentUser } from '@/lib/get-session'

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ALUNO') {
    redirect('/')
  }

  return (
    <MainLayout role={user.role} nome={user.nome} userId={user.id}>
      {children}
    </MainLayout>
  )
}

