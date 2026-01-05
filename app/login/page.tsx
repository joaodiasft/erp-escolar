'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Login error:', data)
        throw new Error(data.error || 'Erro ao fazer login')
      }

      toast({
        title: 'Login realizado!',
        description: 'Redirecionando...',
      })

      // Redirecionar baseado no role
      switch (data.user.role) {
        case 'ALUNO':
          router.push('/aluno')
          break
        case 'PROFESSOR':
          router.push('/professor')
          break
        case 'ADMIN_COORDENACAO':
        case 'ADMIN_SECRETARIA':
        case 'ADMIN_FINANCEIRO':
        case 'ADMIN_SUPER':
          router.push('/admin')
          break
        default:
          router.push('/')
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Redação Nota Mil
          </CardTitle>
          <CardDescription className="text-base">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="text-center text-sm text-muted-foreground pt-2">
              <p>Usuários de teste disponíveis no README</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

