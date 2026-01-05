'use server'

import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { createUser } from '@/lib/auth'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function criarProfessor(data: {
  email: string
  password: string
  nome: string
  cpf?: string
  telefone?: string
  formacao?: string
  bio?: string
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
    Role.PROFESSOR,
    data.cpf,
    data.telefone
  )

  // Criar professor
  const professor = await prisma.professor.create({
    data: {
      userId: novoUser.id,
      formacao: data.formacao,
      bio: data.bio,
    },
  })

  revalidatePath('/admin/professores')
  return professor
}

