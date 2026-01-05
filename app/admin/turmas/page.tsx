import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function TurmasPage() {
  const user = await getCurrentUser()
  
  if (!user || !user.role.startsWith('ADMIN_')) {
    return null
  }

  const turmas = await prisma.turma.findMany({
    include: {
      professor: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          alunos: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">
            Gestão de turmas - Modalidade Presencial
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/turmas/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Link>
        </Button>
      </div>

      {turmas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando uma nova turma.
            </p>
            <Button asChild>
              <Link href="/admin/turmas/nova">
                Criar Primeira Turma
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma) => (
            <Card key={turma.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{turma.nome}</CardTitle>
                    <CardDescription>
                      {turma.horario}
                    </CardDescription>
                  </div>
                  <Badge variant={turma.status === 'ATIVA' ? 'default' : 'secondary'}>
                    {turma.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Professor</p>
                    <p className="font-medium">{turma.professor.user.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alunos Matriculados</p>
                    <p className="font-medium">{turma._count.alunos} / {turma.capacidade}</p>
                  </div>
                  {turma.sala && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sala</p>
                      <p className="font-medium">{turma.sala}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/admin/turmas/${turma.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

