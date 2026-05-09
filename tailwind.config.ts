import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'from-emerald-500', 'to-green-600',
    'from-orange-500', 'to-red-500',
    'from-pink-500', 'to-rose-600',
    'from-yellow-400', 'to-lime-500',
    'from-amber-400', 'to-orange-500',
    'from-amber-700', 'to-stone-700',
    'from-red-500', 'to-rose-600',
    'from-cyan-500', 'to-blue-600',
    'from-green-500', 'to-emerald-600',
    'from-violet-500', 'to-purple-600',
    'from-blue-500', 'to-indigo-600',
    'bg-emerald-50', 'bg-orange-50', 'bg-pink-50', 'bg-lime-50', 'bg-amber-50',
    'bg-red-50', 'bg-cyan-50', 'bg-green-50', 'bg-violet-50', 'bg-blue-50',
    'dark:bg-emerald-950/30', 'dark:bg-orange-950/30', 'dark:bg-pink-950/30',
    'dark:bg-lime-950/30', 'dark:bg-amber-950/30', 'dark:bg-red-950/30',
    'dark:bg-cyan-950/30', 'dark:bg-green-950/30', 'dark:bg-violet-950/30',
    'dark:bg-blue-950/30',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
