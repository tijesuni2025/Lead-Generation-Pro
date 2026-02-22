import { react } from 'react';


// DESIGN TOKENS
export const tokens = {
  colors: {
    gray: {
      950: '#020409',  // Darkest (Gradient 1 start)
      900: '#0B1828',  // Dark Blue (Frame 48095724)
      850: '#111f33',  // Slightly lighter dark blue
      800: '#1a2d47',  // Card/surface backgrounds
      700: '#232323',  // Grey (Frame 48095720) — borders, dividers
      600: '#2a3f5f',  // Muted elements
      500: '#3d5478',  // Secondary text
      400: '#5a7194',  // Placeholder text
      300: '#8ba3c7',  // Secondary content
      200: '#b8cce6',  // Light accents
      100: '#dce8f5',  // Very light
      50: '#FFFFFF',   // White (Frame 48095721)
    },
    primary: {
      DEFAULT: '#3148B9',  // Space Blue
      50: 'rgba(49, 72, 185, 0.06)',
      100: 'rgba(49, 72, 185, 0.12)',
      200: 'rgba(49, 72, 185, 0.24)',
      hover: '#2a3fa6',
      active: '#233693',
      light: '#4a5fd4',
    },
    accent: {
      DEFAULT: '#F24C03',  // Brand Orange
      muted: 'rgba(242, 76, 3, 0.12)',
      light: '#ff6b2c',
      dark: '#d94200',
    },
    // Semantic
    success: { DEFAULT: '#10b981', muted: 'rgba(16, 185, 129, 0.12)' },
    warning: { DEFAULT: '#F24C03', muted: 'rgba(242, 76, 3, 0.12)' },  // Use brand orange
    error: { DEFAULT: '#ef4444', muted: 'rgba(239, 68, 68, 0.12)' },
    // Status-specific
    hot: { bg: 'rgba(242, 76, 3, 0.1)', text: '#F24C03', border: 'rgba(242, 76, 3, 0.3)' },  // Orange for hot
    warm: { bg: 'rgba(251, 191, 36, 0.08)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.2)' },
    cold: { bg: 'rgba(49, 72, 185, 0.1)', text: '#6b8cdc', border: 'rgba(49, 72, 185, 0.3)' },  // Space Blue for cold
    new: { bg: 'rgba(16, 185, 129, 0.08)', text: '#34d399', border: 'rgba(16, 185, 129, 0.2)' },
  },
  // Brand gradients
  gradients: {
    brand: 'linear-gradient(135deg, #3148B9 0%, #F24C03 100%)',
    brandSubtle: 'linear-gradient(135deg, rgba(49, 72, 185, 0.2) 0%, rgba(242, 76, 3, 0.1) 100%)',
    blueDark: 'linear-gradient(180deg, #0B1828 0%, #020409 100%)',
    blueRadial: 'radial-gradient(ellipse at top right, rgba(49, 72, 185, 0.15) 0%, transparent 50%)',
    orangeGlow: 'radial-gradient(ellipse at bottom left, rgba(242, 76, 3, 0.1) 0%, transparent 50%)',
    card: 'linear-gradient(135deg, rgba(49, 72, 185, 0.05) 0%, rgba(21, 34, 56, 0.5) 100%)',
  },
  spacing: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16, '2xl': 20, full: 9999 },
  shadow: {
    sm: '0 1px 2px rgba(2, 4, 9, 0.4)',
    md: '0 4px 12px rgba(2, 4, 9, 0.35)',
    lg: '0 8px 24px rgba(2, 4, 9, 0.4)',
    glow: '0 0 24px rgba(49, 72, 185, 0.2)',
    glowOrange: '0 0 24px rgba(242, 76, 3, 0.15)',
    card: '0 4px 20px rgba(2, 4, 9, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
  },
  transition: { fast: '120ms ease', base: '200ms ease', slow: '300ms ease-out' },
  font: {
    heading: '"Raleway", sans-serif',
    body: '"Montserrat", sans-serif',
    sans: '"Montserrat", sans-serif',
    mono: 'monospace',
  },
};

// Shorthand
export const c = tokens.colors;
export const sp = tokens.spacing;
export const r = tokens.radius;
export const t = tokens.transition;