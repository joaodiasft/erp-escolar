import { redirect } from 'next/navigation'
import { getSession } from '@/lib/get-session'

export default async function Home() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Redirecionar baseado no role
  switch (session.user.role) {
    case 'ALUNO':
      redirect('/aluno')
    case 'PROFESSOR':
      redirect('/professor')
    case 'ADMIN_COORDENACAO':
    case 'ADMIN_SECRETARIA':
    case 'ADMIN_FINANCEIRO':
    case 'ADMIN_SUPER':
      redirect('/admin')
    default:
      redirect('/login')
  }
}

