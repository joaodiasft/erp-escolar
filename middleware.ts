import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value
  const pathname = request.nextUrl.pathname

  // Rotas públicas (não precisam de autenticação)
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout', '/api/auth/test']
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Rotas de API públicas
  const isPublicApi = pathname.startsWith('/api/') && (
    pathname.startsWith('/api/auth/') || 
    pathname.startsWith('/api/public/')
  )

  // Se for rota pública, permitir acesso
  if (isPublicRoute || isPublicApi) {
    return NextResponse.next()
  }

  // Se não tiver token e não for rota pública, redirecionar para login
  if (!sessionToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    // Adicionar redirectTo para voltar após login
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

