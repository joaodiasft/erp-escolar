import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function EvolucaoPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const aluno = await prisma.aluno.findUnique({
    where: { userId: user.id },
    include: {
      redacoes: {
        where: {
          status: 'CORRIGIDA',
        },
        include: {
          correcoes: {
            orderBy: { corrigidoEm: 'desc' },
            take: 1,
          },
          tema: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!aluno) {
    return null
  }

  const redacoesComNota = aluno.redacoes.filter(r => r.correcoes.length > 0)
  
  // Calcular evolução por competência
  const evolucaoC1 = redacoesComNota.map(r => ({
    data: r.correcoes[0].corrigidoEm,
    nota: r.correcoes[0].notaC1,
  })).sort((a, b) => a.data.getTime() - b.data.getTime())

  const evolucaoC2 = redacoesComNota.map(r => ({
    data: r.correcoes[0].corrigidoEm,
    nota: r.correcoes[0].notaC2,
  })).sort((a, b) => a.data.getTime() - b.data.getTime())

  const evolucaoC3 = redacoesComNota.map(r => ({
    data: r.correcoes[0].corrigidoEm,
    nota: r.correcoes[0].notaC3,
  })).sort((a, b) => a.data.getTime() - b.data.getTime())

  const evolucaoC4 = redacoesComNota.map(r => ({
    data: r.correcoes[0].corrigidoEm,
    nota: r.correcoes[0].notaC4,
  })).sort((a, b) => a.data.getTime() - b.data.getTime())

  const evolucaoC5 = redacoesComNota.map(r => ({
    data: r.correcoes[0].corrigidoEm,
    nota: r.correcoes[0].notaC5,
  })).sort((a, b) => a.data.getTime() - b.data.getTime())

  const calcularTendencia = (evolucao: typeof evolucaoC1) => {
    if (evolucao.length < 2) return 'NEUTRO'
    const primeira = evolucao[0].nota
    const ultima = evolucao[evolucao.length - 1].nota
    if (ultima > primeira) return 'ALTA'
    if (ultima < primeira) return 'BAIXA'
    return 'NEUTRO'
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'ALTA':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'BAIXA':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const competencias = [
    { nome: 'C1 - Domínio da norma padrão', evolucao: evolucaoC1, cor: 'blue' },
    { nome: 'C2 - Compreensão da proposta', evolucao: evolucaoC2, cor: 'green' },
    { nome: 'C3 - Argumentação', evolucao: evolucaoC3, cor: 'purple' },
    { nome: 'C4 - Coesão e coerência', evolucao: evolucaoC4, cor: 'orange' },
    { nome: 'C5 - Proposta de intervenção', evolucao: evolucaoC5, cor: 'pink' },
  ]

  const notaMediaGeral = redacoesComNota.length > 0
    ? redacoesComNota.reduce((acc, r) => acc + r.correcoes[0].notaTotal, 0) / redacoesComNota.length
    : 0

  const ultimaNota = redacoesComNota.length > 0
    ? redacoesComNota[0].correcoes[0].notaTotal
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Evolução</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe sua evolução nas competências ENEM
        </p>
      </div>

      {redacoesComNota.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma correção ainda
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Sua evolução aparecerá aqui após suas redações serem corrigidas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nota Média Geral
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notaMediaGeral.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  Baseado em {redacoesComNota.length} redações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Última Nota
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ultimaNota.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(redacoesComNota[0].correcoes[0].corrigidoEm)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Redações
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{redacoesComNota.length}</div>
                <p className="text-xs text-muted-foreground">
                  Redações corrigidas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competencias.map((comp, index) => {
              const primeiraNota = comp.evolucao[0]?.nota || 0
              const ultimaNotaComp = comp.evolucao[comp.evolucao.length - 1]?.nota || 0
              const media = comp.evolucao.length > 0
                ? comp.evolucao.reduce((acc, e) => acc + e.nota, 0) / comp.evolucao.length
                : 0
              const tendencia = calcularTendencia(comp.evolucao)

              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{comp.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Média</span>
                        <span className="text-2xl font-bold">{media.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Primeira: {primeiraNota.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          Última: {ultimaNotaComp.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Tendência:</span>
                      {getTendenciaIcon(tendencia)}
                      <span className="text-sm font-medium capitalize">{tendencia}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Notas</CardTitle>
              <CardDescription>
                Evolução das suas notas ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {redacoesComNota.slice(0, 10).map((redacao, index) => {
                  const correcao = redacao.correcoes[0]
                  return (
                    <div
                      key={redacao.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {redacao.temaCustom || redacao.tema?.titulo || 'Redação'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(correcao.corrigidoEm)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {correcao.notaTotal.toFixed(1)}
                        </p>
                        <div className="flex gap-1 text-xs text-muted-foreground">
                          <span>C1:{correcao.notaC1.toFixed(0)}</span>
                          <span>C2:{correcao.notaC2.toFixed(0)}</span>
                          <span>C3:{correcao.notaC3.toFixed(0)}</span>
                          <span>C4:{correcao.notaC4.toFixed(0)}</span>
                          <span>C5:{correcao.notaC5.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

