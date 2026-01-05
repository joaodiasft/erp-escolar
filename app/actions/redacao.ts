'use server'

import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function criarRedacao(data: {
  turmaId: string
  temaId?: string
  temaCustom?: string
  proposta?: string
  texto: string
  rascunho?: string
}) {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'ALUNO') {
    throw new Error('Não autorizado')
  }

  const aluno = await prisma.aluno.findUnique({
    where: { userId: user.id },
  })

  if (!aluno) {
    throw new Error('Aluno não encontrado')
  }

  // Verificar se aluno está matriculado na turma
  const matricula = await prisma.matricula.findFirst({
    where: {
      alunoId: aluno.id,
      turmaId: data.turmaId,
      status: 'ATIVA',
    },
  })

  if (!matricula) {
    throw new Error('Aluno não está matriculado nesta turma')
  }

  const redacao = await prisma.redacao.create({
    data: {
      alunoId: aluno.id,
      turmaId: data.turmaId,
      temaId: data.temaId,
      temaCustom: data.temaCustom,
      proposta: data.proposta,
      texto: data.texto,
      rascunho: data.rascunho,
      status: 'ENVIADA',
      enviadoEm: new Date(),
    },
  })

  revalidatePath('/aluno/redacoes')
  return redacao
}

export async function enviarRedacaoParaCorrecao(redacaoId: string) {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'ALUNO') {
    throw new Error('Não autorizado')
  }

  const aluno = await prisma.aluno.findUnique({
    where: { userId: user.id },
  })

  if (!aluno) {
    throw new Error('Aluno não encontrado')
  }

  const redacao = await prisma.redacao.findFirst({
    where: {
      id: redacaoId,
      alunoId: aluno.id,
    },
  })

  if (!redacao) {
    throw new Error('Redação não encontrada')
  }

  const updated = await prisma.redacao.update({
    where: { id: redacaoId },
    data: {
      status: 'EM_CORRECAO',
      enviadoEm: new Date(),
      prioridade: 0, // Prioridade padrão
    },
  })

  revalidatePath('/aluno/redacoes')
  return updated
}

export async function obterRedacao(redacaoId: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Não autorizado')
  }

  const redacao = await prisma.redacao.findUnique({
    where: { id: redacaoId },
    include: {
      aluno: {
        include: {
          user: true,
        },
      },
      turma: true,
      tema: true,
      correcoes: {
        orderBy: { corrigidoEm: 'desc' },
        include: {
          professor: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  if (!redacao) {
    throw new Error('Redação não encontrada')
  }

  // Verificar permissão
  if (user.role === 'ALUNO') {
    const aluno = await prisma.aluno.findUnique({
      where: { userId: user.id },
    })
    if (redacao.alunoId !== aluno?.id) {
      throw new Error('Não autorizado')
    }
  } else if (user.role === 'PROFESSOR') {
    const professor = await prisma.professor.findUnique({
      where: { userId: user.id },
    })
    if (redacao.turma.professorId !== professor?.id) {
      throw new Error('Não autorizado')
    }
  }

  return redacao
}

