import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getStatistics } from '@/lib/grpc-client';
import { useUser } from '@/hooks/use-user';

interface Statistics {
  project_count: number;
  task_count: number;
  completed_task_count: number;
}

export default function Dashboard() {
  const { user } = useUser();

  const { data: stats, isLoading } = useQuery<Statistics>({
    queryKey: ['statistics', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return getStatistics(user.id);
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: 'Total Projects',
      value: stats.project_count,
    },
    {
      title: 'Total Tasks',
      value: stats.task_count,
    },
    {
      title: 'Completed Tasks',
      value: stats.completed_task_count,
    },
    {
      title: 'Completion Rate',
      value: stats.task_count ? 
        `${Math.round((stats.completed_task_count / stats.task_count) * 100)}%` : 
        '0%',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {card.title}
              </CardTitle>
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