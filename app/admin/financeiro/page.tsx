import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function FinanceiroPage() {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    return null
  }

  // Estatísticas financeiras
  const receitaMes = await prisma.pagamento.aggregate({
    where: {
      confirmado: true,
      pagoEm: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: {
      valor: true,
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

  const cobrancasPendentes = await prisma.cobranca.count({
    where: {
      status: 'PENDENTE',
    },
  })

  const cobrancasVencidas = await prisma.cobranca.count({
    where: {
      status: 'VENCIDA',
    },
  })

  const valorPendente = await prisma.cobranca.aggregate({
    where: {
      status: {
        in: ['PENDENTE', 'VENCIDA'],
      },
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

  const ultimosPagamentos = await prisma.pagamento.findMany({
    where: {
      confirmado: true,
    },
    include: {
      aluno: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { pagoEm: 'desc' },
    take: 10,
  })

  const cobrancasVencidasList = await prisma.cobranca.findMany({
    where: {
      status: 'VENCIDA',
    },
    include: {
      contrato: {
        include: {
          matricula: {
            include: {
              aluno: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { vencimento: 'asc' },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground mt-1">
          Gestão financeira e cobranças
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita do Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(receitaMes._sum.valor || 0)}
            </div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendente
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(valorPendente._sum.valor || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cobrancasPendentes + cobrancasVencidas} cobranças
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contratos Ativos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contratosAtivos}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagamentos</CardTitle>
            <CardDescription>Pagamentos confirmados recentemente</CardDescription>
          </CardHeader>
          <CardContent>
            {ultimosPagamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pagamento ainda</p>
            ) : (
              <div className="space-y-2">
                {ultimosPagamentos.map((pagamento) => (
                  <div
                    key={pagamento.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{pagamento.aluno.user.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pagamento.pagoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(pagamento.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cobranças Vencidas</CardTitle>
            <CardDescription>Requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            {cobrancasVencidasList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma cobrança vencida</p>
            ) : (
              <div className="space-y-2">
                {cobrancasVencidasList.map((cobranca) => (
                  <div
                    key={cobranca.id}
                    className="flex items-center justify-between p-2 border rounded border-red-200 bg-red-50"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {cobranca.contrato.matricula.aluno.user.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vencida em {new Date(cobranca.vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {formatCurrency(cobranca.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

