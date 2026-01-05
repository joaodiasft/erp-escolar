'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Save } from 'lucide-react'

interface Configuracao {
  id: string
  chave: string
  valor: string
  tipo: string
  descricao: string | null
  categoria: string | null
}

interface FormConfiguracoesProps {
  configuracoes: Configuracao[]
}

export function FormConfiguracoes({ configuracoes: configsIniciais }: FormConfiguracoesProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [configuracoes, setConfiguracoes] = useState(configsIniciais)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuracoes }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar configurações')
      }

      toast({
        title: 'Sucesso!',
        description: 'Configurações salvas com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar configurações',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = (id: string, valor: string) => {
    setConfiguracoes(configs => 
      configs.map(c => c.id === id ? { ...c, valor } : c)
    )
  }

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.entries(configsPorCategoria).map(([categoria, configs]) => (
        <Card key={categoria}>
          <CardHeader>
            <CardTitle>{categoria}</CardTitle>
            <CardDescription>
              Configurações da categoria {categoria}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {configs.map((config) => (
              <div key={config.id} className="space-y-2">
                <Label htmlFor={config.id}>
                  {config.chave}
                  {config.descricao && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({config.descricao})
                    </span>
                  )}
                </Label>
                <Input
                  id={config.id}
                  type={config.tipo === 'NUMBER' ? 'number' : 'text'}
                  value={config.valor}
                  onChange={(e) => updateConfig(config.id, e.target.value)}
                  disabled={loading}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>
  )
}

