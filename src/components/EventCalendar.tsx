import { useMemo, useState } from 'react'
import type { Audience, CalendarEvent, SchoolClass } from '../lib/types'

const AUDIENCE_LABELS: Record<Audience, string> = {
  all: 'Toute l\'école',
  teachers: 'Enseignants',
  students: 'Élèves',
  class: 'Une classe',
}

const AUDIENCE_STYLES: Record<Audience, { chip: string; dot: string; badge: string }> = {
  all: { chip: 'bg-navy-900 text-gold-200', dot: 'bg-navy-900', badge: 'bg-navy-900/10 text-navy-800' },
  teachers: { chip: 'bg-blue-600 text-white', dot: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700' },
  students: { chip: 'bg-emerald-600 text-white', dot: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  class: { chip: 'bg-gold-500 text-navy-950', dot: 'bg-gold-500', badge: 'bg-gold-100 text-gold-700' },
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function localKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isSameDay(a: Date, b: Date) {
  return localKey(a) === localKey(b)
}

function monthGrid(viewDate: Date): Date[] {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = (firstOfMonth.getDay() + 6) % 7 // Monday = 0
  const gridStart = new Date(year, month, 1 - startWeekday)
  return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i))
}

function timeRange(event: CalendarEvent) {
  const start = new Date(event.start_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (!event.end_at) return start
  const end = new Date(event.end_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${start} – ${end}`
}

export default function EventCalendar({
  events,
  classes,
  onDelete,
  canDelete,
}: {
  events: CalendarEvent[]
  classes: SchoolClass[]
  onDelete?: (id: string) => void
  canDelete?: (event: CalendarEvent) => boolean
}) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(today)

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const key = localKey(new Date(e.start_at))
      const list = map.get(key) ?? []
      list.push(e)
      map.set(key, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.start_at.localeCompare(b.start_at))
    return map
  }, [events])

  const days = useMemo(() => monthGrid(viewDate), [viewDate])
  const monthLabel = viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const selectedEvents = eventsByDay.get(localKey(selected)) ?? []
  const audiencesShown = Array.from(new Set(events.map((e) => e.audience)))

  function goToMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1))
  }

  function goToToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(today)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="rounded-2xl border border-navy-900/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-bold capitalize text-navy-950">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label="Mois précédent"
              className="flex h-8 w-8 items-center justify-center rounded-full text-navy-700 hover:bg-navy-900/5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="rounded-full border border-navy-900/15 px-3 py-1.5 text-xs font-bold text-navy-800 transition-colors hover:bg-navy-900/5"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label="Mois suivant"
              className="flex h-8 w-8 items-center justify-center rounded-full text-navy-700 hover:bg-navy-900/5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-navy-400">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = localKey(day)
            const dayEvents = eventsByDay.get(key) ?? []
            const inMonth = day.getMonth() === viewDate.getMonth()
            const isToday = isSameDay(day, today)
            const isSelected = isSameDay(day, selected)
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(day)}
                className={`flex min-h-[4.5rem] flex-col items-stretch rounded-lg p-1 text-left transition-colors sm:min-h-[5.5rem] sm:p-1.5 ${
                  isSelected ? 'bg-navy-900/[0.06] ring-2 ring-gold-500' : 'hover:bg-navy-900/[0.04]'
                } ${inMonth ? '' : 'opacity-40'}`}
              >
                <span
                  className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold sm:h-6 sm:w-6 sm:text-xs ${
                    isToday ? 'bg-gold-500 text-navy-950' : 'text-navy-700'
                  }`}
                >
                  {day.getDate()}
                </span>

                <div className="hidden flex-1 flex-col gap-0.5 sm:flex">
                  {dayEvents.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-semibold leading-tight ${AUDIENCE_STYLES[e.audience].chip}`}
                    >
                      {e.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] font-bold text-navy-400">+{dayEvents.length - 2} autre(s)</span>
                  )}
                </div>

                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 sm:hidden">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${AUDIENCE_STYLES[e.audience].dot}`} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {audiencesShown.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-navy-900/10 pt-3">
            {audiencesShown.map((a) => (
              <span key={a} className="flex items-center gap-1.5 text-xs font-semibold text-navy-500">
                <span className={`h-2 w-2 rounded-full ${AUDIENCE_STYLES[a].dot}`} />
                {AUDIENCE_LABELS[a]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-navy-900/10 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
          {selected.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        {selectedEvents.length === 0 ? (
          <p className="mt-3 text-sm text-navy-400">Aucun événement ce jour-là.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {selectedEvents.map((e) => (
              <li key={e.id} className="rounded-xl border border-navy-900/10 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-heading text-sm font-bold text-navy-950">{e.title}</p>
                  {onDelete && (!canDelete || canDelete(e)) && (
                    <button
                      onClick={() => onDelete(e.id)}
                      className="shrink-0 text-xs font-bold text-red-500 hover:text-red-700"
                      aria-label="Supprimer"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-xs font-semibold text-navy-500">{timeRange(e)}</p>
                {e.description && <p className="mt-1.5 text-sm text-navy-600">{e.description}</p>}
                <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${AUDIENCE_STYLES[e.audience].badge}`}>
                  {AUDIENCE_LABELS[e.audience]}
                  {e.audience === 'class' && e.class_id && ` — ${classes.find((c) => c.id === e.class_id)?.name ?? ''}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
