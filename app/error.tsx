'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Algo deu errado</CardTitle>
          </div>
          <CardDescription>
            Ocorreu um erro inesperado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'Erro desconhecido'}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Tentar novamente
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Voltar ao início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

