export async function getStatistics(userId: number): Promise<{
  project_count: number;
  task_count: number;
  completed_task_count: number;
}> {
  const response = await fetch('/api/statistics', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }

  return response.json();
}