import type { ButtonHTMLAttributes, ReactNode } from 'react'

type GlassIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
  label: string
  active?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function GlassIconButton({ icon, label, active = false, size = 'medium', className = '', ...props }: GlassIconButtonProps) {
  return (
    <button
      type="button"
      className={`glass-icon-button glass-icon-button--${size} ${active ? 'is-active' : ''} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  )
}
