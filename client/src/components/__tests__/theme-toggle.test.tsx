/**
 * Pruebas unitarias para el componente ThemeToggle
 * 
 * Este archivo verifica el correcto funcionamiento del selector de tema,
 * incluyendo la interacción del usuario y los cambios visuales.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../theme-toggle';
import { ThemeProvider } from '@/hooks/use-theme';

describe('ThemeToggle Component', () => {
  it('renders theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
  });

  it('shows dropdown menu when clicked', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Verificar que aparecen las opciones del tema
    expect(screen.getByText('Claro')).toBeDefined();
    expect(screen.getByText('Oscuro')).toBeDefined();
    expect(screen.getByText('Sistema')).toBeDefined();
  });

  it('changes theme when option is selected', () => {
    const setThemeMock = vi.fn();
    vi.mock('@/hooks/use-theme', () => ({
      useTheme: () => ({
        setTheme: setThemeMock,
        theme: 'light'
      })
    }));

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Seleccionar tema oscuro
    fireEvent.click(screen.getByText('Oscuro'));
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('has accessible label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    // Verificar que existe el texto para lectores de pantalla
    expect(screen.getByText('Cambiar tema')).toBeDefined();
  });
});
