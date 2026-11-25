import { Link } from 'react-router-dom'

/**
 * The server has no password-reset endpoint yet (no /auth/forgot-password),
 * so this page says so instead of pretending to send an email.
 */
export function ForgotPassword() {
  return (
    <>
      <h2 className="text-sm font-bold text-white">Forgot your password?</h2>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        Password reset by email is not available yet. You can create a new account with a different email, or
        ask the Intervio administrator to reset your password.
      </p>
      <div className="mt-4 flex gap-3 text-[11px]">
        <Link to="/login" className="text-blue-300 hover:text-blue-200">
          Back to sign in
        </Link>
        <Link to="/register" className="text-slate-400 hover:text-blue-300">
          Create an account
        </Link>
      </div>
    </>
  )
}
