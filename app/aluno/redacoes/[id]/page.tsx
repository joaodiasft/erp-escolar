import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function RedacaoDetalhes({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const aluno = await prisma.aluno.findUnique({
    where: { userId: user.id },
  })

  if (!aluno) {
    return null
  }

  const redacao = await prisma.redacao.findFirst({
    where: {
      id: params.id,
      alunoId: aluno.id,
    },
    include: {
      turma: true,
      tema: true,
      correcoes: {
        orderBy: { corrigidoEm: 'desc' },
        include: {
          professor: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  if (!redacao) {
    notFound()
  }

  const ultimaCorrecao = redacao.correcoes[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Detalhes da Redação</h1>
        <p className="text-muted-foreground">
          {redacao.temaCustom || redacao.tema?.titulo || 'Redação'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Turma</p>
              <p className="font-medium">{redacao.turma.nome}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Versão</p>
              <p className="font-medium">{redacao.versao}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">
                {redacao.status.replace('_', ' ')}
              </p>
            </div>
            {redacao.enviadoEm && (
              <div>
                <p className="text-sm text-muted-foreground">Enviada em</p>
                <p className="font-medium">
                  {new Date(redacao.enviadoEm).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {ultimaCorrecao && (
          <Card>
            <CardHeader>
              <CardTitle>Correção</CardTitle>
              <CardDescription>
                Corrigida por {ultimaCorrecao.professor.user.nome}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">C1</p>
                  <p className="text-lg font-bold">{ultimaCorrecao.notaC1.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">C2</p>
                  <p className="text-lg font-bold">{ultimaCorrecao.notaC2.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">C3</p>
                  <p className="text-lg font-bold">{ultimaCorrecao.notaC3.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">C4</p>
                  <p className="text-lg font-bold">{ultimaCorrecao.notaC4.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">C5</p>
                  <p className="text-lg font-bold">{ultimaCorrecao.notaC5.toFixed(1)}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Nota Total</p>
                  <p className="text-3xl font-bold text-primary">
                    {ultimaCorrecao.notaTotal.toFixed(1)}
                  </p>
                </div>
              </div>
              {ultimaCorrecao.observacoes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Observações</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {ultimaCorrecao.observacoes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {redacao.proposta && (
        <Card>
          <CardHeader>
            <CardTitle>Proposta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{redacao.proposta}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Texto da Redação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap font-serif leading-relaxed">
              {redacao.texto}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

