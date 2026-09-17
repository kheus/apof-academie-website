import type { ReactNode } from 'react'

export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, var(--color-gold-500) 0, transparent 45%), radial-gradient(circle at 80% 0%, var(--color-navy-600) 0, transparent 50%)',
        }}
      />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-gold-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-navy-100/90">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
