import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Ya hay una conexión activa
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;

    try {
      const ws = new WebSocket(`${protocol}//${host}/ws`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        const token = localStorage.getItem('token');
        if (token) {
          ws.send(JSON.stringify({ type: 'AUTH', token }));
        }
      };

      ws.onmessage = (event) => {
        try {
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
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [queryClient, toast]);

  return wsRef.current;
}