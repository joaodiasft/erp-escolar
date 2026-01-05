import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Users, TrendingUp, BookOpen } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function RelatoriosPage() {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
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

  const totalRedacoes = await prisma.redacao.count()
  const redacoesCorrigidas = await prisma.redacao.count({
    where: {
      status: 'CORRIGIDA',
    },
  })

  const receitaTotal = await prisma.pagamento.aggregate({
    where: {
      confirmado: true,
    },
    _sum: {
      valor: true,
    },
  })

  const contratosAtivos = await prisma.contrato.count({
    where: {
      status: 'ATIVO',
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Relatórios e estatísticas do sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alunos Ativos
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
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTurmas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(receitaTotal._sum.valor || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Acadêmicos</CardTitle>
            <CardDescription>Relatórios sobre alunos, turmas e desempenho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Relatório de Alunos
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Relatório de Turmas
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Relatório de Desempenho
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Relatório de Redações
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Financeiros</CardTitle>
            <CardDescription>Relatórios sobre receitas, pagamentos e inadimplência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Relatório de Receitas
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Relatório de Inadimplência
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Relatório de Contratos
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileText className="mr-2 h-4 w-4" />
              Projeção Financeira
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total de Redações</p>
              <p className="text-2xl font-bold">{totalRedacoes}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Redações Corrigidas</p>
              <p className="text-2xl font-bold">{redacoesCorrigidas}</p>
              <p className="text-xs text-muted-foreground">
                {totalRedacoes > 0 ? ((redacoesCorrigidas / totalRedacoes) * 100).toFixed(1) : 0}% do total
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contratos Ativos</p>
              <p className="text-2xl font-bold">{contratosAtivos}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

