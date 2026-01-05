import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || user.id

    if (userId !== user.id && !user.role.startsWith('ADMIN_')) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const notificacoes = await prisma.notificacao.findMany({
      where: {
        userId,
      },
      orderBy: { enviadaEm: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      notificacoes,
    })
  } catch (error: any) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notificações', details: error.message },
      { status: 500 }
    )
  }
}

