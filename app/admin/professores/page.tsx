import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export default async function ProfessoresPage() {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    return null
  }

  const professores = await prisma.professor.findMany({
    include: {
      user: true,
      turmas: {
        include: {
          _count: {
            select: {
              alunos: true,
            },
          },
        },
      },
      _count: {
        select: {
          correcoes: true,
        },
      },
    },
    orderBy: {
      user: {
        nome: 'asc',
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professores</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de professores
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/professores/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Professor
          </Link>
        </Button>
      </div>

      {professores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum professor encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando um novo professor.
            </p>
            <Button asChild>
              <Link href="/admin/professores/novo">
                Criar Primeiro Professor
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {professores.map((professor) => (
            <Card key={professor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{professor.user.nome}</CardTitle>
                    <CardDescription>{professor.user.email}</CardDescription>
                  </div>
                  <Badge variant={professor.user.status === 'ATIVO' ? 'default' : 'secondary'}>
                    {professor.user.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  {professor.user.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{professor.user.telefone}</span>
                    </div>
                  )}
                  {professor.formacao && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Formação:</span> {professor.formacao}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Turmas:</span> {professor.turmas.length}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Correções:</span> {professor._count.correcoes}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/admin/professores/${professor.id}`}>
                    Ver Detalhes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

