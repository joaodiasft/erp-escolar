import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession } from '@/lib/session-store'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  if (token) {
    deleteSession(token)
  }
  
  cookieStore.delete('session_token')

  return NextResponse.json({ message: 'Logout realizado com sucesso' })
}

