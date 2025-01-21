/**
 * Logo Component
 * 
 * Este componente renderiza el logo de Maxillaris, adaptándose automáticamente
 * al tema actual (claro/oscuro) del sistema o el seleccionado por el usuario.
 * 
 * Props:
 * @param {string} className - Clases CSS adicionales para personalizar el logo
 * 
 * Features:
 * - Cambia automáticamente entre la versión clara y oscura del logo
 * - Responsive: se ajusta a diferentes tamaños de pantalla (móvil/desktop)
 * - Integración con el sistema de temas de la aplicación
 * 
 * Ejemplo de uso:
 * ```tsx
 * <Logo className="my-custom-class" />
 * ```
 */

import { useTheme } from "@/hooks/use-theme";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <img
      src={isDarkMode ? "/m_logo_dark.png" : "/m_logo_light.png"}
      alt="Maxillaris Logo"
      className={`h-8 md:h-10 w-auto ${className}`}
    />
  );
}