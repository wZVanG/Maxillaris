import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Statistics {
  projectCount: number;
  taskCount: number;
  completedTaskCount: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Statistics>({
    queryKey: ['/api/statistics'],
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
      value: stats.projectCount,
    },
    {
      title: 'Total Tasks',
      value: stats.taskCount,
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTaskCount,
    },
    {
      title: 'Completion Rate',
      value: stats.taskCount ? 
        `${Math.round((stats.completedTaskCount / stats.taskCount) * 100)}%` : 
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
