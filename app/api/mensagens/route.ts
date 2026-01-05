import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/get-session'
import { enviarMensagem, marcarMensagemComoLida } from '@/app/actions/mensagem'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { destinatarioId, assunto, conteudo } = await request.json()

    if (!destinatarioId || !assunto || !conteudo) {
      return NextResponse.json(
        { error: 'Destinatário, assunto e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    const mensagem = await enviarMensagem(destinatarioId, assunto, conteudo)

    return NextResponse.json({
      mensagem,
      message: 'Mensagem enviada com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar mensagem' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { mensagemId } = await request.json()

    if (!mensagemId) {
      return NextResponse.json(
        { error: 'ID da mensagem é obrigatório' },
        { status: 400 }
      )
    }

    await marcarMensagemComoLida(mensagemId)

    return NextResponse.json({
      message: 'Mensagem marcada como lida',
    })
  } catch (error: any) {
    console.error('Erro ao marcar mensagem como lida:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao marcar mensagem como lida' },
      { status: 500 }
    )
  }
}

