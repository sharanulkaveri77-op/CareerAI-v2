import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-base-950 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
