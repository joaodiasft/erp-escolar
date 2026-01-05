'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { marcarNotificacaoComoLida, marcarTodasNotificacoesComoLidas } from '@/app/actions/notificacao'

interface Notificacao {
  id: string
  tipo: string
  titulo: string
  conteudo: string
  link: string | null
  lida: boolean
  enviadaEm: Date
}

interface NotificacoesDropdownProps {
  userId: string
}

export function NotificacoesDropdown({ userId }: NotificacoesDropdownProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotificacoes()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchNotificacoes, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotificacoes = async () => {
    try {
      const res = await fetch(`/api/notificacoes?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setNotificacoes(data.notificacoes || [])
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarComoLida = async (notificacaoId: string) => {
    await marcarNotificacaoComoLida(notificacaoId, userId)
    setNotificacoes(prev =>
      prev.map(n => n.id === notificacaoId ? { ...n, lida: true } : n)
    )
  }

  const handleMarcarTodasComoLidas = async () => {
    await marcarTodasNotificacoesComoLidas(userId)
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
  }

  const naoLidas = notificacoes.filter(n => !n.lida).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {naoLidas > 9 ? '9+' : naoLidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {naoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasComoLidas}
              className="h-auto p-0 text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notificacoes.slice(0, 10).map((notificacao) => (
              <DropdownMenuItem
                key={notificacao.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => handleMarcarComoLida(notificacao.id)}
                asChild
              >
                <Link href={notificacao.link || '#'} className="w-full">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${!notificacao.lida ? 'font-semibold' : ''}`}>
                        {notificacao.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notificacao.conteudo}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(notificacao.enviadaEm)}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1" />
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

