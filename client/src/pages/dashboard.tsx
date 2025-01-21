import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FolderKanban, CheckSquare, ListTodo, PercentSquare } from 'lucide-react';
import { getStatistics } from '@/lib/grpc-client';
import { useUser } from '@/hooks/use-user';

interface Statistics {
  project_count: number;
  task_count: number;
  completed_task_count: number;
}

export default function Dashboard() {
  const { user } = useUser();

  const { data: stats, isLoading, error } = useQuery<Statistics>({
    queryKey: ['statistics'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const response = await fetch('/api/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      return {
        project_count: data.projectCount,
        task_count: data.taskCount,
        completed_task_count: data.completedTaskCount,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-red-500">Error loading statistics. Please try again later.</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Projects',
      value: stats.project_count,
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      title: 'Total Tasks',
      value: stats.task_count,
      icon: <ListTodo className="h-4 w-4" />,
    },
    {
      title: 'Completed Tasks',
      value: stats.completed_task_count,
      icon: <CheckSquare className="h-4 w-4" />,
    },
    {
      title: 'Completion Rate',
      value: stats.task_count ? 
        `${Math.round((stats.completed_task_count / stats.task_count) * 100)}%` : 
        '0%',
      icon: <PercentSquare className="h-4 w-4" />,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
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