import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AlunosPage() {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    return null
  }

  const alunos = await prisma.aluno.findMany({
    include: {
      user: true,
      matriculas: {
        include: {
          turma: true,
        },
      },
      _count: {
        select: {
          redacoes: true,
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
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground">
            Gestão de alunos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/alunos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Link>
        </Button>
      </div>

      {alunos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando um novo aluno.
            </p>
            <Button asChild>
              <Link href="/admin/alunos/novo">
                Criar Primeiro Aluno
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alunos.map((aluno) => (
            <Card key={aluno.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{aluno.user.nome}</CardTitle>
                    <CardDescription>
                      {aluno.user.email} {aluno.ra && `• RA: ${aluno.ra}`}
                    </CardDescription>
                  </div>
                  <Badge variant={aluno.user.status === 'ATIVO' ? 'default' : 'secondary'}>
                    {aluno.user.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Turmas</p>
                    <p className="font-medium">
                      {aluno.matriculas.length} {aluno.matriculas.length === 1 ? 'turma' : 'turmas'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Redações</p>
                    <p className="font-medium">{aluno._count.redacoes}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{aluno.user.telefone || '-'}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/alunos/${aluno.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

