/**
 * Theme Engine
 * Metadata-driven theme configuration and application
 * Provides runtime theme switching without rebuilding
 */

import type { ThemeConfig } from '@/types';
import { eventBus, SystemEvents } from './event-bus';

class ThemeEngine {
  private static instance: ThemeEngine;
  private currentTheme: ThemeConfig | null = null;
  private themes: Map<string, ThemeConfig> = new Map();

  private constructor() {
    this.initializeDefaultTheme();
  }

  public static getInstance(): ThemeEngine {
    if (!ThemeEngine.instance) {
      ThemeEngine.instance = new ThemeEngine();
    }
    return ThemeEngine.instance;
  }

  /**
   * Initialize default theme
   */
  private initializeDefaultTheme(): void {
    const defaultTheme: ThemeConfig = {
      id: 'theme-default',
      name: 'default',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      colors: {
        primary: '#0a0a0a',
        secondary: '#f4f4f5',
        accent: '#18181b',
        destructive: '#ef4444',
        muted: '#f4f4f5',
        mutedForeground: '#71717a',
        foreground: '#0a0a0a',
        background: '#ffffff',
        card: '#f9fafb',
        cardForeground: '#0a0a0a',
        border: '#e4e4e7',
        input: '#e4e4e7',
        ring: '#0a0a0a',
      },
      fonts: {
        sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        serif: '"Merriweather", serif',
        mono: '"Fira Code", monospace',
      },
      radius: '0.5rem',
    };

    this.themes.set('default', defaultTheme);
    this.currentTheme = defaultTheme;
  }

  /**
   * Register a theme
   */
  public registerTheme(theme: ThemeConfig): void {
    this.themes.set(theme.name, theme);
  }

  /**
   * Get theme by name
   */
  public getTheme(name?: string): ThemeConfig | null {
    if (!name) {
      return this.currentTheme;
    }
    return this.themes.get(name) || null;
  }

  /**
   * Set active theme
   */
  public setActiveTheme(name: string): boolean {
    const theme = this.themes.get(name);
    if (!theme) {
      console.warn(`[ThemeEngine] Theme not found: ${name}`);
      return false;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    eventBus.emitSync(SystemEvents.THEME_CHANGED, { theme: theme.name });
    return true;
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: ThemeConfig): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.camelToKebab(key)}`, value);
    });

    // Apply font variables
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    // Apply radius
    root.style.setProperty('--radius', theme.radius);
  }

  /**
   * Get color value
   */
  public getColor(colorName: keyof ThemeConfig['colors']): string {
    return this.currentTheme?.colors[colorName] || '#000000';
  }

  /**
   * Get font value
   */
  public getFont(fontName: keyof ThemeConfig['fonts']): string {
    return this.currentTheme?.fonts[fontName] || 'sans-serif';
  }

  /**
   * Update theme color
   */
  public updateThemeColor(colorName: keyof ThemeConfig['colors'], value: string): void {
    if (!this.currentTheme) return;

    this.currentTheme.colors[colorName] = value;
    this.currentTheme.updatedAt = new Date();

    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty(
        `--color-${this.camelToKebab(colorName)}`,
        value
      );
    }
  }

  /**
   * List all themes
   */
  public listThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get current theme
   */
  public getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  /**
   * Helper: Convert camelCase to kebab-case
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Export theme as CSS variables
   */
  public exportAsCSS(): string {
    if (!this.currentTheme) return '';

    let css = ':root {\n';

    // Colors
    Object.entries(this.currentTheme.colors).forEach(([key, value]) => {
      css += `  --color-${this.camelToKebab(key)}: ${value};\n`;
    });

    // Fonts
    Object.entries(this.currentTheme.fonts).forEach(([key, value]) => {
      css += `  --font-${key}: ${value};\n`;
    });

    // Radius
    css += `  --radius: ${this.currentTheme.radius};\n`;

    css += '}\n';

    return css;
  }
}

export const themeEngine = ThemeEngine.getInstance();
