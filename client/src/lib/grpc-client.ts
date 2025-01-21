export async function getStatistics(userId: number): Promise<{
  project_count: number;
  task_count: number;
  completed_task_count: number;
}> {
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
    throw new Error('Failed to fetch statistics');
  }

  const data = await response.json();
  return {
    project_count: data.projectCount,
    task_count: data.taskCount,
    completed_task_count: data.completedTaskCount,
  };
}