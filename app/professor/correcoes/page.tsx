import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ProfessorCorrecoes() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const professor = await prisma.professor.findUnique({
    where: { userId: user.id },
  })

  if (!professor) {
    return null
  }

  // Buscar redações em correção ordenadas por prioridade
  const redacoes = await prisma.redacao.findMany({
    where: {
      status: 'EM_CORRECAO',
      turma: {
        professorId: professor.id,
      },
    },
    include: {
      aluno: {
        include: {
          user: true,
        },
      },
      turma: true,
      tema: true,
    },
    orderBy: [
      { prioridade: 'desc' },
      { prazo: 'asc' },
      { enviadoEm: 'asc' },
    ],
    take: 50,
  })

  const getUrgencia = (redacao: typeof redacoes[0]) => {
    if (!redacao.prazo) return 'normal'
    const diasRestantes = Math.ceil(
      (new Date(redacao.prazo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (diasRestantes < 0) return 'atrasado'
    if (diasRestantes <= 1) return 'urgente'
    if (diasRestantes <= 3) return 'proximo'
    return 'normal'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fila de Correções</h1>
        <p className="text-muted-foreground">
          Redações aguardando sua correção (ordenadas por prioridade)
        </p>
      </div>

      {redacoes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma correção pendente
            </h3>
            <p className="text-sm text-muted-foreground">
              Todas as redações foram corrigidas!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {redacoes.map((redacao) => {
            const urgencia = getUrgencia(redacao)
            const diasRestantes = redacao.prazo
              ? Math.ceil(
                  (new Date(redacao.prazo).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              : null

            return (
              <Card key={redacao.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>
                        {redacao.temaCustom || redacao.tema?.titulo || 'Redação'}
                      </CardTitle>
                      <CardDescription>
                        {redacao.aluno.user.nome} • {redacao.turma.nome} • Versão{' '}
                        {redacao.versao}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {urgencia === 'atrasado' && (
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Atrasado</span>
                        </div>
                      )}
                      {urgencia === 'urgente' && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {diasRestantes}d restantes
                          </span>
                        </div>
                      )}
                      {urgencia === 'proximo' && (
                        <div className="text-sm text-muted-foreground">
                          {diasRestantes}d restantes
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Enviada em:{' '}
                      {new Date(redacao.enviadoEm || redacao.createdAt).toLocaleDateString(
                        'pt-BR'
                      )}
                    </div>
                    <Link href={`/professor/correcoes/${redacao.id}`}>
                      <Button>Corrigir</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

