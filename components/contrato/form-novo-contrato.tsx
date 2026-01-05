'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

interface Aluno {
  id: string
  user: {
    nome: string
    email: string
  }
  matriculas: Array<{
    id: string
    turma: {
      id: string
      nome: string
    }
  }>
}

interface Plano {
  id: string
  nome: string
  valor: number
  descontoAvista: number | null
  parcelas: number
}

interface FormNovoContratoProps {
  alunos: Aluno[]
  planos: Plano[]
  termosPadrao: string
}

export function FormNovoContrato({ alunos, planos, termosPadrao }: FormNovoContratoProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    matriculaId: '',
    planoId: '',
    parcelas: 1,
    desconto: 0,
    termos: termosPadrao,
  })

  const matriculaSelecionada = alunos
    .flatMap(a => a.matriculas.map(m => ({ ...m, aluno: a })))
    .find(m => m.id === formData.matriculaId)

  const planoSelecionado = planos.find(p => p.id === formData.planoId)

  const calcularValorFinal = () => {
    if (!planoSelecionado) return 0
    const valorBase = planoSelecionado.valor
    const desconto = formData.desconto || 0
    return valorBase - (valorBase * desconto / 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!matriculaSelecionada || !planoSelecionado) {
        throw new Error('Selecione aluno e plano')
      }

      const valorFinal = calcularValorFinal()

      const res = await fetch('/api/admin/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valor: planoSelecionado.valor,
          valorFinal,
          modalidade: 'PRESENCIAL',
          assinadoPresencial: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar contrato')
      }

      toast({
        title: 'Sucesso!',
        description: 'Contrato criado com sucesso. Agende a assinatura presencial.',
      })

      router.push('/admin/contratos')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar contrato',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert className="border-amber-200 bg-amber-50">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <strong>Lembrete:</strong> Este contrato é exclusivamente PRESENCIAL. 
          A assinatura deve ser realizada na secretaria.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="matriculaId">Aluno e Turma *</Label>
        <Select
          value={formData.matriculaId}
          onValueChange={(value) => setFormData({ ...formData, matriculaId: value })}
          required
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione aluno e turma" />
          </SelectTrigger>
          <SelectContent>
            {alunos.flatMap(aluno =>
              aluno.matriculas.map(matricula => (
                <SelectItem key={matricula.id} value={matricula.id}>
                  {aluno.user.nome} - {matricula.turma.nome}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="planoId">Plano de Pagamento *</Label>
        <Select
          value={formData.planoId}
          onValueChange={(value) => {
            const plano = planos.find(p => p.id === value)
            setFormData({
              ...formData,
              planoId: value,
              parcelas: plano?.parcelas || 1,
            })
          }}
          required
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o plano" />
          </SelectTrigger>
          <SelectContent>
            {planos.map(plano => (
              <SelectItem key={plano.id} value={plano.id}>
                {plano.nome} - R$ {plano.valor.toFixed(2)}
                {plano.descontoAvista && plano.descontoAvista > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Desconto à vista: {plano.descontoAvista}%)
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {planoSelecionado && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parcelas">Número de Parcelas</Label>
            <Input
              id="parcelas"
              type="number"
              min="1"
              max={planoSelecionado.parcelas}
              value={formData.parcelas}
              onChange={(e) => setFormData({ ...formData, parcelas: parseInt(e.target.value) || 1 })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desconto">Desconto Adicional (%)</Label>
            <Input
              id="desconto"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.desconto}
              onChange={(e) => setFormData({ ...formData, desconto: parseFloat(e.target.value) || 0 })}
              disabled={loading}
            />
          </div>
        </div>
      )}

      {planoSelecionado && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Valor do Plano:</span>
            <span className="font-semibold">R$ {planoSelecionado.valor.toFixed(2)}</span>
          </div>
          {formData.desconto > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Desconto ({formData.desconto}%):</span>
              <span className="font-semibold text-green-600">
                - R$ {(planoSelecionado.valor * formData.desconto / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm font-medium">Valor Final:</span>
            <span className="text-xl font-bold text-primary">
              R$ {calcularValorFinal().toFixed(2)}
            </span>
          </div>
          {formData.parcelas > 1 && (
            <div className="mt-2 text-sm text-muted-foreground">
              {formData.parcelas}x de R$ {(calcularValorFinal() / formData.parcelas).toFixed(2)}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="termos">Termos do Contrato *</Label>
        <Textarea
          id="termos"
          value={formData.termos}
          onChange={(e) => setFormData({ ...formData, termos: e.target.value })}
          rows={15}
          required
          disabled={loading}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Os termos padrão já incluem a informação de que o contrato é exclusivamente PRESENCIAL.
        </p>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Contrato (Rascunho)'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

