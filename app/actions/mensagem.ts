'use server'

import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function enviarMensagem(
  destinatarioId: string,
  assunto: string,
  conteudo: string
) {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Não autorizado')
  }

  // Verificar se o destinatário existe
  const destinatario = await prisma.user.findUnique({
    where: { id: destinatarioId },
  })

  if (!destinatario) {
    throw new Error('Destinatário não encontrado')
  }

  // Criar mensagem
  const mensagem = await prisma.mensagem.create({
    data: {
      remetenteId: user.id,
      destinatarioId,
      assunto,
      conteudo,
    },
  })

  // Criar notificação
  await prisma.notificacao.create({
    data: {
      userId: destinatarioId,
      tipo: 'MENSAGEM',
      titulo: `Nova mensagem de ${user.nome}`,
      conteudo: assunto,
      link: user.role === 'ALUNO' 
        ? `/aluno/mensagens/${mensagem.id}`
        : `/professor/mensagens/${mensagem.id}`,
    },
  })

  revalidatePath('/aluno/mensagens')
  revalidatePath('/professor/mensagens')
  
  return mensagem
}

export async function marcarMensagemComoLida(mensagemId: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Não autorizado')
  }

  const mensagem = await prisma.mensagem.findUnique({
    where: { id: mensagemId },
  })

  if (!mensagem) {
    throw new Error('Mensagem não encontrada')
  }

  if (mensagem.destinatarioId !== user.id) {
    throw new Error('Você não tem permissão para marcar esta mensagem como lida')
  }

  await prisma.mensagem.update({
    where: { id: mensagemId },
    data: {
      lida: true,
      lidaEm: new Date(),
    },
  })

  revalidatePath('/aluno/mensagens')
  revalidatePath('/professor/mensagens')
  
  return { success: true }
}

