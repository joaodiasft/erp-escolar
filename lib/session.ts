import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { Role } from '@prisma/client'

export interface SessionUser {
  id: string
  email: string
  nome: string
  role: Role
  avatar?: string | null
}

export interface Session {
  user: SessionUser
}

const SESSION_COOKIE_NAME = 'session_token'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  
  // Em produção, usar Redis ou banco para armazenar sessões
  // Por enquanto, vamos usar cookie httpOnly
  
  return token
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  // Em produção, validar token no Redis/banco
  // Por enquanto, vamos buscar direto do banco (não recomendado para produção)
  
  try {
    // TODO: Implementar validação de token via Redis/banco
    // Por enquanto, retornar null e fazer login novamente
    return null
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<SessionUser | null> {
  try {
    // TODO: Validar token e buscar usuário
    // Por enquanto, implementação básica
    return null
  } catch (error) {
    return null
  }
}

export async function deleteSession(token: string): Promise<void> {
  // TODO: Remover token do Redis/banco
}

