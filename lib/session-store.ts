// Store simples de sessões em memória
// Em produção, usar Redis ou banco de dados

interface SessionData {
  userId: string
  email: string
  nome: string
  role: string
  expiresAt: number
}

const sessions = new Map<string, SessionData>()

// Limpar sessões expiradas a cada hora
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token)
    }
  }
}, 60 * 60 * 1000)

export function createSession(token: string, data: Omit<SessionData, 'expiresAt'>): void {
  sessions.set(token, {
    ...data,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
  })
}

export function getSession(token: string): SessionData | null {
  const session = sessions.get(token)
  if (!session) return null
  
  if (session.expiresAt < Date.now()) {
    sessions.delete(token)
    return null
  }
  
  return session
}

export function deleteSession(token: string): void {
  sessions.delete(token)
}

