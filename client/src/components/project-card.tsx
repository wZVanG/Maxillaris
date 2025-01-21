import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import type { Project } from '@db/schema';
import TaskList from './task-list';
import CreateTaskDialog from './create-task-dialog';
import CollaboratorsDialog from './collaborators-dialog';

interface ProjectCardProps {
  project: Project & {
    collaborators?: Array<{
      id: number;
      user: {
        id: number;
        username: string;
      };
    }>;
  };
  isOwner?: boolean;
}

export default function ProjectCard({ project, isOwner }: ProjectCardProps) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [collaboratorsDialogOpen, setCollaboratorsDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{project.title}</CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollaboratorsDialogOpen(true)}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTaskDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {project.collaborators && project.collaborators.length > 0 && (
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-muted-foreground">Colaboradores:</span>
            {project.collaborators.map((collaborator) => (
              <span key={collaborator.id} className="text-sm">
                {collaborator.user.username}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <TaskList tasks={project.tasks || []} />
      </CardContent>

      <CreateTaskDialog
        projectId={project.id}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
      />

      <CollaboratorsDialog
        projectId={project.id}
        open={collaboratorsDialogOpen}
        onOpenChange={setCollaboratorsDialogOpen}
        collaborators={project.collaborators || []}
        isOwner={isOwner}
      />
    </Card>
  );
}