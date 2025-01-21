import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';

interface CollaboratorsDialogProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborators: Array<{
    id: number;
    user: {
      id: number;
      username: string;
    };
  }>;
  isOwner?: boolean;
}

export default function CollaboratorsDialog({
  projectId,
  open,
  onOpenChange,
  collaborators,
  isOwner
}: CollaboratorsDialogProps) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      return toast({
        title: 'Error',
        description: 'Por favor ingresa un nombre de usuario',
        variant: 'destructive',
      });
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: 'Éxito',
        description: 'Colaborador añadido correctamente',
      });
      setUsername('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al añadir colaborador',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCollaborator = async (userId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: 'Éxito',
        description: 'Colaborador eliminado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar colaborador',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Colaboradores del Proyecto</DialogTitle>
        </DialogHeader>

        {isOwner && (
          <form onSubmit={handleAddCollaborator} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Añadir
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between p-2 rounded-lg border"
            >
              <span>{collaborator.user.username}</span>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCollaborator(collaborator.user.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {collaborators.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay colaboradores en este proyecto</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
