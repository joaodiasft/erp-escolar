import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Save } from 'lucide-react'
import { FormConfiguracoes } from '@/components/admin/form-configuracoes'

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    return null
  }

  // Buscar configurações
  const configuracoes = await prisma.configuracao.findMany({
    orderBy: { categoria: 'asc' },
  })

  // Agrupar por categoria
  const configsPorCategoria = configuracoes.reduce((acc, config) => {
    const categoria = config.categoria || 'GERAL'
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(config)
    return acc
  }, {} as Record<string, typeof configuracoes>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Configure o sistema
        </p>
      </div>

      <FormConfiguracoes configuracoes={configuracoes} />

      {Object.keys(configsPorCategoria).length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma configuração
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              As configurações aparecerão aqui quando forem criadas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

