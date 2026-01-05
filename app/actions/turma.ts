'use server'

import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function criarTurma(data: {
  nome: string
  descricao?: string
  horario: string
  diaSemana: number
  horaInicio: string
  horaFim: string
  sala?: string
  capacidade: number
  professorId: string
}) {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    throw new Error('Não autorizado')
  }

  const turma = await prisma.turma.create({
    data: {
      nome: data.nome,
      descricao: data.descricao,
      horario: data.horario,
      diaSemana: data.diaSemana,
      horaInicio: data.horaInicio,
      horaFim: data.horaFim,
      sala: data.sala,
      capacidade: data.capacidade,
      professorId: data.professorId,
      status: 'ATIVA',
    },
  })

  revalidatePath('/admin/turmas')
  return turma
}

export async function criarEncontro(data: {
  turmaId: string
  moduloId?: string
  data: Date
  horaInicio: string
  horaFim: string
  tema?: string
  descricao?: string
  sala?: string
}) {
  const user = await getCurrentUser()
  
  if (!user || (user.role !== 'PROFESSOR' && !user.role.startsWith('ADMIN_'))) {
    throw new Error('Não autorizado')
  }

  const encontro = await prisma.encontro.create({
    data: {
      turmaId: data.turmaId,
      moduloId: data.moduloId,
      data: data.data,
      horaInicio: data.horaInicio,
      horaFim: data.horaFim,
      tema: data.tema,
      descricao: data.descricao,
      sala: data.sala,
      status: 'AGENDADO',
    },
  })

  revalidatePath('/professor/turmas')
  revalidatePath('/admin/turmas')
  return encontro
}

export async function criarModulo(data: {
  turmaId: string
  nome: string
  descricao?: string
  ordem: number
  dataInicio: Date
  dataFim: Date
}) {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    throw new Error('Não autorizado')
  }

  const modulo = await prisma.modulo.create({
    data: {
      turmaId: data.turmaId,
      nome: data.nome,
      descricao: data.descricao,
      ordem: data.ordem,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      status: 'PLANEJADO',
    },
  })

  revalidatePath('/admin/turmas')
  return modulo
}

