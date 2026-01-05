'use server'

import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function criarMaterial(data: {
  titulo: string
  descricao?: string
  tipo: string
  url?: string
  arquivo?: string
  tamanho?: number
  turmaId?: string
  moduloId?: string
  encontroId?: string
  publico?: boolean
}) {
  const user = await getCurrentUser()
  
  if (!user || (user.role !== 'PROFESSOR' && !user.role.startsWith('ADMIN_'))) {
    throw new Error('Não autorizado')
  }

  const material = await prisma.material.create({
    data: {
      titulo: data.titulo,
      descricao: data.descricao,
      tipo: data.tipo as any,
      url: data.url,
      arquivo: data.arquivo,
      tamanho: data.tamanho,
      turmaId: data.turmaId,
      moduloId: data.moduloId,
      encontroId: data.encontroId,
      publico: data.publico || false,
      ordem: 0,
    },
  })

  revalidatePath('/aluno/materiais')
  revalidatePath('/professor/turmas')
  return material
}

