import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  GraduationCap,
  Shield,
  UserPlus,
  ArrowRight,
  Sparkles,
  Brain,
  FileText,
  Moon,
  Sun,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Logo from '../components/Logo'
import { Spinner } from '../components/Feedback'

/* ------------------------------ Hero visuals ------------------------------ */

function FloatingCard({ className, children }) {
  return (
    <div
      className={
        'absolute rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-3 shadow-xl ' +
        (className || '')
      }
    >
      {children}
    </div>
  )
}

function HeroPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2a1155] via-accent to-[#4f1d95] p-12 text-white">
      {/* decorative layers */}
      <div className="absolute inset-0 login-grid-bg" />
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-fuchsia-400/25 blur-3xl" />
      <div className="absolute bottom-0 -left-24 w-[380px] h-[380px] rounded-full bg-teal/20 blur-3xl" />

      <Logo size={46} withWordmark className="relative" />

      {/* Headline */}
      <div className="relative max-w-lg">
        <span className="badge bg-white/10 text-white border border-white/20 mb-6">
          <Sparkles size={12} /> AI-powered career intelligence
        </span>
        <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
          Your career,<br />
          decoded by AI.
        </h1>
        <p className="mt-5 text-white/80 leading-relaxed">
          Practice real interviews with a voice-enabled AI interviewer, scan
          your resume like a recruiter, and get a personalized roadmap to the
          role you want.
        </p>

        <ul className="mt-8 space-y-3.5">
          {[
            { icon: Brain, text: 'Live voice interviews with instant coaching' },
            { icon: FileText, text: 'ATS-ready resume scoring in seconds' },
            { icon: Sparkles, text: 'Skill-gap analysis & curated learning' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm shrink-0">
                <Icon size={17} className="text-white" />
              </span>
              <span className="text-sm text-white/90">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating mock UI cards */}
      <div className="relative h-40 pointer-events-none select-none">
        <FloatingCard className="left-0 bottom-10 w-56 animate-pulse-slow">
          <p className="text-[11px] uppercase tracking-wider text-white/60">Resume score</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-bold">87</span>
            <span className="text-xs text-teal font-semibold mb-1 flex items-center gap-1">
              <CheckCircle2 size={13} /> ATS Pass
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-teal to-emerald-300" />
          </div>
        </FloatingCard>

        <FloatingCard className="right-4 top-0 w-64">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <p className="text-xs font-semibold">Live interview · Q3</p>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            “Tell me about a time you owned a project end-to-end…”
          </p>
        </FloatingCard>

        <FloatingCard className="right-24 bottom-0 w-48">
          <p className="text-[11px] uppercase tracking-wider text-white/60">Skill match</p>
          <div className="flex items-center gap-1.5 mt-2">
            {[82, 64, 91, 58, 76].map((h, i) => (
              <span
                key={i}
                className="w-5 rounded-md bg-white/30"
                style={{ height: `${h / 3}px` }}
              />
            ))}
            <span className="ml-auto text-xs font-bold">A+</span>
          </div>
        </FloatingCard>
      </div>
    </div>
  )
}

/* --------------------------------- Page ---------------------------------- */

export default function Login() {
  const [role, setRole] = useState('student') // student | admin
  const [mode, setMode] = useState('login') // login | signup
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { login, signup, demoLogin } = useAuth()
  const { isLight, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const switchRole = (r) => {
    setRole(r)
    setMode('login')
    setServerError('')
    setSuccessMessage('')
    reset()
  }

  const handleDemoLogin = (r = role) => {
    demoLogin(r)
    navigate(r === 'admin' ? '/admin' : '/dashboard', { replace: true })
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setServerError('')
    setSuccessMessage('')
    try {
      if (mode === 'login') {
        await login({
          email: role === 'admin' ? data.email : data.identifier,
          password: data.password,
        })
        navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true })
      } else {
        await signup({
          email: data.email,
          password: data.password,
          full_name: data.name,
          role,
          usn: data.usn,
        })
        setSuccessMessage('Account created successfully! Please sign in with your credentials.')
        setMode('login')
        reset({
          identifier: data.usn || data.email,
          password: '',
        })
      }
    } catch (err) {
      setServerError(err?.message || 'Authentication failed. Use Quick Demo Sign In below to enter instantly.')
    } finally {
      setSubmitting(false)
    }
  }

  const isAdmin = role === 'admin'
  const isSignup = mode === 'signup'

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-base-900">
      <HeroPanel />

      {/* Right — auth side */}
      <div className="relative flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 sm:px-10 pt-6">
          <div className="lg:hidden">
            <Logo size={38} withWordmark subtitle="Intelligence Platform" />
          </div>
          <button
            onClick={toggleTheme}
            className="ml-auto flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-gray-400 hover:text-heading hover:bg-white/5 transition"
            title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {isLight ? <Moon size={14} /> : <Sun size={14} />}
            {isLight ? 'Dark' : 'Light'}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10">
          <div className="w-full max-w-[440px]">
            <h2 className="page-title">
              {isAdmin ? 'Admin sign in' : isSignup ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="page-subtitle mb-7">
              {isSignup
                ? 'Start practicing smarter in under a minute.'
                : 'Sign in to continue to your career dashboard.'}
            </p>

            <div className="card p-6 sm:p-7">
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
              {!isAdmin && (
                <div className="flex mb-6 text-sm">
                  {['login', 'signup'].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m)
                        setServerError('')
                        setSuccessMessage('')
                        reset()
                      }}
                      className={
                        'flex-1 pb-2 border-b-2 transition capitalize ' +
                        (mode === m
                          ? 'border-accent text-heading font-semibold'
                          : 'border-transparent text-gray-500 hover:text-gray-300')
                      }
                    >
                      {m === 'signup' ? 'Sign up' : 'Sign in'}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {successMessage && (
                  <div className="flex items-center gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>{successMessage}</span>
                  </div>
                )}
                {(isAdmin || isSignup) && (
                  <div>
                    <label className="label">Full name</label>
                    <input
                      className="input"
                      placeholder="e.g. Alex Kumar"
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

                {!isAdmin && !isSignup && (
                  <div>
                    <label className="label">USN or Email</label>
                    <input
                      className="input"
                      placeholder="USN or email"
                      autoComplete="username"
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
                      autoComplete="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Enter a valid email',
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-xs text-danger mt-1">{errors.email.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="At least 6 characters"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
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
                  <p className="text-xs text-danger text-center bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full !py-3"
                >
                  {submitting ? (
                    <Spinner />
                  ) : isSignup ? (
                    <>
                      <UserPlus size={16} /> Create account
                    </>
                  ) : (
                    <>
                      Sign in <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-3 text-xs text-gray-500">OR</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDemoLogin(role)}
                  className="btn-teal w-full !py-2.5 text-xs font-semibold"
                >
                  <Sparkles size={14} /> Quick Demo {isAdmin ? 'Admin' : 'Student'} Sign In
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-gray-600 mt-6">
              CareerAI · Secure career intelligence platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
