import { Link } from 'react-router-dom'
import { AuthForm } from '../components/AuthForm'
import { useAuth } from '../../../hooks/useAuth'

export function Login() {
  const { login } = useAuth()
  return (
    <>
      <h2 className="mb-4 text-sm font-bold text-white">Sign in</h2>
      <AuthForm mode="login" onSubmit={({ email, password }) => login({ email, password })} />
      <div className="mt-4 flex items-center justify-between text-[11px]">
        <Link to="/forgot-password" className="text-slate-400 hover:text-blue-300">
          Forgot password?
        </Link>
        <Link to="/register" className="text-blue-300 hover:text-blue-200">
          Create an account
        </Link>
      </div>
    </>
  )
}
