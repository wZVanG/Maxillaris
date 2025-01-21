/**
 * Pruebas unitarias para el componente Logo
 * 
 * Este archivo contiene las pruebas para verificar el comportamiento del Logo
 * en diferentes escenarios: tema claro/oscuro y responsive.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '../logo';
import { ThemeProvider } from '@/hooks/use-theme';

describe('Logo Component', () => {
  // Configuración inicial antes de cada prueba
  beforeEach(() => {
    // Limpiar cualquier mock anterior
    vi.clearAllMocks();
  });

  it('renders the logo image correctly', () => {
    render(
      <ThemeProvider>
        <Logo />
      </ThemeProvider>
    );

    const logoImg = screen.getByAltText('Maxillaris Logo');
    expect(logoImg).toBeDefined();
  });

  it('applies responsive height classes correctly', () => {
    render(
      <ThemeProvider>
        <Logo />
      </ThemeProvider>
    );

    const logoImg = screen.getByAltText('Maxillaris Logo');
    expect(logoImg.className).toContain('h-8'); // Móvil
    expect(logoImg.className).toContain('md:h-10'); // Desktop
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class';
    render(
      <ThemeProvider>
        <Logo className={customClass} />
      </ThemeProvider>
    );

    const logoImg = screen.getByAltText('Maxillaris Logo');
    expect(logoImg.className).toContain(customClass);
  });

  it('uses dark logo in dark mode', () => {
    // Mock matchMedia para simular modo oscuro
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(query => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))
    });

    render(
      <ThemeProvider defaultTheme="dark">
        <Logo />
      </ThemeProvider>
    );

    const logoImg = screen.getByAltText('Maxillaris Logo');
    expect(logoImg.getAttribute('src')).toBe('/m_logo_dark.png');
  });

  it('uses light logo in light mode', () => {
    // Mock matchMedia para simular modo claro
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))
    });

    render(
      <ThemeProvider defaultTheme="light">
        <Logo />
      </ThemeProvider>
    );

    const logoImg = screen.getByAltText('Maxillaris Logo');
    expect(logoImg.getAttribute('src')).toBe('/m_logo_light.png');
  });
});