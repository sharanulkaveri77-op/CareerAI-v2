import IconChip from './IconChip'

export default function StatCard({ icon: Icon, label, value, caption, accent = 'purple' }) {
  const accentMap = {
    purple: 'bg-gradient-purple shadow-glow-purple',
    teal: 'bg-teal',
    orange: 'bg-orange',
    blue: 'bg-blue',
    danger: 'bg-danger',
  }
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className={'flex items-center justify-center rounded-xl w-11 h-11 ' + (accentMap[accent] || accentMap.purple)}>
          {Icon && <Icon size={20} className="text-white" />}
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-heading">{value}</p>
      {caption && <p className="mt-1 text-xs text-gray-500">{caption}</p>}
    </div>
  )
}
