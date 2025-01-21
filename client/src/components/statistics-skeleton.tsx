/**
 * StatisticsSkeleton Component
 * 
 * Este componente proporciona una representación visual del estado de carga
 * para las tarjetas de estadísticas en el panel de control. Utiliza el componente
 * Skeleton de shadcn/ui para crear una animación de carga fluida y profesional.
 * 
 * Features:
 * - Grid responsivo que se ajusta a diferentes tamaños de pantalla
 * - Animación de pulso para indicar el estado de carga
 * - Mantiene la estructura visual consistente con las tarjetas de estadísticas reales
 * 
 * Ejemplo de uso:
 * ```tsx
 * {isLoading ? <StatisticsSkeleton /> : <Statistics data={data} />}
 * ```
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}