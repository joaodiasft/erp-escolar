'use server'

import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function criarPlanejamento(data: {
  encontroId: string
  objetivos?: string
  conteudo?: string
  metodologia?: string
  recursos?: string
  avaliacao?: string
  observacoes?: string
}) {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'PROFESSOR') {
    throw new Error('Não autorizado')
  }

  const professor = await prisma.professor.findUnique({
    where: { userId: user.id },
  })

  if (!professor) {
    throw new Error('Professor não encontrado')
  }

  // Verificar se o encontro pertence a uma turma do professor
  const encontro = await prisma.encontro.findUnique({
    where: { id: data.encontroId },
    include: {
      turma: true,
    },
  })

  if (!encontro) {
    throw new Error('Encontro não encontrado')
  }

  if (encontro.turma.professorId !== professor.id) {
    throw new Error('Você não tem permissão para criar planejamento neste encontro')
  }

  const planejamento = await prisma.planejamento.upsert({
    where: { encontroId: data.encontroId },
    update: {
      objetivos: data.objetivos,
      conteudo: data.conteudo,
      metodologia: data.metodologia,
      recursos: data.recursos,
      avaliacao: data.avaliacao,
      observacoes: data.observacoes,
    },
    create: {
      encontroId: data.encontroId,
      professorId: professor.id,
      objetivos: data.objetivos,
      conteudo: data.conteudo,
      metodologia: data.metodologia,
      recursos: data.recursos,
      avaliacao: data.avaliacao,
      observacoes: data.observacoes,
    },
  })

  revalidatePath('/professor/planejamento')
  return planejamento
}

