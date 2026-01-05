import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { FormNovoContrato } from '@/components/contrato/form-novo-contrato'

export default async function NovoContratoPage() {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    return null
  }

  const alunos = await prisma.aluno.findMany({
    where: {
      user: {
        status: 'ATIVO',
      },
      matriculas: {
        none: {
          contrato: {
            status: {
              in: ['ATIVO', 'AGUARDANDO_ASSINATURA'],
            },
          },
        },
      },
    },
    include: {
      user: true,
      matriculas: {
        where: {
          status: 'ATIVA',
        },
        include: {
          turma: true,
        },
      },
    },
  })

  const planos = await prisma.planoPagamento.findMany({
    where: {
      ativo: true,
    },
    orderBy: { nome: 'asc' },
  })

  const termosPadrao = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS - MODALIDADE PRESENCIAL

IMPORTANTE: Este contrato é exclusivamente para modalidade PRESENCIAL. Todas as aulas e atividades serão realizadas presencialmente.

1. OBJETO
O presente contrato tem por objeto a prestação de serviços educacionais de curso de redação, na modalidade PRESENCIAL, conforme plano de pagamento escolhido.

2. MODALIDADE
O curso será ministrado EXCLUSIVAMENTE na modalidade PRESENCIAL, sendo obrigatória a presença física do aluno nas aulas e atividades programadas.

3. OBRIGAÇÕES DO CONTRATADO
- Ministrar as aulas conforme calendário acadêmico
- Fornecer materiais didáticos
- Realizar correções de redações
- Emitir certificados de conclusão

4. OBRIGAÇÕES DO CONTRATANTE
- Comparecer presencialmente às aulas
- Realizar os pagamentos conforme acordado
- Respeitar as normas da instituição

5. ASSINATURA
Este contrato deve ser assinado PRESENCIALMENTE na secretaria da instituição, sendo obrigatória a presença física do contratante ou responsável legal.

6. CANCELAMENTO
O cancelamento deve ser solicitado presencialmente na secretaria, com antecedência mínima de 30 dias.

Ao assinar este contrato, o contratante declara estar ciente de que se trata de modalidade PRESENCIAL e concorda com todos os termos acima.`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Contrato</h1>
        <p className="text-muted-foreground">
          Criar novo contrato - Modalidade Presencial
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Modalidade Presencial:</strong> Todos os contratos são exclusivamente presenciais.
          A assinatura deve ser realizada presencialmente na secretaria. Não há opção de modalidade online ou híbrida.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Contrato</CardTitle>
          <CardDescription>
            Preencha os dados abaixo. O contrato será criado como rascunho e deverá ser assinado presencialmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormNovoContrato
            alunos={alunos}
            planos={planos}
            termosPadrao={termosPadrao}
          />
        </CardContent>
      </Card>
    </div>
  )
}

