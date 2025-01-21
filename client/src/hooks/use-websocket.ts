import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      // Enviar el token de autenticación al conectar
      const token = localStorage.getItem('token');
      if (token) {
        ws.send(JSON.stringify({ type: 'AUTH', token }));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'PROJECT_CREATED':
          toast({
            title: 'New Project Created',
            description: `Project "${data.payload.title}" has been created`,
          });
          break;
        case 'TASK_CREATED':
          toast({
            title: 'New Task Added',
            description: `Task "${data.payload.title}" has been added`,
          });
          break;
        case 'TASK_UPDATED':
          toast({
            title: 'Task Updated',
            description: `Task "${data.payload.title}" has been updated`,
          });
          break;
      }

      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [queryClient, toast]);

  return wsRef.current;
}