# Redação Nota Mil - ERP Escolar

Sistema completo de gestão acadêmica e correção de redações ENEM.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma** (ORM)
- **PostgreSQL**
- **TailwindCSS** + **shadcn/ui**
- **NextAuth** (Autenticação)

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL (ou usar Prisma Cloud)
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd erp-escolar
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
- `DATABASE_URL`: URL de conexão do PostgreSQL
- `NEXTAUTH_SECRET`: Chave secreta para sessões (gere uma aleatória)
- `NEXTAUTH_URL`: URL da aplicação (ex: http://localhost:3000)

4. Configure o banco de dados:
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrations
npm run db:migrate

# Popular banco com dados iniciais
npm run db:seed
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 👥 Usuários Padrão (Seed)

Após executar o seed, você terá os seguintes usuários:

- **Admin**: admin@redacaonotamil.com / admin123
- **Professor**: professor@redacaonotamil.com / prof123
- **Aluno**: aluno@redacaonotamil.com / aluno123

## 📁 Estrutura do Projeto

```
├── app/                    # App Router do Next.js
│   ├── aluno/             # Área do Aluno
│   ├── professor/         # Área do Professor
│   ├── admin/             # Área do Admin
│   ├── api/               # API Routes
│   └── actions/           # Server Actions
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   └── layout/           # Componentes de layout
├── lib/                  # Utilitários e helpers
├── prisma/               # Schema e migrations
└── public/               # Arquivos estáticos
```

## 🔐 Autenticação e Permissões

O sistema possui 3 níveis de acesso:

- **ALUNO**: Acesso à área do aluno (redações, materiais, evolução)
- **PROFESSOR**: Acesso à área do professor (turmas, correções, planejamento)
- **ADMIN**: Acesso administrativo completo (gestão, financeiro, relatórios)
  - `ADMIN_COORDENACAO`
  - `ADMIN_SECRETARIA`
  - `ADMIN_FINANCEIRO`
  - `ADMIN_SUPER`

## 📚 Funcionalidades Principais

### Área do Aluno
- Dashboard com estatísticas
- Envio e gestão de redações
- Acompanhamento de correções
- Visualização de evolução (C1-C5)
- Acesso a materiais e conteúdos
- Calendário de encontros

### Área do Professor
- Dashboard com métricas
- Fila inteligente de correções
- Correção por competências ENEM (C1-C5)
- Planejamento de aulas
- Controle de presença
- Comunicação com alunos

### Área do Admin
- Gestão completa (turmas, alunos, professores)
- Módulo financeiro (planos, contratos, cobranças)
- Relatórios e analytics
- Configurações do sistema

## 🗄️ Banco de Dados

O schema Prisma está em `prisma/schema.prisma`. Principais entidades:

- **User**: Usuários do sistema
- **Aluno**: Dados do aluno
- **Professor**: Dados do professor
- **Turma**: Turmas do curso
- **Redacao**: Redações enviadas
- **Correcao**: Correções realizadas
- **Contrato**: Contratos de matrícula
- **Cobranca**: Cobranças financeiras
- E mais...

## 🔄 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start

# Banco de dados
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Sincronizar schema
npm run db:migrate     # Executar migrations
npm run db:seed        # Popular banco
npm run db:studio      # Abrir Prisma Studio
```

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. Configure o build command: `npm run build`
4. Deploy automático a cada push

### Outros provedores

O sistema é compatível com qualquer plataforma que suporte Next.js:
- Railway
- Render
- AWS
- DigitalOcean

## 📝 Notas Importantes

- **Sessões**: O sistema atual usa cookies para sessões. Em produção, recomenda-se usar Redis ou JWT.
- **Upload de arquivos**: Configure storage S3-compatível (MinIO, R2, S3) para uploads.
- **Notificações**: Configure SMTP para e-mails e API WhatsApp para mensagens.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para suporte, entre em contato através do email: suporte@redacaonotamil.com

---

Desenvolvido com ❤️ para Redação Nota Mil

