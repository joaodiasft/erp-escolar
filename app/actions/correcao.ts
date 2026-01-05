'use server'

import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function corrigirRedacao(
  redacaoId: string,
  data: {
    notaC1: number
    notaC2: number
    notaC3: number
    notaC4: number
    notaC5: number
    comentarios?: string
    observacoes?: string
    rubrica?: string
  }
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

  const redacao = await prisma.redacao.findUnique({
    where: { id: redacaoId },
    include: {
      turma: true,
    },
  })

  if (!redacao) {
    throw new Error('Redação não encontrada')
  }

  if (redacao.turma.professorId !== professor.id) {
    throw new Error('Você não tem permissão para corrigir esta redação')
  }

  const notaTotal =
    data.notaC1 + data.notaC2 + data.notaC3 + data.notaC4 + data.notaC5

  // Criar correção
  const correcao = await prisma.correcao.create({
    data: {
      redacaoId,
      professorId: professor.id,
      versao: redacao.versao,
      notaC1: data.notaC1,
      notaC2: data.notaC2,
      notaC3: data.notaC3,
      notaC4: data.notaC4,
      notaC5: data.notaC5,
      notaTotal,
      comentarios: data.comentarios,
      observacoes: data.observacoes,
      rubrica: data.rubrica,
    },
  })

  // Atualizar status da redação
  await prisma.redacao.update({
    where: { id: redacaoId },
    data: {
      status: 'CORRIGIDA',
    },
  })

  // Buscar userId do aluno
  const aluno = await prisma.aluno.findUnique({
    where: { id: redacao.alunoId },
    select: { userId: true },
  })

  // Criar notificação para o aluno
  if (aluno) {
    await prisma.notificacao.create({
      data: {
        userId: aluno.userId,
        tipo: 'CORRECAO',
        titulo: 'Redação corrigida',
        conteudo: `Sua redação foi corrigida. Nota: ${notaTotal.toFixed(1)}`,
        link: `/aluno/redacoes/${redacaoId}`,
      },
    })
  }

  revalidatePath('/professor/correcoes')
  revalidatePath(`/aluno/redacoes/${redacaoId}`)
  
  return correcao
}

export async function solicitarReescrita(
  redacaoId: string,
  tarefas: string,
  prazo?: Date
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

  const redacao = await prisma.redacao.findUnique({
    where: { id: redacaoId },
    include: {
      turma: true,
      correcoes: {
        orderBy: { corrigidoEm: 'desc' },
        take: 1,
      },
    },
  })

  if (!redacao) {
    throw new Error('Redação não encontrada')
  }

  if (redacao.turma.professorId !== professor.id) {
    throw new Error('Você não tem permissão para solicitar reescrita desta redação')
  }

  // Criar registro de reescrita
  const reescrita = await prisma.reescrita.create({
    data: {
      redacaoId,
      correcaoId: redacao.correcoes[0]?.id,
      tarefas,
      prazo,
      status: 'PENDENTE',
    },
  })

  // Atualizar status da redação
  await prisma.redacao.update({
    where: { id: redacaoId },
    data: {
      status: 'REESCRITA_SOLICITADA',
    },
  })

  // Buscar userId do aluno
  const aluno = await prisma.aluno.findUnique({
    where: { id: redacao.alunoId },
    select: { userId: true },
  })

  // Criar notificação
  if (aluno) {
    await prisma.notificacao.create({
      data: {
        userId: aluno.userId,
        tipo: 'REESCRITA',
        titulo: 'Reescrita solicitada',
        conteudo: 'Seu professor solicitou uma reescrita da sua redação.',
        link: `/aluno/redacoes/${redacaoId}`,
      },
    })
  }

  revalidatePath('/professor/correcoes')
  revalidatePath(`/aluno/redacoes/${redacaoId}`)
  
  return reescrita
}

