import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar Admin Super
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@redacaonotamil.com' },
    update: {},
    create: {
      email: 'admin@redacaonotamil.com',
      password: await hash('admin123', 12),
      nome: 'Administrador',
      role: Role.ADMIN_SUPER,
      status: 'ATIVO',
      admin: {
        create: {
          departamento: 'SUPER',
        },
      },
    },
  })

  console.log('✅ Admin criado:', adminUser.email)

  // Criar Professor
  const professorUser = await prisma.user.upsert({
    where: { email: 'professor@redacaonotamil.com' },
    update: {},
    create: {
      email: 'professor@redacaonotamil.com',
      password: await hash('prof123', 12),
      nome: 'Professor Exemplo',
      role: Role.PROFESSOR,
      status: 'ATIVO',
      professor: {
        create: {
          formacao: 'Licenciatura em Letras',
          bio: 'Professor especializado em correção de redações ENEM',
        },
      },
    },
  })

  const professor = await prisma.professor.findUnique({
    where: { userId: professorUser.id },
  })

  console.log('✅ Professor criado:', professorUser.email)

  // Criar Turma
  const turma = await prisma.turma.create({
    data: {
      nome: 'Turma A - Redação ENEM',
      descricao: 'Turma de redação para ENEM',
      horario: 'Terça 19h-20h30',
      diaSemana: 2, // Terça
      horaInicio: '19:00',
      horaFim: '20:30',
      capacidade: 30,
      status: 'ATIVA',
      professorId: professor!.id,
    },
  })

  console.log('✅ Turma criada:', turma.nome)

  // Criar Módulo
  const modulo = await prisma.modulo.create({
    data: {
      turmaId: turma.id,
      nome: 'Módulo 1 - Fundamentos',
      descricao: 'Primeiro módulo do curso',
      ordem: 1,
      dataInicio: new Date(),
      dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      status: 'EM_ANDAMENTO',
    },
  })

  console.log('✅ Módulo criado:', modulo.nome)

  // Criar Aluno
  const alunoUser = await prisma.user.upsert({
    where: { email: 'aluno@redacaonotamil.com' },
    update: {},
    create: {
      email: 'aluno@redacaonotamil.com',
      password: await hash('aluno123', 12),
      nome: 'Aluno Exemplo',
      role: Role.ALUNO,
      status: 'ATIVO',
      aluno: {
        create: {
          ra: 'AL001',
        },
      },
    },
  })

  const aluno = await prisma.aluno.findUnique({
    where: { userId: alunoUser.id },
  })

  console.log('✅ Aluno criado:', alunoUser.email)

  // Criar Matrícula
  const matricula = await prisma.matricula.create({
    data: {
      alunoId: aluno!.id,
      turmaId: turma.id,
      status: 'ATIVA',
    },
  })

  console.log('✅ Matrícula criada')

  // Criar Tema de Redação
  const tema = await prisma.temaRedacao.create({
    data: {
      titulo: 'Desafios da educação no Brasil',
      proposta: 'A partir da leitura dos textos motivadores e com base nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema "Desafios da educação no Brasil", apresentando proposta de intervenção que respeite os direitos humanos.',
      nivel: 'MEDIO',
      tags: JSON.stringify(['educação', 'Brasil', 'desafios']),
      ativo: true,
    },
  })

  console.log('✅ Tema de redação criado')

  // Criar Plano de Pagamento
  const plano = await prisma.planoPagamento.create({
    data: {
      nome: 'Plano Mensal',
      descricao: 'Pagamento mensal',
      tipo: 'MENSAL',
      valor: 299.90,
      descontoAvista: 50,
      parcelas: 1,
      ativo: true,
    },
  })

  console.log('✅ Plano de pagamento criado')

  // Criar Contrato
  const contrato = await prisma.contrato.create({
    data: {
      matriculaId: matricula.id,
      planoId: plano.id,
      valor: plano.valor,
      valorFinal: plano.valor - (plano.valor * plano.descontoAvista / 100),
      parcelas: 1,
      status: 'ATIVO',
      assinadoEm: new Date(),
    },
  })

  console.log('✅ Contrato criado')

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📝 Credenciais de acesso:')
  console.log('Admin: admin@redacaonotamil.com / admin123')
  console.log('Professor: professor@redacaonotamil.com / prof123')
  console.log('Aluno: aluno@redacaonotamil.com / aluno123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

