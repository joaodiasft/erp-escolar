# Guia de Setup Rápido

## 🚀 Passo a Passo

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgres://9fdc19a7336fd0783bc65037423ef0367915e16d0bbcdbad7d83099afaa99581:sk_1-mH2uoWyFL9jBjZltFXq@db.prisma.io:5432/postgres?sslmode=require&pool=true"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui-gere-um-aleatorio
```

**Importante**: Gere um `NEXTAUTH_SECRET` aleatório:
```bash
openssl rand -base64 32
```

### 3. Configurar Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Sincronizar schema com o banco
npm run db:push

# Popular com dados iniciais
npm run db:seed
```

### 4. Iniciar Servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## 👤 Credenciais Padrão

Após executar o seed:

- **Admin**: admin@redacaonotamil.com / admin123
- **Professor**: professor@redacaonotamil.com / prof123  
- **Aluno**: aluno@redacaonotamil.com / aluno123

## 📝 Próximos Passos

1. **Configurar Storage** (opcional): Para upload de arquivos, configure S3 ou MinIO
2. **Configurar E-mail** (opcional): Para notificações, configure SMTP
3. **Configurar WhatsApp** (opcional): Para mensagens, configure API WhatsApp

## ⚠️ Notas Importantes

- O sistema usa sessões em memória por padrão. Em produção, configure Redis.
- O upload de arquivos precisa de storage S3-compatível configurado.
- As notificações por e-mail/WhatsApp precisam de configuração adicional.

## 🐛 Problemas Comuns

### Erro ao conectar no banco
- Verifique se a `DATABASE_URL` está correta
- Verifique se o banco está acessível

### Erro ao executar seed
- Certifique-se de que o banco está vazio ou use `db:push` primeiro
- Verifique se todas as migrations foram aplicadas

### Erro de autenticação
- Verifique se `NEXTAUTH_SECRET` está configurado
- Limpe os cookies e tente novamente

