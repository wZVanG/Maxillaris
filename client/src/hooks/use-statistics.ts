import { useQuery } from '@tanstack/react-query';

interface Statistics {
  project_count: number;
  task_count: number;
  completed_task_count: number;
}

export function useStatistics() {
  return useQuery<Statistics>({
    queryKey: ['/api/statistics'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
  });
}
