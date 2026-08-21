export default function ProgressBar({ value = 0, accent = 'purple' }) {
  const colors = {
    purple: 'bg-gradient-purple',
    teal: 'bg-teal',
    orange: 'bg-orange',
    blue: 'bg-blue',
  }
  return (
    <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
      <div
        className={'h-full rounded-full transition-all duration-500 ' + (colors[accent] || colors.purple)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
