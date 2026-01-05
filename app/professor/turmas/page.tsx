import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function ProfessorTurmasPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const professor = await prisma.professor.findUnique({
    where: { userId: user.id },
    include: {
      turmas: {
        include: {
          _count: {
            select: {
              alunos: true,
            },
          },
          modulos: {
            orderBy: { ordem: 'asc' },
            take: 1,
          },
        },
        orderBy: { nome: 'asc' },
      },
    },
  })

  if (!professor) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minhas Turmas</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas turmas e alunos
        </p>
      </div>

      {professor.turmas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma turma atribuída
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Suas turmas aparecerão aqui quando forem atribuídas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {professor.turmas.map((turma) => (
            <Card key={turma.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{turma.nome}</CardTitle>
                    <CardDescription>{turma.descricao || 'Sem descrição'}</CardDescription>
                  </div>
                  <Badge variant={turma.status === 'ATIVA' ? 'default' : 'secondary'}>
                    {turma.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{turma.horario}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{turma._count.alunos} alunos</span>
                  </div>
                  {turma.sala && (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>Sala: {turma.sala}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/professor/turmas/${turma.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/professor/turmas/${turma.id}/alunos`}>
                      Alunos
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

