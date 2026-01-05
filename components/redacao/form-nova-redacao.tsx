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
import { criarRedacao, enviarRedacaoParaCorrecao } from '@/app/actions/redacao'

interface Turma {
  id: string
  nome: string
}

interface Tema {
  id: string
  titulo: string
  proposta: string | null
}

interface Aluno {
  id: string
  matriculas: Array<{
    turma: Turma
  }>
}

interface FormNovaRedacaoProps {
  aluno: Aluno
  turmas: Turma[]
  temas: Tema[]
}

export function FormNovaRedacao({ aluno, turmas, temas }: FormNovaRedacaoProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    turmaId: turmas[0]?.id || '',
    temaId: '',
    temaCustom: '',
    proposta: '',
    rascunho: '',
    texto: '',
  })

  const temaSelecionado = temas.find(t => t.id === formData.temaId)

  const handleSubmit = async (e: React.FormEvent, enviar: boolean = false) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.turmaId) {
        throw new Error('Selecione uma turma')
      }

      if (!formData.texto.trim()) {
        throw new Error('O texto da redação é obrigatório')
      }

      if (!formData.temaId && !formData.temaCustom.trim()) {
        throw new Error('Selecione um tema ou informe um tema customizado')
      }

      // Criar redação
      const redacao = await criarRedacao({
        turmaId: formData.turmaId,
        temaId: formData.temaId || undefined,
        temaCustom: formData.temaCustom || undefined,
        proposta: formData.proposta || temaSelecionado?.proposta || undefined,
        texto: formData.texto,
        rascunho: formData.rascunho || undefined,
      })

      if (enviar) {
        // Enviar para correção
        await enviarRedacaoParaCorrecao(redacao.id)
        
        toast({
          title: 'Sucesso!',
          description: 'Redação enviada para correção com sucesso.',
        })
        
        router.push('/aluno/redacoes')
      } else {
        toast({
          title: 'Rascunho salvo!',
          description: 'Redação salva como rascunho. Você pode enviar depois.',
        })
        
        router.push(`/aluno/redacoes/${redacao.id}`)
      }
      
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar redação',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="turmaId">Turma *</Label>
        <Select
          value={formData.turmaId}
          onValueChange={(value) => setFormData({ ...formData, turmaId: value })}
          required
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a turma" />
          </SelectTrigger>
          <SelectContent>
            {turmas.map(turma => (
              <SelectItem key={turma.id} value={turma.id}>
                {turma.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="temaId">Tema (opcional - pode usar tema customizado abaixo)</Label>
        <Select
          value={formData.temaId}
          onValueChange={(value) => {
            const tema = temas.find(t => t.id === value)
            setFormData({
              ...formData,
              temaId: value,
              proposta: tema?.proposta || formData.proposta,
            })
          }}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um tema do banco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tema customizado</SelectItem>
            {temas.map(tema => (
              <SelectItem key={tema.id} value={tema.id}>
                {tema.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!formData.temaId && (
        <div className="space-y-2">
          <Label htmlFor="temaCustom">Tema Customizado *</Label>
          <Input
            id="temaCustom"
            value={formData.temaCustom}
            onChange={(e) => setFormData({ ...formData, temaCustom: e.target.value })}
            placeholder="Ex: Desafios da educação no Brasil"
            disabled={loading}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="proposta">Proposta de Redação</Label>
        <Textarea
          id="proposta"
          value={formData.proposta}
          onChange={(e) => setFormData({ ...formData, proposta: e.target.value })}
          rows={4}
          placeholder="Cole aqui a proposta de redação..."
          disabled={loading}
        />
        {temaSelecionado?.proposta && (
          <p className="text-xs text-muted-foreground">
            Proposta do tema selecionado carregada automaticamente. Você pode editar.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rascunho">Rascunho (opcional)</Label>
        <Textarea
          id="rascunho"
          value={formData.rascunho}
          onChange={(e) => setFormData({ ...formData, rascunho: e.target.value })}
          rows={6}
          placeholder="Seu rascunho aqui..."
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="texto">Texto da Redação *</Label>
        <Textarea
          id="texto"
          value={formData.texto}
          onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
          rows={20}
          placeholder="Escreva sua redação aqui..."
          required
          disabled={loading}
          className="font-serif"
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 7 linhas. Máximo de 30 linhas.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleSubmit(e, false)}
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar como Rascunho'}
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading || !formData.texto.trim()}
        >
          {loading ? 'Enviando...' : 'Salvar e Enviar para Correção'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

