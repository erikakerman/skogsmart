import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Karta from './pages/Karta'
import Enheter from './pages/Enheter'
import Larm from './pages/Larm'
import Installningar from './pages/Installningar'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="karta" element={<Karta />} />
        <Route path="enheter" element={<Enheter />} />
        <Route path="larm" element={<Larm />} />
        <Route path="installningar" element={<Installningar />} />
      </Route>
    </Routes>
  )
}
