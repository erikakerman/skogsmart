import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-wrap">
        <Topbar />
        <main className="page-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
