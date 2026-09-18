import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-heading text-lg font-bold text-navy-950">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-navy-800">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200 ${props.className ?? ''}`}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200 ${props.className ?? ''}`}
    />
  )
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200 ${props.className ?? ''}`}
    />
  )
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-navy-950 text-white hover:opacity-90',
    ghost: 'border border-navy-900/15 text-navy-800 hover:bg-navy-900/5',
    danger: 'border border-red-200 text-red-600 hover:bg-red-50',
  }[variant]

  return (
    <button
      {...props}
      className={`rounded-full px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${styles} ${className}`}
    />
  )
}

export function Badge({ children, color = 'navy' }: { children: ReactNode; color?: 'navy' | 'gold' | 'green' | 'red' }) {
  const styles = {
    navy: 'bg-navy-900/10 text-navy-800',
    gold: 'bg-gold-100 text-gold-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
  }[color]
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles}`}>{children}</span>
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-navy-400">{children}</p>
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-red-600">{children}</p>
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { value: T; label: string }[]
  active: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-navy-900/10">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
            active === t.value
              ? 'border-gold-500 text-navy-950'
              : 'border-transparent text-navy-400 hover:text-navy-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
