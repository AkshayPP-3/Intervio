import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { ForgotPassword } from '../features/auth/pages/ForgotPassword'
import { Login } from '../features/auth/pages/Login'
import { Register } from '../features/auth/pages/Register'
import { Chat } from '../features/chat/Chat'
import { Dashboard } from '../features/dashboard/Dashboard'
import { Evaluation } from '../features/evaluation/Evaluation'
import { CreateInterview } from '../features/interview/pages/CreateInterview'
import { InterviewList } from '../features/interview/pages/InterviewList'
import { InterviewRoom } from '../features/interview/pages/InterviewRoom'
import { Leaderboard } from '../features/leaderboard/LeaderBoard'
import { Practice } from '../features/practice/Practice'
import { Profile } from '../features/profile/Profile'
import { Resume } from '../features/resume/Resume'
import { AuthLayout } from '../layouts/AuthLayout'
import { InterviewLayout } from '../layouts/InterviewLayout'
import { MainLayout } from '../layouts/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[15px] font-bold text-white">Page not found</h1>
      <p className="mt-2 text-xs text-slate-400">The page you are looking for does not exist.</p>
      <Link to="/dashboard" className="mt-4 rounded-md bg-slate-700 px-4 py-2 text-xs text-blue-300 hover:bg-slate-600">
        Back to dashboard
      </Link>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<InterviewLayout />}>
          <Route path="/interviews/:interviewId" element={<InterviewRoom />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interviews" element={<InterviewList />} />
          <Route path="/interviews/new" element={<CreateInterview />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/ai-assistant" element={<Chat />} />
          <Route path="/reports" element={<Evaluation />} />
          <Route path="/reports/:interviewId" element={<Evaluation />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
