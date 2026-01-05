import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function AlunoRedacoes() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const aluno = await prisma.aluno.findUnique({
    where: { userId: user.id },
    include: {
      redacoes: {
        orderBy: { createdAt: 'desc' },
        include: {
          turma: true,
          tema: true,
          correcoes: {
            orderBy: { corrigidoEm: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Redações</h1>
          <p className="text-muted-foreground">
            Gerencie suas redações e acompanhe suas correções
          </p>
        </div>
        <Link href="/aluno/redacoes/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Redação
          </Button>
        </Link>
      </div>

      {aluno?.redacoes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma redação ainda
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece escrevendo sua primeira redação!
            </p>
            <Link href="/aluno/redacoes/nova">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Redação
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {aluno?.redacoes.map((redacao) => (
            <Card key={redacao.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      {redacao.temaCustom || redacao.tema?.titulo || 'Redação'}
                    </CardTitle>
                    <CardDescription>
                      Turma: {redacao.turma.nome} • Versão {redacao.versao}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium capitalize">
                      {redacao.status.replace('_', ' ')}
                    </div>
                    {redacao.correcoes.length > 0 && (
                      <div className="text-2xl font-bold text-primary">
                        {redacao.correcoes[0].notaTotal.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Enviada em: {new Date(redacao.enviadoEm || redacao.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <Link href={`/aluno/redacoes/${redacao.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

