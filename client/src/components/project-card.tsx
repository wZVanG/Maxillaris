import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Project } from '@db/schema';
import TaskList from './task-list';
import CreateTaskDialog from './create-task-dialog';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{project.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
        )}
        <TaskList tasks={project.tasks || []} />
      </CardContent>

      <CreateTaskDialog
        projectId={project.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}
