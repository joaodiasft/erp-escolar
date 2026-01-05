'use server'

import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function registrarPresenca(
  encontroId: string,
  alunoId: string,
  status: string,
  justificativa?: string
) {
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
    where: { id: encontroId },
    include: {
      turma: true,
    },
  })

  if (!encontro) {
    throw new Error('Encontro não encontrado')
  }

  if (encontro.turma.professorId !== professor.id) {
    throw new Error('Você não tem permissão para registrar presença neste encontro')
  }

  // Criar ou atualizar presença
  await prisma.presenca.upsert({
    where: {
      alunoId_encontroId: {
        alunoId,
        encontroId,
      },
    },
    update: {
      status,
      justificativa: justificativa || null,
    },
    create: {
      alunoId,
      encontroId,
      status,
      justificativa: justificativa || null,
    },
  })

  revalidatePath('/professor/presenca')
  return { success: true }
}

export async function registrarPresencasEmLote(
  encontroId: string,
  presencas: Array<{ alunoId: string; status: string; justificativa?: string }>
) {
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
    where: { id: encontroId },
    include: {
      turma: true,
    },
  })

  if (!encontro) {
    throw new Error('Encontro não encontrado')
  }

  if (encontro.turma.professorId !== professor.id) {
    throw new Error('Você não tem permissão para registrar presença neste encontro')
  }

  // Registrar todas as presenças
  for (const presenca of presencas) {
    await prisma.presenca.upsert({
      where: {
        alunoId_encontroId: {
          alunoId: presenca.alunoId,
          encontroId,
        },
      },
      update: {
        status: presenca.status,
        justificativa: presenca.justificativa || null,
      },
      create: {
        alunoId: presenca.alunoId,
        encontroId,
        status: presenca.status,
        justificativa: presenca.justificativa || null,
      },
    })
  }

  // Atualizar status do encontro
  await prisma.encontro.update({
    where: { id: encontroId },
    data: {
      status: 'REALIZADO',
    },
  })

  revalidatePath('/professor/presenca')
  return { success: true }
}

