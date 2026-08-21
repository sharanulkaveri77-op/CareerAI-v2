import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { Spinner } from './components/Feedback'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Advisor = lazy(() => import('./pages/Advisor'))
const Skills = lazy(() => import('./pages/Skills'))
const Roles = lazy(() => import('./pages/Roles'))
const Resume = lazy(() => import('./pages/Resume'))
const InterviewHub = lazy(() => import('./pages/InterviewHub'))
const InterviewAI = lazy(() => import('./pages/InterviewAI'))
const InterviewLive = lazy(() => import('./pages/InterviewLive'))
const Learning = lazy(() => import('./pages/Learning'))
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Admin = lazy(() => import('./pages/Admin'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-accent-light">
      <Spinner size={28} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advisor"
            element={
              <ProtectedRoute>
                <Advisor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedRoute>
                <Skills />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <Roles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <Resume />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/ai"
            element={
              <ProtectedRoute>
                <InterviewAI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/live"
            element={
              <ProtectedRoute>
                <InterviewLive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/live/:roomCode"
            element={
              <ProtectedRoute>
                <InterviewLive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning"
            element={
              <ProtectedRoute>
                <Learning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <Roadmap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
