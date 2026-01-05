import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormNovaRedacao } from '@/components/redacao/form-nova-redacao'
import { redirect } from 'next/navigation'

export default async function NovaRedacaoPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
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
              professor: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!aluno || aluno.matriculas.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma turma ativa
            </h3>
            <p className="text-sm text-muted-foreground">
              Você precisa estar matriculado em uma turma para enviar redações.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const temas = await prisma.temaRedacao.findMany({
    where: {
      ativo: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Redação</h1>
        <p className="text-muted-foreground">
          Escreva e envie sua redação para correção
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Redação</CardTitle>
          <CardDescription>
            Preencha os dados abaixo e escreva sua redação. Você pode salvar como rascunho e enviar depois.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormNovaRedacao
            aluno={aluno}
            turmas={aluno.matriculas.map(m => m.turma)}
            temas={temas}
          />
        </CardContent>
      </Card>
    </div>
  )
}

