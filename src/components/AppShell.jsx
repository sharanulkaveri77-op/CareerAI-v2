import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-60">
        <TopBar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
