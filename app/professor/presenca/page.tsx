import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function PresencaPage() {
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
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
              },
            },
            include: {
              presencas: {
                include: {
                  aluno: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  presencas: true,
                },
              },
            },
            orderBy: { data: 'desc' },
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

  todosEncontros.sort((a, b) => b.data.getTime() - a.data.getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Presença</h1>
        <p className="text-muted-foreground mt-1">
          Controle de presença dos alunos
        </p>
      </div>

      {todosEncontros.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum encontro recente
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Os encontros aparecerão aqui quando forem realizados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {todosEncontros.map((encontro) => {
            const presentes = encontro.presencas.filter(p => p.status === 'PRESENTE').length
            const faltas = encontro.presencas.filter(p => p.status === 'FALTA').length
            const justificadas = encontro.presencas.filter(p => p.status === 'JUSTIFICADA').length

            return (
              <Card key={encontro.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{encontro.tema || 'Encontro'}</CardTitle>
                      <CardDescription>
                        {encontro.turma} • {formatDate(encontro.data)} • {encontro.horaInicio} - {encontro.horaFim}
                      </CardDescription>
                    </div>
                    <Badge variant={encontro.status === 'REALIZADO' ? 'default' : 'outline'}>
                      {encontro.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        <span className="font-semibold">{presentes}</span> Presentes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">
                        <span className="font-semibold">{faltas}</span> Faltas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">
                        <span className="font-semibold">{justificadas}</span> Justificadas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-semibold">{encontro._count.presencas}</span> Total
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/professor/presenca/${encontro.id}`}>
                      Ver/Editar Presença
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

