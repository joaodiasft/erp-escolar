import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function ContratosPage() {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    return null
  }

  const contratos = await prisma.contrato.findMany({
    include: {
      matricula: {
        include: {
          aluno: {
            include: {
              user: true,
            },
          },
          turma: true,
        },
      },
      plano: true,
      cobrancas: {
        orderBy: { vencimento: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ATIVO: 'default',
      RASCUNHO: 'secondary',
      AGUARDANDO_ASSINATURA: 'secondary',
      SUSPENSO: 'destructive',
      CANCELADO: 'destructive',
      ENCERRADO: 'outline',
    }
    return variants[status] || 'secondary'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">
            Gestão de contratos - Modalidade Presencial
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/contratos/novo">
            <FileText className="mr-2 h-4 w-4" />
            Novo Contrato
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informação Importante</CardTitle>
          <CardDescription>
            Todos os contratos são exclusivamente presenciais. A assinatura deve ser realizada
            presencialmente na secretaria.
          </CardDescription>
        </CardHeader>
      </Card>

      {contratos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum contrato encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando um novo contrato.
            </p>
            <Button asChild>
              <Link href="/admin/contratos/novo">
                Criar Primeiro Contrato
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contratos.map((contrato) => (
            <Card key={contrato.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>
                      {contrato.matricula.aluno.user.nome}
                    </CardTitle>
                    <CardDescription>
                      Turma: {contrato.matricula.turma.nome} • Plano: {contrato.plano.nome}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(contrato.status) as any}>
                      {contrato.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      PRESENCIAL
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(contrato.valorFinal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parcelas</p>
                    <p className="text-lg font-semibold">
                      {contrato.parcelas}x de {formatCurrency(contrato.valorFinal / contrato.parcelas)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assinado em</p>
                    <p className="text-lg font-semibold">
                      {contrato.assinadoEm
                        ? formatDate(contrato.assinadoEm)
                        : 'Não assinado'}
                    </p>
                  </div>
                </div>
                {contrato.assinadoPor && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Assinado presencialmente por:</p>
                    <p className="font-medium">{contrato.assinadoPor}</p>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/contratos/${contrato.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                  {contrato.status === 'AGUARDANDO_ASSINATURA' && (
                    <Button size="sm" asChild>
                      <Link href={`/admin/contratos/${contrato.id}/assinatura`}>
                        Registrar Assinatura
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

