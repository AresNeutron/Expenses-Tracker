import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

export default {
    darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				'50': 'var(--primary-50)',
  				'100': 'var(--primary-100)',
  				'200': 'var(--primary-200)',
  				'300': 'var(--primary-300)',
  				'400': 'var(--primary-400)',
  				'500': 'var(--primary-500)',
  				'600': 'var(--primary-600)',
  				'700': 'var(--primary-700)',
  				'800': 'var(--primary-800)',
  				'900': 'var(--primary-900)',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			neutral: {
  				'50': 'var(--neutral-50)',
  				'100': 'var(--neutral-100)',
  				'200': 'var(--neutral-200)',
  				'300': 'var(--neutral-300)',
  				'400': 'var(--neutral-400)',
  				'500': 'var(--neutral-500)',
  				'600': 'var(--neutral-600)',
  				'700': 'var(--neutral-700)',
  				'800': 'var(--neutral-800)',
  				'900': 'var(--neutral-900)'
  			},
  			success: {
  				'50': 'var(--success-50)',
  				'100': 'var(--success-100)',
  				'500': 'var(--success-500)',
  				'600': 'var(--success-600)',
  				'700': 'var(--success-700)'
  			},
  			warning: {
  				'50': 'var(--warning-50)',
  				'100': 'var(--warning-100)',
  				'500': 'var(--warning-500)',
  				'600': 'var(--warning-600)',
  				'700': 'var(--warning-700)'
  			},
  			error: {
  				'50': 'var(--error-50)',
  				'100': 'var(--error-100)',
  				'500': 'var(--error-500)',
  				'600': 'var(--error-600)',
  				'700': 'var(--error-700)'
  			},
  			income: 'var(--income)',
  			expense: 'var(--expense)',
  			balance: 'var(--balance)',
  			surface: {
  				primary: 'var(--surface-primary)',
  				secondary: 'var(--surface-secondary)',
  				tertiary: 'var(--surface-tertiary)'
  			},
  			border: {
				primary: 'var(--border-primary)',
  				secondary: 'var(--border-secondary)',
  				focus: 'var(--border-focus)'
			},
  			azul: 'var(--primary-500)',
  			azulClaro: 'var(--primary-400)',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			card: 'var(--shadow-card)',
  			'card-hover': 'var(--shadow-card-hover)',
  			'input-focus': 'var(--shadow-input-focus)'
  		},
  		borderRadius: {
  			card: '12px',
  			input: '8px',
  			button: '8px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
} satisfies Config
