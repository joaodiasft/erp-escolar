import { getCurrentUser } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, Clock, TrendingUp } from "lucide-react";

export default async function ProfessorDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const professor = await prisma.professor.findUnique({
    where: { userId: user.id },
    include: {
      turmas: {
        include: {
          _count: {
            select: { alunos: true },
          },
        },
      },
      correcoes: {
        where: {
          redacao: {
            status: "EM_CORRECAO",
          },
        },
      },
    },
  });

  const turmasAtivas =
    professor?.turmas.filter((t: any) => t.status === "ATIVA").length || 0;
  const totalAlunos =
    professor?.turmas.reduce((acc: number, t: any) => {
      const count = t._count?.alunos || 0;
      return acc + count;
    }, 0) || 0;
  const correcoesPendentes = await prisma.redacao.count({
    where: {
      status: "EM_CORRECAO",
      turma: {
        professorId: professor?.id,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo, {user.nome}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{turmasAtivas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlunos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Correções Pendentes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{correcoesPendentes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Minhas Turmas</CardTitle>
            <CardDescription>Turmas que você leciona</CardDescription>
          </CardHeader>
          <CardContent>
            {professor?.turmas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma turma atribuída ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {professor?.turmas.map((turma: any) => (
                  <div
                    key={turma.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{turma.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {turma._count?.alunos || 0} alunos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fila de Correções</CardTitle>
            <CardDescription>Redações aguardando correção</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {correcoesPendentes === 0
                ? "Nenhuma correção pendente!"
                : `${correcoesPendentes} redações aguardando correção.`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
