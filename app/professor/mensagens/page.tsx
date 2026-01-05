import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Inbox } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export default async function ProfessorMensagensPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const mensagens = await prisma.mensagem.findMany({
    where: {
      OR: [
        { remetenteId: user.id },
        { destinatarioId: user.id },
      ],
    },
    include: {
      remetente: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      destinatario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const mensagensRecebidas = mensagens.filter(m => m.destinatarioId === user.id && !m.lida)
  const mensagensEnviadas = mensagens.filter(m => m.remetenteId === user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensagens</h1>
          <p className="text-muted-foreground mt-1">
            Suas conversas e mensagens
          </p>
        </div>
        <Button asChild>
          <Link href="/professor/mensagens/nova">
            <Send className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Não Lidas
            </CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mensagensRecebidas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enviadas
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mensagensEnviadas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mensagens.length}</div>
          </CardContent>
        </Card>
      </div>

      {mensagens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma mensagem
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Você ainda não tem mensagens.
            </p>
            <Button asChild>
              <Link href="/professor/mensagens/nova">
                Enviar Primeira Mensagem
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mensagens.map((mensagem) => {
            const isRemetente = mensagem.remetenteId === user.id
            const outroUsuario = isRemetente ? mensagem.destinatario : mensagem.remetente

            return (
              <Card key={mensagem.id} className={!mensagem.lida && !isRemetente ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {isRemetente ? 'Para' : 'De'}: {outroUsuario.nome}
                      </CardTitle>
                      {mensagem.assunto && (
                        <CardDescription>{mensagem.assunto}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!mensagem.lida && !isRemetente && (
                        <Badge variant="default">Nova</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(mensagem.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {mensagem.conteudo}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    asChild
                  >
                    <Link href={`/professor/mensagens/${mensagem.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

