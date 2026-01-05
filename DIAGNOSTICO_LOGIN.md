# 🔍 Diagnóstico de Problemas no Login

## Passos para Diagnosticar

### 1. Verificar se o Prisma Client está gerado
```bash
npm run db:generate
```

### 2. Verificar conexão com banco
Acesse: http://localhost:3000/api/auth/test

Deve retornar:
```json
{
  "success": true,
  "message": "Conexão com banco OK",
  "userCount": 3
}
```

### 3. Verificar se o banco tem dados
```bash
npm run db:studio
```
Abra o Prisma Studio e verifique se há usuários na tabela `users`.

### 4. Verificar variáveis de ambiente
Certifique-se de que o arquivo `.env` existe e tem:
```env
DATABASE_URL="postgres://..."
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=algum-secret-aqui
```

### 5. Verificar console do navegador
Abra o DevTools (F12) e veja se há erros no console.

### 6. Verificar console do servidor
No terminal onde está rodando `npm run dev`, veja se há erros.

## Erros Comuns

### Erro: "Cannot find module '@prisma/client'"
**Solução:**
```bash
npm install
npm run db:generate
```

### Erro: "P1001: Can't reach database server"
**Solução:**
- Verifique se `DATABASE_URL` está correto
- Verifique se o banco está acessível
- Teste a conexão: `npx prisma db pull`

### Erro: "Invalid credentials"
**Solução:**
- Verifique se executou o seed: `npm run db:seed`
- Verifique se o usuário existe no banco
- Tente criar o usuário novamente

### Erro: "Session not found"
**Solução:**
- Limpe os cookies do navegador
- Faça login novamente
- Verifique se `NEXTAUTH_SECRET` está configurado

## Teste Manual

### 1. Testar conexão com banco
```bash
curl http://localhost:3000/api/auth/test
```

### 2. Testar login via API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@redacaonotamil.com","password":"aluno123"}'
```

## Recriar Usuários

Se os usuários não existirem, execute:
```bash
npm run db:seed
```

Ou crie manualmente via Prisma Studio:
```bash
npm run db:studio
```

## Logs Detalhados

Para ver logs detalhados, adicione no início de `app/api/auth/login/route.ts`:
```typescript
console.log('Login attempt:', { email })
```

E no início de `lib/auth.ts`:
```typescript
console.log('Authenticating user:', email)
```

