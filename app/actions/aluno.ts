'use server'

import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { createUser } from '@/lib/auth'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function criarAluno(data: {
  email: string
  password: string
  nome: string
  cpf?: string
  telefone?: string
  ra?: string
  dataNasc?: Date
  endereco?: string
}) {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    throw new Error('Não autorizado')
  }

  // Criar usuário
  const novoUser = await createUser(
    data.email,
    data.password,
    data.nome,
    Role.ALUNO,
    data.cpf,
    data.telefone
  )

  // Criar aluno
  const aluno = await prisma.aluno.create({
    data: {
      userId: novoUser.id,
      ra: data.ra,
      dataNasc: data.dataNasc,
      endereco: data.endereco,
    },
  })

  revalidatePath('/admin/alunos')
  return aluno
}

export async function matricularAluno(data: {
  alunoId: string
  turmaId: string
}) {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    throw new Error('Não autorizado')
  }

  // Verificar se já está matriculado
  const matriculaExistente = await prisma.matricula.findUnique({
    where: {
      alunoId_turmaId: {
        alunoId: data.alunoId,
        turmaId: data.turmaId,
      },
    },
  })

  if (matriculaExistente) {
    throw new Error('Aluno já está matriculado nesta turma')
  }

  const matricula = await prisma.matricula.create({
    data: {
      alunoId: data.alunoId,
      turmaId: data.turmaId,
      status: 'ATIVA',
    },
  })

  revalidatePath('/admin/alunos')
  revalidatePath('/admin/turmas')
  return matricula
}

