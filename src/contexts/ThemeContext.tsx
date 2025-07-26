import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Listen to system theme changes when in auto mode
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    
    let shouldBeDark = false;
    
    if (newTheme === 'dark') {
      shouldBeDark = true;
    } else if (newTheme === 'auto') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    if (shouldBeDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    setIsDark(shouldBeDark);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If auto, toggle to opposite of current state
      setTheme(isDark ? 'light' : 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
