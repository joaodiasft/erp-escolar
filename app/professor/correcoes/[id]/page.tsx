import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notFound } from 'next/navigation'
import { corrigirRedacao } from '@/app/actions/correcao'
import { FormCorrecao } from '@/components/correcao/form-correcao'

export default async function CorrecaoPage({ params }: { params: { id: string } }) {
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

  const redacao = await prisma.redacao.findFirst({
    where: {
      id: params.id,
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
      correcoes: {
        orderBy: { corrigidoEm: 'desc' },
        take: 1,
      },
    },
  })

  if (!redacao) {
    notFound()
  }

  const jaCorrigida = redacao.status === 'CORRIGIDA'
  const ultimaCorrecao = redacao.correcoes[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Corrigir Redação</h1>
        <p className="text-muted-foreground">
          {redacao.temaCustom || redacao.tema?.titulo || 'Redação'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Texto da Redação</CardTitle>
            <CardDescription>
              Aluno: {redacao.aluno.user.nome} • Turma: {redacao.turma.nome} • Versão{' '}
              {redacao.versao}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {redacao.proposta && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Proposta:</p>
                <p className="text-sm whitespace-pre-wrap">{redacao.proposta}</p>
              </div>
            )}
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap font-serif leading-relaxed">
                {redacao.texto}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {jaCorrigida ? 'Correção Anterior' : 'Nova Correção'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jaCorrigida && ultimaCorrecao ? (
              <div className="space-y-4">
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
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{ultimaCorrecao.notaTotal.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <FormCorrecao redacaoId={redacao.id} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

