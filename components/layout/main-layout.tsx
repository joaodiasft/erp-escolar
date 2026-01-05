import { Sidebar } from './sidebar'
import { Role } from '@prisma/client'

interface MainLayoutProps {
  children: React.ReactNode
  role: Role
  nome: string
  userId: string
}

export function MainLayout({ children, role, nome, userId }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={role} nome={nome} userId={userId} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}

