'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { corrigirRedacao } from '@/app/actions/correcao'

interface FormCorrecaoProps {
  redacaoId: string
}

export function FormCorrecao({ redacaoId }: FormCorrecaoProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [notas, setNotas] = useState({
    notaC1: '',
    notaC2: '',
    notaC3: '',
    notaC4: '',
    notaC5: '',
  })
  const [observacoes, setObservacoes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const notasNum = {
        notaC1: parseFloat(notas.notaC1),
        notaC2: parseFloat(notas.notaC2),
        notaC3: parseFloat(notas.notaC3),
        notaC4: parseFloat(notas.notaC4),
        notaC5: parseFloat(notas.notaC5),
      }

      // Validação
      if (
        isNaN(notasNum.notaC1) ||
        isNaN(notasNum.notaC2) ||
        isNaN(notasNum.notaC3) ||
        isNaN(notasNum.notaC4) ||
        isNaN(notasNum.notaC5)
      ) {
        throw new Error('Todas as notas são obrigatórias')
      }

      if (
        notasNum.notaC1 < 0 ||
        notasNum.notaC1 > 200 ||
        notasNum.notaC2 < 0 ||
        notasNum.notaC2 > 200 ||
        notasNum.notaC3 < 0 ||
        notasNum.notaC3 > 200 ||
        notasNum.notaC4 < 0 ||
        notasNum.notaC4 > 200 ||
        notasNum.notaC5 < 0 ||
        notasNum.notaC5 > 200
      ) {
        throw new Error('As notas devem estar entre 0 e 200')
      }

      await corrigirRedacao(redacaoId, {
        ...notasNum,
        observacoes: observacoes || undefined,
      })

      toast({
        title: 'Sucesso!',
        description: 'Redação corrigida com sucesso.',
      })

      router.push('/professor/correcoes')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao corrigir redação',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const notaTotal =
    parseFloat(notas.notaC1 || '0') +
    parseFloat(notas.notaC2 || '0') +
    parseFloat(notas.notaC3 || '0') +
    parseFloat(notas.notaC4 || '0') +
    parseFloat(notas.notaC5 || '0')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notaC1">C1 - Domínio da norma padrão (0-200)</Label>
        <Input
          id="notaC1"
          type="number"
          min="0"
          max="200"
          step="0.1"
          value={notas.notaC1}
          onChange={(e) => setNotas({ ...notas, notaC1: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notaC2">C2 - Compreensão da proposta (0-200)</Label>
        <Input
          id="notaC2"
          type="number"
          min="0"
          max="200"
          step="0.1"
          value={notas.notaC2}
          onChange={(e) => setNotas({ ...notas, notaC2: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notaC3">C3 - Argumentação (0-200)</Label>
        <Input
          id="notaC3"
          type="number"
          min="0"
          max="200"
          step="0.1"
          value={notas.notaC3}
          onChange={(e) => setNotas({ ...notas, notaC3: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notaC4">C4 - Coesão e coerência (0-200)</Label>
        <Input
          id="notaC4"
          type="number"
          min="0"
          max="200"
          step="0.1"
          value={notas.notaC4}
          onChange={(e) => setNotas({ ...notas, notaC4: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notaC5">C5 - Proposta de intervenção (0-200)</Label>
        <Input
          id="notaC5"
          type="number"
          min="0"
          max="200"
          step="0.1"
          value={notas.notaC5}
          onChange={(e) => setNotas({ ...notas, notaC5: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <Label>Nota Total</Label>
          <span className="text-2xl font-bold">{notaTotal.toFixed(1)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações (opcional)</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={4}
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Correção'}
      </Button>
    </form>
  )
}

