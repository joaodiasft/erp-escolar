import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

export default async function CalendarioPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const aluno = await prisma.aluno.findUnique({
    where: { userId: user.id },
    include: {
      matriculas: {
        where: {
          status: 'ATIVA',
        },
        include: {
          turma: {
            include: {
              encontros: {
                where: {
                  data: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  },
                },
                include: {
                  modulo: true,
                  presencas: {
                    where: {
                      alunoId: {
                        // Será preenchido abaixo
                      },
                    },
                  },
                },
                orderBy: { data: 'asc' },
                take: 30,
              },
            },
          },
        },
      },
    },
  })

  if (!aluno) {
    return null
  }

  // Coletar todos os encontros
  const todosEncontros: any[] = []

  aluno.matriculas.forEach(matricula => {
    matricula.turma.encontros.forEach(encontro => {
      const presenca = encontro.presencas.find(p => p.alunoId === aluno.id)
      todosEncontros.push({
        ...encontro,
        turma: matricula.turma.nome,
        presenca: presenca?.status || 'PENDENTE',
      })
    })
  })

  // Ordenar por data
  todosEncontros.sort((a, b) => a.data.getTime() - b.data.getTime())

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const proximosEncontros = todosEncontros.filter(e => e.data >= hoje).slice(0, 10)
  const encontrosPassados = todosEncontros.filter(e => e.data < hoje).slice(-10).reverse()

  const getStatusBadge = (encontro: any) => {
    const dataEncontro = new Date(encontro.data)
    dataEncontro.setHours(0, 0, 0, 0)

    if (dataEncontro < hoje) {
      return <Badge variant={encontro.presenca === 'PRESENTE' ? 'default' : 'destructive'}>
        {encontro.presenca === 'PRESENTE' ? 'Presente' : 'Falta'}
      </Badge>
    }
    if (dataEncontro.getTime() === hoje.getTime()) {
      return <Badge variant="default" className="bg-orange-500">Hoje</Badge>
    }
    return <Badge variant="outline">Agendado</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
        <p className="text-muted-foreground mt-1">
          Seus encontros e aulas agendadas
        </p>
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
        <>
          {proximosEncontros.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Próximos Encontros</h2>
              <div className="grid gap-4">
                {proximosEncontros.map((encontro) => (
                  <Card key={encontro.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{encontro.tema || 'Encontro'}</CardTitle>
                          <CardDescription>{encontro.turma}</CardDescription>
                        </div>
                        {getStatusBadge(encontro)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 md:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(encontro.data)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{encontro.horaInicio} - {encontro.horaFim}</span>
                        </div>
                        {encontro.sala && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{encontro.sala}</span>
                          </div>
                        )}
                      </div>
                      {encontro.descricao && (
                        <p className="text-sm text-muted-foreground mt-3">
                          {encontro.descricao}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {encontrosPassados.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Encontros Anteriores</h2>
              <div className="grid gap-4">
                {encontrosPassados.map((encontro) => (
                  <Card key={encontro.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{encontro.tema || 'Encontro'}</CardTitle>
                          <CardDescription>{encontro.turma}</CardDescription>
                        </div>
                        {getStatusBadge(encontro)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(encontro.data)}</span>
                        <span>{encontro.horaInicio} - {encontro.horaFim}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

