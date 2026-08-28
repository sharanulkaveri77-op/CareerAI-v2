import { Loader2 } from 'lucide-react'

export function Spinner({ size = 18, className = '' }) {
  return <Loader2 size={size} className={'animate-spin ' + className} />
}

export function EmptyState({ icon: Icon, title, caption, children }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
        {Icon && <Icon size={32} className="text-accent-light" />}
      </div>
      <p className="text-heading font-semibold">{title}</p>
      {caption && <p className="text-sm text-gray-500 mt-1 max-w-sm">{caption}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card p-6 text-center">
      <p className="text-danger font-medium">Something went wrong</p>
      <p className="text-sm text-gray-500 mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-3">
          Retry
        </button>
      )}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={'skeleton ' + className} />
}
