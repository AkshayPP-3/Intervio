import { Link } from 'react-router-dom'
import { AuthForm } from '../components/AuthForm'
import { useAuth } from '../../../hooks/useAuth'

export function Register() {
  const { register } = useAuth()
  return (
    <>
      <h2 className="mb-4 text-sm font-bold text-white">Create your account</h2>
      <AuthForm mode="register" onSubmit={register} />
      <p className="mt-4 text-center text-[11px] text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-300 hover:text-blue-200">
          Sign in
        </Link>
      </p>
    </>
  )
}
