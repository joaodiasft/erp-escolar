import { cookies } from 'next/headers'
import { getSession as getSessionFromStore } from './session-store'
import { SessionUser } from './session'

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value

  if (!token) {
    return null
  }

  try {
    const sessionData = getSessionFromStore(token)
    
    if (!sessionData) {
      return null
    }

    return {
      user: {
        id: sessionData.userId,
        email: sessionData.email,
        nome: sessionData.nome,
        role: sessionData.role as any,
      },
    }
  } catch (error) {
    return null
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session?.user || null
}

