/**
 * ProjectSkeleton Component
 * 
 * Este componente proporciona una representación visual del estado de carga
 * para las tarjetas de proyectos. Mantiene la misma estructura que ProjectCard
 * para evitar saltos en el layout cuando se carga el contenido real.
 * 
 * Features:
 * - Estructura consistente con ProjectCard
 * - Animaciones suaves de carga
 * - Diseño responsivo que coincide con el grid de proyectos
 * 
 * Ejemplo de uso:
 * ```tsx
 * {isLoading ? (
 *   Array.from({ length: 6 }).map((_, i) => (
 *     <ProjectSkeleton key={i} />
 *   ))
 * ) : (
 *   projects.map(project => <ProjectCard key={project.id} project={project} />)
 * )}
 * ```
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function ProjectSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}