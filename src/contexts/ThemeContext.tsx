'use client';

import React, { createContext, useState, useEffect, useRef, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const themeContainerRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (themeContainerRef.current) {
      const container = themeContainerRef.current;
      container.classList.remove('light', 'dark');
      container.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div ref={themeContainerRef} className="min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
