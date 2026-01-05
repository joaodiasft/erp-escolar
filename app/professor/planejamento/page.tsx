import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, BookOpen, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function PlanejamentoPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const professor = await prisma.professor.findUnique({
    where: { userId: user.id },
    include: {
      turmas: {
        include: {
          encontros: {
            where: {
              data: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
            include: {
              planejamento: true,
              modulo: true,
            },
            orderBy: { data: 'asc' },
            take: 20,
          },
        },
      },
    },
  })

  if (!professor) {
    return null
  }

  const todosEncontros: any[] = []
  professor.turmas.forEach(turma => {
    turma.encontros.forEach(encontro => {
      todosEncontros.push({
        ...encontro,
        turma: turma.nome,
      })
    })
  })

  todosEncontros.sort((a, b) => a.data.getTime() - b.data.getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planejamento</h1>
          <p className="text-muted-foreground mt-1">
            Planeje suas aulas e encontros
          </p>
        </div>
      </div>

      {todosEncontros.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum encontro agendado
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Seus encontros aparecerão aqui quando forem agendados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {todosEncontros.map((encontro) => (
            <Card key={encontro.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{encontro.tema || 'Encontro'}</CardTitle>
                    <CardDescription>
                      {encontro.turma} • {formatDate(encontro.data)} • {encontro.horaInicio} - {encontro.horaFim}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {encontro.planejamento ? (
                  <div className="space-y-3">
                    {encontro.planejamento.objetivos && (
                      <div>
                        <p className="text-sm font-medium mb-1">Objetivos:</p>
                        <p className="text-sm text-muted-foreground">{encontro.planejamento.objetivos}</p>
                      </div>
                    )}
                    {encontro.planejamento.conteudo && (
                      <div>
                        <p className="text-sm font-medium mb-1">Conteúdo:</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">{encontro.planejamento.conteudo}</p>
                      </div>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/professor/planejamento/${encontro.id}`}>
                        Ver/Editar Planejamento
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Planejamento não criado ainda
                    </p>
                    <Button size="sm" asChild>
                      <Link href={`/professor/planejamento/${encontro.id}/novo`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Planejamento
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

