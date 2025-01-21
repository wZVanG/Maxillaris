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

    // Usar la misma URL base que la aplicación
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);

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
                title: '¡Nuevo Proyecto!',
                description: `Se ha creado el proyecto "${data.payload.title}"`,
                variant: 'default',
                duration: 5000,
              });
              break;
            case 'TASK_CREATED':
              toast({
                title: '¡Nueva Tarea!',
                description: `Se ha añadido la tarea "${data.payload.title}"`,
                variant: 'default',
                duration: 5000,
              });
              break;
            case 'TASK_UPDATED':
              const status = data.payload.completed ? 'completada' : 'pendiente';
              toast({
                title: 'Tarea Actualizada',
                description: `La tarea "${data.payload.title}" ha sido marcada como ${status}`,
                variant: 'default',
                duration: 5000,
              });
              break;
          }

          // Refrescar los datos después de cualquier actualización
          queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
          queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Error de WebSocket:', error);
        toast({
          title: 'Error de Conexión',
          description: 'No se pudo establecer la conexión en tiempo real',
          variant: 'destructive',
        });
      };

      wsRef.current = ws;

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('Error creando conexión WebSocket:', error);
      toast({
        title: 'Error de Conexión',
        description: 'No se pudo establecer la conexión en tiempo real',
        variant: 'destructive',
      });
    }
  }, [queryClient, toast]);

  return wsRef.current;
}
