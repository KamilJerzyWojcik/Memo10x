import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80',
        outline: 'border-border bg-transparent text-foreground hover:bg-muted/60',
        ghost: 'border-transparent bg-transparent text-muted-foreground hover:bg-muted/60',
        destructive: 'bg-destructive text-destructive-foreground border-transparent hover:bg-destructive/90',
        subtle: 'bg-card text-card-foreground border-border hover:bg-card/80',
      },
      size: {
        sm: 'h-9 px-3 py-1.5 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-5 py-2.5 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

