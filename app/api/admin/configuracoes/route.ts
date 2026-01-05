import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.role.startsWith('ADMIN_')) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { configuracoes } = await request.json()

    if (!Array.isArray(configuracoes)) {
      return NextResponse.json(
        { error: 'Configurações devem ser um array' },
        { status: 400 }
      )
    }

    // Atualizar cada configuração
    for (const config of configuracoes) {
      await prisma.configuracao.update({
        where: { id: config.id },
        data: { valor: config.valor },
      })
    }

    return NextResponse.json({
      message: 'Configurações atualizadas com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações', details: error.message },
      { status: 500 }
    )
  }
}

