import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  // Estatísticas gerais
  const totalAlunos = await prisma.aluno.count({
    where: {
      user: {
        status: 'ATIVO',
      },
    },
  })

  const totalProfessores = await prisma.professor.count({
    where: {
      user: {
        status: 'ATIVO',
      },
    },
  })

  const totalTurmas = await prisma.turma.count({
    where: {
      status: 'ATIVA',
    },
  })

  const redacoesPendentes = await prisma.redacao.count({
    where: {
      status: 'EM_CORRECAO',
    },
  })

  // Financeiro (últimos 30 dias)
  const receitaMes = await prisma.pagamento.aggregate({
    where: {
      confirmado: true,
      pagoEm: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    _sum: {
      valor: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlunos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Professores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProfessores}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Turmas Ativas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTurmas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita (30 dias)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {receitaMes._sum.valor?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Redações Pendentes</CardTitle>
            <CardDescription>Redações aguardando correção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{redacoesPendentes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receita:</span>
                <span className="font-semibold">
                  R$ {receitaMes._sum.valor?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

