import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import CreateProjectDialog from '@/components/create-project-dialog';
import ProjectCard from '@/components/project-card';
import ProjectSkeleton from '@/components/project-skeleton';

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { projects, isLoading } = useProjects();
  const { user } = useUser();

  return (
    <div className="p-6 animate-in fade-in-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Proyecto</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Mostrar skeletons durante la carga
          Array.from({ length: 6 }).map((_, i) => (
            <ProjectSkeleton key={i} />
          ))
        ) : (
          projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner={project.userId === user?.id}
            />
          ))
        )}
      </div>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}