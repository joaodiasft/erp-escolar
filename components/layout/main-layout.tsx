import { Sidebar } from './sidebar'
import { Role } from '@prisma/client'

interface MainLayoutProps {
  children: React.ReactNode
  role: Role
  nome: string
}

export function MainLayout({ children, role, nome }: MainLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar role={role} nome={nome} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

