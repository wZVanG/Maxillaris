/**
 * ThemeToggle Component
 * 
 * Este componente proporciona una interfaz para cambiar el tema de la aplicación
 * entre claro, oscuro y sistema. Utiliza el hook useTheme para manejar los cambios
 * y shadcn/ui para los elementos de la interfaz.
 * 
 * Features:
 * - Menú desplegable con 3 opciones: Claro, Oscuro, Sistema
 * - Icono dinámico que refleja el tema actual
 * - Tooltip para mejorar la accesibilidad
 * - Animaciones suaves en los cambios de tema
 * 
 * Ejemplo de uso:
 * ```tsx
 * <ThemeToggle />
 * ```
 */

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}