import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '../logo';
import { ThemeProvider } from '@/hooks/use-theme';

describe('Logo Component', () => {
  beforeEach(() => {
    render(
      <ThemeProvider>
        <Logo />
      </ThemeProvider>
    );
  });

  it('renders the logo image', () => {
    const logoImg = screen.getByAltText('Maxillaris Logo');
    expect(logoImg).toBeInTheDocument();
  });

  it('has correct height classes', () => {
    const logoImg = screen.getByAltText('Maxillaris Logo');
    expect(logoImg.className).toContain('h-8');
    expect(logoImg.className).toContain('md:h-10');
  });
});
