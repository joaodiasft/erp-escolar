import { getCurrentUser } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Video, Link as LinkIcon, Image, Download, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function MateriaisPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const aluno = await prisma.aluno.findUnique({
    where: { userId: user.id },
    include: {
      matriculas: {
        where: {
          status: 'ATIVA',
        },
        include: {
          turma: {
            include: {
              modulos: {
                include: {
                  materiais: {
                    where: {
                      OR: [
                        { publico: true },
                        { turma: { alunos: { some: { alunoId: { in: [] } } } } },
                      ],
                    },
                    orderBy: { createdAt: 'desc' },
                  },
                },
              },
              materiais: {
                where: {
                  OR: [
                    { publico: true },
                  ],
                },
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      },
    },
  })

  if (!aluno) {
    return null
  }

  // Coletar todos os materiais das turmas do aluno
  const todosMateriais: any[] = []

  aluno.matriculas.forEach(matricula => {
    // Materiais da turma
    matricula.turma.materiais.forEach(material => {
      todosMateriais.push({
        ...material,
        origem: `Turma: ${matricula.turma.nome}`,
      })
    })

    // Materiais dos módulos
    matricula.turma.modulos.forEach(modulo => {
      modulo.materiais.forEach(material => {
        todosMateriais.push({
          ...material,
          origem: `${matricula.turma.nome} - ${modulo.nome}`,
        })
      })
    })
  })

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
      case 'DOCUMENTO':
        return <FileText className="h-5 w-5" />
      case 'VIDEO':
        return <Video className="h-5 w-5" />
      case 'LINK':
        return <LinkIcon className="h-5 w-5" />
      case 'IMAGEM':
        return <Image className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const formatarTamanho = (bytes?: number) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Materiais</h1>
        <p className="text-muted-foreground mt-1">
          Acesse os materiais das suas turmas
        </p>
      </div>

      {todosMateriais.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum material disponível
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Seus materiais aparecerão aqui quando forem disponibilizados pelos professores.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todosMateriais.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getTipoIcon(material.tipo)}
                    <CardTitle className="text-base">{material.titulo}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  {material.origem}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {material.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {material.descricao}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatarTamanho(material.tamanho)}</span>
                  <span>{formatDate(material.createdAt)}</span>
                </div>
                <div className="flex gap-2">
                  {material.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir
                      </a>
                    </Button>
                  )}
                  {material.arquivo && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a href={material.arquivo} download>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

