import { AlertTriangle } from 'lucide-react'

function bracket(score) {
  if (score >= 80) return { label: 'Excellent', color: '#10b981' }
  if (score >= 60) return { label: 'Good', color: '#a855f7' }
  if (score >= 40) return { label: 'Fair', color: '#f97316' }
  return { label: 'Critical', color: '#ef4444' }
}

export default function CareerHealth({ score = 0 }) {
  const value = Math.min(100, Math.max(0, score))
  const { label, color } = bracket(value)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-40 h-40">
        {value < 40 && (
          <div className="absolute -top-1 -right-1 z-10">
            <AlertTriangle size={22} className="text-danger" />
          </div>
        )}
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#ffffff10"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-heading">{value}</span>
          <span className="text-[11px] uppercase tracking-wider text-gray-500">
            / 100
          </span>
        </div>
      </div>
      <p
        className="mt-2 text-sm font-semibold"
        style={{ color }}
      >
        {label}
      </p>
    </div>
  )
}
