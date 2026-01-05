import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { cookies } from 'next/headers'
import { createSession } from '@/lib/session-store'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Log para debug (remover em produção)
    if (process.env.NODE_ENV === 'development') {
      console.log('Login attempt:', { email })
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Criar sessão
    const sessionToken = crypto.randomUUID()
    
    // Salvar sessão no store
    createSession(sessionToken, {
      userId: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
    })
    
    // Salvar token no cookie
    const cookieStore = await cookies()
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Login realizado com sucesso',
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login', details: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    )
  }
}

