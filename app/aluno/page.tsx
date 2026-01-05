import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, TrendingUp, Calendar, BookOpen } from 'lucide-react'

export default async function AlunoDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  // Buscar dados do aluno
  const aluno = await prisma.aluno.findUnique({
    where: { userId: user.id },
    include: {
      matriculas: {
        include: {
          turma: true,
        },
      },
      redacoes: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          correcoes: {
            take: 1,
            orderBy: { corrigidoEm: 'desc' },
          },
        },
      },
    },
  })

  const redacoesEnviadas = aluno?.redacoes.filter(r => r.status !== 'RASCUNHO').length || 0
  const redacoesCorrigidas = aluno?.redacoes.filter(r => r.status === 'CORRIGIDA').length || 0
  const ultimaNota = aluno?.redacoes
    .find(r => r.correcoes.length > 0)
    ?.correcoes[0]?.notaTotal

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {user.nome}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Redações Enviadas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{redacoesEnviadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Redações Corrigidas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{redacoesCorrigidas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Última Nota
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ultimaNota ? ultimaNota.toFixed(1) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Turmas Ativas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aluno?.matriculas.filter(m => m.status === 'ATIVA').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Redações</CardTitle>
            <CardDescription>Suas redações mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {aluno?.redacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma redação ainda. Comece escrevendo sua primeira redação!
              </p>
            ) : (
              <div className="space-y-2">
                {aluno?.redacoes.map((redacao) => (
                  <div
                    key={redacao.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{redacao.temaCustom || 'Redação'}</p>
                      <p className="text-sm text-muted-foreground">
                        Versão {redacao.versao} • {redacao.status}
                      </p>
                    </div>
                    {redacao.correcoes.length > 0 && (
                      <div className="text-right">
                        <p className="font-bold">
                          {redacao.correcoes[0].notaTotal.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Encontros</CardTitle>
            <CardDescription>Suas aulas agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Em breve você verá seus próximos encontros aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

