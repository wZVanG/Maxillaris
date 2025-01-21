import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Project, Task } from "@db/schema";

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    // Añadir opciones para evitar re-peticiones innecesarias
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 5000, // Considerar los datos frescos por 5 segundos
  });

  const createProject = useMutation({
    mutationFn: async (project: { title: string; description: string }) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json() as Promise<Project>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });

  const createTask = useMutation({
    mutationFn: async ({ projectId, task }: { projectId: number; task: { title: string; description: string } }) => {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json() as Promise<Task>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json() as Promise<Task>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });

  return {
    projects,
    isLoading,
    createProject: createProject.mutateAsync,
    createTask: createTask.mutateAsync,
    toggleTask: toggleTask.mutateAsync,
  };
}