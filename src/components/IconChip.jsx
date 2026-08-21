import { Zap } from 'lucide-react'

export default function IconChip({ icon: Icon, size = 44, className = '', glow = false }) {
  return (
    <div
      className={
        'flex items-center justify-center rounded-xl bg-gradient-purple shadow-glow-purple ' +
        (glow ? 'shadow-glow-purple ' : '') +
        className
      }
      style={{ width: size, height: size }}
    >
      {Icon ? <Icon size={size * 0.45} className="text-white" /> : <Zap size={size * 0.45} className="text-white" />}
    </div>
  )
}
