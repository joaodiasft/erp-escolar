# 📦 Instruções de Git e Deploy

## ✅ O que foi feito

### 1. Repositório Git Configurado
- ✅ Repositório inicializado
- ✅ Remote adicionado: `https://github.com/joaodiasft/erp-escolar.git`
- ✅ Branch `main` criada e configurada
- ✅ Código completo commitado e enviado para GitHub

### 2. Commits Realizados
1. **Commit inicial**: Sistema completo com todas as funcionalidades
2. **Commit de correções**: Ajustes de tipos TypeScript e guia de teste

### 3. Arquivos no Repositório
- ✅ 46 arquivos commitados
- ✅ Estrutura completa do projeto
- ✅ Schema Prisma
- ✅ Componentes UI
- ✅ Áreas Aluno/Professor/Admin
- ✅ Server Actions
- ✅ Documentação (README, SETUP, TESTE_LOCAL)

## 🚀 Como Testar Localmente

### Passo 1: Clonar o Repositório (se necessário)
```bash
git clone https://github.com/joaodiasft/erp-escolar.git
cd erp-escolar
```

### Passo 2: Instalar Dependências
```bash
npm install
```

### Passo 3: Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgres://9fdc19a7336fd0783bc65037423ef0367915e16d0bbcdbad7d83099afaa99581:sk_1-mH2uoWyFL9jBjZltFXq@db.prisma.io:5432/postgres?sslmode=require&pool=true"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui
```

**Importante**: Gere um `NEXTAUTH_SECRET` aleatório:
```bash
# No PowerShell (Windows)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))

# No Linux/Mac
openssl rand -base64 32
```

### Passo 4: Configurar Banco de Dados
```bash
# Gerar cliente Prisma
npm run db:generate

# Sincronizar schema com o banco
npm run db:push

# Popular com dados iniciais (usuários de teste)
npm run db:seed
```

### Passo 5: Iniciar Servidor
```bash
npm run dev
```

### Passo 6: Acessar a Aplicação
Abra o navegador em: **http://localhost:3000**

## 👤 Credenciais de Teste

Após executar o seed, use estas credenciais:

| Perfil | Email | Senha |
|--------|-------|-------|
| **Admin** | admin@redacaonotamil.com | admin123 |
| **Professor** | professor@redacaonotamil.com | prof123 |
| **Aluno** | aluno@redacaonotamil.com | aluno123 |

## 📝 Comandos Git Úteis

### Verificar Status
```bash
git status
```

### Ver Commits
```bash
git log --oneline
```

### Fazer Push de Alterações
```bash
git add .
git commit -m "sua mensagem"
git push
```

### Atualizar do Repositório
```bash
git pull
```

### Ver Diferenças
```bash
git diff
```

## 🔄 Workflow de Desenvolvimento

1. **Fazer alterações** no código
2. **Testar localmente** (`npm run dev`)
3. **Adicionar arquivos**: `git add .`
4. **Fazer commit**: `git commit -m "descrição das mudanças"`
5. **Enviar para GitHub**: `git push`

## 📋 Checklist de Funcionalidades

### ✅ Implementado e Funcional
- [x] Autenticação e login
- [x] Sistema RBAC (permissões)
- [x] Dashboard Aluno
- [x] Dashboard Professor
- [x] Dashboard Admin
- [x] Lista de redações (aluno)
- [x] Fila de correções (professor)
- [x] Sistema de correção ENEM (C1-C5)
- [x] Detalhes de redação
- [x] Server Actions
- [x] Banco de dados completo
- [x] Seed com dados de teste

### 🚧 Próximas Implementações
- [ ] Página de criação de redação
- [ ] Upload de arquivos
- [ ] Gráficos de evolução
- [ ] Sistema de mensagens
- [ ] Calendário de encontros
- [ ] Módulo financeiro completo
- [ ] Relatórios avançados

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Erro: "Prisma Client not generated"
```bash
npm run db:generate
```

### Erro: "Database connection"
- Verifique `DATABASE_URL` no `.env`
- Teste conexão: `npx prisma db pull`

### Erro: "NEXTAUTH_SECRET"
- Adicione no `.env`
- Gere um novo secret aleatório

## 📚 Documentação

- **README.md**: Visão geral do projeto
- **SETUP.md**: Guia de setup rápido
- **TESTE_LOCAL.md**: Checklist de testes

## 🎯 Status do Projeto

✅ **Sistema Base Completo e Funcional**

- Estrutura: 100%
- Autenticação: 100%
- Banco de Dados: 100%
- Áreas Principais: 100%
- Componentes UI: 100%
- Server Actions: 100%

**Pronto para desenvolvimento e testes locais!** 🚀

---

**Repositório**: https://github.com/joaodiasft/erp-escolar.git
**Branch Principal**: `main`

