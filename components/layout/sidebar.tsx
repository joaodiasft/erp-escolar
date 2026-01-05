'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BookOpen, 
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  TrendingUp,
  ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Role } from '@prisma/client'

interface SidebarProps {
  role: Role
  nome: string
}

const alunoMenu = [
  { href: '/aluno', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/aluno/redacoes', label: 'Minhas Redações', icon: FileText },
  { href: '/aluno/evolucao', label: 'Evolução', icon: TrendingUp },
  { href: '/aluno/materiais', label: 'Materiais', icon: BookOpen },
  { href: '/aluno/calendario', label: 'Calendário', icon: Calendar },
  { href: '/aluno/mensagens', label: 'Mensagens', icon: MessageSquare },
]

const professorMenu = [
  { href: '/professor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/professor/turmas', label: 'Turmas', icon: Users },
  { href: '/professor/correcoes', label: 'Fila de Correções', icon: ClipboardList },
  { href: '/professor/planejamento', label: 'Planejamento', icon: BookOpen },
  { href: '/professor/presenca', label: 'Presença', icon: Calendar },
  { href: '/professor/mensagens', label: 'Mensagens', icon: MessageSquare },
]

const adminMenu = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/turmas', label: 'Turmas', icon: Users },
  { href: '/admin/alunos', label: 'Alunos', icon: Users },
  { href: '/admin/professores', label: 'Professores', icon: Users },
  { href: '/admin/contratos', label: 'Contratos', icon: FileText },
  { href: '/admin/financeiro', label: 'Financeiro', icon: TrendingUp },
  { href: '/admin/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar({ role, nome }: SidebarProps) {
  const pathname = usePathname()

  const getMenu = () => {
    if (role === 'ALUNO') return alunoMenu
    if (role === 'PROFESSOR') return professorMenu
    return adminMenu
  }

  const menu = getMenu()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Redação Nota Mil</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="mb-2 px-3 text-sm font-medium">{nome}</div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}

