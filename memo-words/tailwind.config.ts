import type { Config } from 'tailwindcss'

// Tailwind 4 korzysta głównie z dyrektyw `@source` i `@theme` w CSS.
// Plik pozostawiamy minimalistyczny, aby narzędzia (np. shadcn) mogły go odczytać.
const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
}

export default config


