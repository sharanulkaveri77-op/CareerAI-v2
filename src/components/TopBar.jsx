import { useAuth } from '../context/AuthContext'

export default function TopBar() {
  const { user } = useAuth()
  const name = user?.name || user?.email || 'User'
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center justify-end h-12 border-b border-white/5 px-8">
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-300 leading-tight">{name}</p>
          <p className="text-[11px] text-gray-500 capitalize">{user?.role || ''}</p>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-purple text-white text-xs font-semibold">
          {initials}
        </div>
      </div>
    </div>
  )
}
