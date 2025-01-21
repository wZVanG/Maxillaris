/**
 * Skeleton Component
 * 
 * Componente base para crear estados de carga visuales.
 * Este componente es la base para todos los skeletons de la aplicación,
 * proporcionando una animación de pulso consistente y personalizable.
 * 
 * Props:
 * @param {string} className - Clases CSS adicionales para personalizar el skeleton
 * 
 * Features:
 * - Animación de pulso suave
 * - Personalizable a través de className
 * - Integración con el sistema de temas
 * 
 * Ejemplo de uso:
 * ```tsx
 * <Skeleton className="h-4 w-[250px]" />
 * ```
 */

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }