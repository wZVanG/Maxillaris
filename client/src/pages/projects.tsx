import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import CreateProjectDialog from '@/components/create-project-dialog';
import ProjectCard from '@/components/project-card';

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
