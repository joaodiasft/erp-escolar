'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function marcarNotificacaoComoLida(notificacaoId: string, userId: string) {
  await prisma.notificacao.updateMany({
    where: {
      id: notificacaoId,
      userId,
    },
    data: {
      lida: true,
      lidaEm: new Date(),
    },
  })

  revalidatePath('/aluno')
  revalidatePath('/professor')
  revalidatePath('/admin')
  
  return { success: true }
}

export async function marcarTodasNotificacoesComoLidas(userId: string) {
  await prisma.notificacao.updateMany({
    where: {
      userId,
      lida: false,
    },
    data: {
      lida: true,
      lidaEm: new Date(),
    },
  })

  revalidatePath('/aluno')
  revalidatePath('/professor')
  revalidatePath('/admin')
  
  return { success: true }
}

