import type { ReactNode } from 'react'

export const Logo = ({ size = 22 }: { size?: number }) => (
  <span className="inline-flex items-center gap-2 font-semibold tracking-[0.2em] text-dusk-ink">
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#536F91" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" /><path d="M3 12h6M21 12h-6M12 3v6M12 21v-6" /><circle cx="12" cy="12" r="1.8" fill="#536F91" />
    </svg>FOCAS<span className="font-normal text-dusk-deep tracking-normal text-sm">AI</span>
  </span>
)
export const Glass = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`glass ${className}`}>{children}</div>
export const Badge = ({ children }: { children: ReactNode }) => <span className="chip">{children}</span>
export const Demo = () => <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">Illustrative demo data</span>

interface FieldProps { label: string; value: string; onChange: (v: string) => void; placeholder?: string; area?: boolean; max?: number; error?: string; id: string }
export function Field({ label, value, onChange, placeholder, area, max, error, id }: FieldProps) {
  const common = { id, value, placeholder, maxLength: max, className: 'input', 'aria-invalid': !!error, 'aria-describedby': error ? id + '-e' : undefined }
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      {area ? <textarea rows={3} {...common} onChange={e => onChange(e.target.value)} /> : <input {...common} onChange={e => onChange(e.target.value)} />}
      <div className="mt-1 flex justify-between text-xs"><span id={id + '-e'} role="alert" className="text-rose-700">{error}</span>{max && <span className="text-dusk-mute">{value.length}/{max}</span>}</div>
    </div>
  )
}
