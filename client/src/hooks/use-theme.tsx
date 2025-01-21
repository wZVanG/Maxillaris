/**
 * Theme Provider y Hook para el manejo de temas
 * 
 * Este módulo proporciona la funcionalidad completa para manejar temas en la aplicación:
 * - ThemeProvider: Componente de contexto para compartir el tema actual
 * - useTheme: Hook personalizado para acceder y modificar el tema
 * 
 * Features:
 * - Persistencia del tema seleccionado en localStorage
 * - Soporte para tema claro, oscuro y detección automática del sistema
 * - Aplicación automática de clases CSS para el tema
 * - TypeScript para type safety
 * 
 * Ejemplo de uso:
 * ```tsx
 * // En el componente raíz
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * 
 * // En cualquier componente hijo
 * const { theme, setTheme } = useTheme();
 * ```
 */

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * ThemeProvider
 * 
 * Componente que proporciona el contexto del tema a toda la aplicación.
 * Maneja la persistencia del tema y su sincronización con el sistema.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * useTheme
 * 
 * Hook personalizado para acceder al tema actual y modificarlo.
 * Debe ser usado dentro de un ThemeProvider.
 * 
 * @throws Error si se usa fuera de un ThemeProvider
 * @returns {ThemeProviderState} Objeto con el tema actual y función para cambiarlo
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};