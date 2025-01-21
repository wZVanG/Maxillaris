import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, FolderKanban, CheckSquare, ListTodo, PercentSquare } from 'lucide-react';
import { getStatistics } from '@/lib/grpc-client';
import { useUser } from '@/hooks/use-user';
import StatisticsSkeleton from '@/components/statistics-skeleton';

interface Statistics {
  project_count: number;
  task_count: number;
  completed_task_count: number;
}

export default function Dashboard() {
  const { user } = useUser();

  const { data: stats, isLoading } = useQuery<Statistics>({
    queryKey: ['statistics'],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return getStatistics(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="p-6 animate-in fade-in-50">
        <h1 className="text-3xl font-bold mb-6">Panel Maxillaris</h1>
        <StatisticsSkeleton />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Panel Maxillaris</h1>
        <p className="text-red-500">Error al cargar las estadísticas. Por favor, intente nuevamente.</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Proyectos Totales',
      value: stats.project_count,
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      title: 'Tareas Totales',
      value: stats.task_count,
      icon: <ListTodo className="h-4 w-4" />,
    },
    {
      title: 'Tareas Completadas',
      value: stats.completed_task_count,
      icon: <CheckSquare className="h-4 w-4" />,
    },
    {
      title: 'Tasa de Completitud',
      value: stats.task_count ?
        `${Math.round((stats.completed_task_count / stats.task_count) * 100)}%` :
        '0%',
      icon: <PercentSquare className="h-4 w-4" />,
    },
  ];

  return (
    <div className="p-6 animate-in fade-in-50">
      <h1 className="text-3xl font-bold mb-6">Panel Maxillaris</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}