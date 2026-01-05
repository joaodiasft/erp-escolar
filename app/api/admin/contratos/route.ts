import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.role.startsWith('ADMIN_')) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validar dados
    if (!data.matriculaId || !data.planoId) {
      return NextResponse.json(
        { error: 'Matrícula e plano são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe contrato ativo para esta matrícula
    const contratoExistente = await prisma.contrato.findUnique({
      where: { matriculaId: data.matriculaId },
    })

    if (contratoExistente && contratoExistente.status !== 'CANCELADO' && contratoExistente.status !== 'ENCERRADO') {
      return NextResponse.json(
        { error: 'Já existe um contrato ativo para esta matrícula' },
        { status: 400 }
      )
    }

    // Buscar plano
    const plano = await prisma.planoPagamento.findUnique({
      where: { id: data.planoId },
    })

    if (!plano) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      )
    }

    // Criar contrato
    const contrato = await prisma.contrato.create({
      data: {
        matriculaId: data.matriculaId,
        planoId: data.planoId,
        valor: data.valor || plano.valor,
        desconto: data.desconto || 0,
        valorFinal: data.valorFinal || plano.valor,
        parcelas: data.parcelas || 1,
        status: 'RASCUNHO',
        modalidade: 'PRESENCIAL', // Sempre presencial
        assinadoPresencial: true, // Sempre true
        termos: data.termos || '',
        termosPresencial: data.termos || '',
      },
    })

    // Criar cobranças se necessário
    if (data.parcelas > 1) {
      const valorParcela = data.valorFinal / data.parcelas
      const hoje = new Date()
      
      for (let i = 0; i < data.parcelas; i++) {
        const vencimento = new Date(hoje)
        vencimento.setMonth(vencimento.getMonth() + i)
        
        await prisma.cobranca.create({
          data: {
            contratoId: contrato.id,
            numero: i + 1,
            valor: valorParcela,
            vencimento,
            status: 'PENDENTE',
          },
        })
      }
    } else {
      // Cobrança única
      const vencimento = new Date()
      vencimento.setDate(vencimento.getDate() + 7) // 7 dias para pagar
      
      await prisma.cobranca.create({
        data: {
          contratoId: contrato.id,
          numero: 1,
          valor: data.valorFinal,
          vencimento,
          status: 'PENDENTE',
        },
      })
    }

    return NextResponse.json({
      contrato,
      message: 'Contrato criado com sucesso. Agende a assinatura presencial.',
    })
  } catch (error: any) {
    console.error('Erro ao criar contrato:', error)
    return NextResponse.json(
      { error: 'Erro ao criar contrato', details: error.message },
      { status: 500 }
    )
  }
}

