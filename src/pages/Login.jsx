import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  GraduationCap,
  Shield,
  UserPlus,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  studentLogin,
  studentSignup,
  adminLogin,
  adminSignup,
} from '../api/auth'
import { Spinner } from '../components/Feedback'

export default function Login() {
  const [role, setRole] = useState('student') // student | admin
  const [mode, setMode] = useState('login') // login | signup
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const switchRole = (r) => {
    setRole(r)
    setMode('login')
    setServerError('')
    reset()
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setServerError('')
    try {
      let res
      if (role === 'student') {
        res =
          mode === 'login'
            ? await studentLogin(data)
            : await studentSignup(data)
      } else {
        res =
          mode === 'login' ? await adminLogin(data) : await adminSignup(data)
      }
      const { token, user } = res.data
      login(token, user)
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.userMessage || 'Authentication failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const isAdmin = role === 'admin'
  const isSignup = mode === 'signup'

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-purple shadow-glow-purple">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">CareerIQ</p>
            <p className="text-[10px] tracking-widest text-accent-light/80">
              INTELLIGENCE PLATFORM
            </p>
          </div>
        </div>

        <div className="card p-6">
          {/* Role tabs */}
          <div className="flex p-1 rounded-xl bg-base-900/70 border border-white/5 mb-5">
            {[
              { key: 'student', label: 'Student', icon: GraduationCap },
              { key: 'admin', label: 'Admin', icon: Shield },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => switchRole(key)}
                className={
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ' +
                  (role === key
                    ? 'bg-gradient-purple text-white shadow-glow-purple'
                    : 'text-gray-400 hover:text-gray-200')
                }
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Sub tabs */}
          <div className="flex mb-5 text-sm">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setServerError('')
                  reset()
                }}
                className={
                  'flex-1 pb-2 border-b-2 transition capitalize ' +
                  (mode === m
                    ? 'border-accent text-white font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-300')
                }
              >
                {m}
              </button>
            ))}
          </div>

          {isSignup && !isAdmin && (
            <p className="text-xs text-gray-500 mb-4">
              Enter your details. Your email &amp; password are finalized
              securely on the next step.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Admin signup/login share Name? No — admin uses name always */}
            {isAdmin && (
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  placeholder="Full name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="text-xs text-danger mt-1">{errors.name.message}</p>
                )}
              </div>
            )}

            {!isAdmin && isSignup && (
              <div>
                <label className="label">USN</label>
                <input
                  className="input"
                  placeholder="e.g. 1MS22CS001"
                  {...register('usn', { required: 'USN is required' })}
                />
                {errors.usn && (
                  <p className="text-xs text-danger mt-1">{errors.usn.message}</p>
                )}
              </div>
            )}

            {!isAdmin && isSignup && (
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  placeholder="Full name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="text-xs text-danger mt-1">{errors.name.message}</p>
                )}
              </div>
            )}

            {!isAdmin && !isSignup && (
              <div>
                <label className="label">USN or Email</label>
                <input
                  className="input"
                  placeholder="USN or email"
                  {...register('identifier', {
                    required: 'USN or email is required',
                  })}
                />
                {errors.identifier && (
                  <p className="text-xs text-danger mt-1">
                    {errors.identifier.message}
                  </p>
                )}
              </div>
            )}

            {(isAdmin || isSignup) && (
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-danger mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="At least 6 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
              />
              {errors.password && (
                <p className="text-xs text-danger mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {isAdmin && (
              <div>
                <label className="label">Admin invite code</label>
                <input
                  className="input"
                  placeholder="Invite code"
                  {...register('inviteCode', {
                    required: 'Invite code is required',
                  })}
                />
                {errors.inviteCode && (
                  <p className="text-xs text-danger mt-1">
                    {errors.inviteCode.message}
                  </p>
                )}
              </div>
            )}

            {serverError && (
              <p className="text-xs text-danger text-center">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? (
                <Spinner />
              ) : isSignup ? (
                <>
                  <UserPlus size={16} /> Sign Up
                </>
              ) : (
                <>
                  <ArrowRight size={16} /> Login
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-5">
          CareerIQ · Secure career intelligence
        </p>
      </div>
    </div>
  )
}
