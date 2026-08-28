import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Brain,
  Target,
  Clock,
  User,
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

const TARGET_ROLES = [
  'Full Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI / Machine Learning Engineer',
  'Data Scientist',
  'Cloud & DevOps Engineer',
  'Mobile App Developer',
  'Cybersecurity Specialist',
]

const SKILL_SUGGESTIONS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Node.js',
  'SQL',
  'System Design',
  'Docker',
  'Data Structures & Algorithms',
]

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [selectedSkills, setSelectedSkills] = useState(['React', 'JavaScript'])
  const { user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      degree: 'B.E. Computer Science',
      college: 'VTU Technological University',
      gradYear: '2026',
      targetRole: 'Full Stack Engineer',
      hoursPerWeek: '10-15 hours/week',
      experienceLevel: 'Beginner / Student',
    },
  })

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const onSubmit = (data) => {
    const onboardingProfile = {
      ...data,
      skills: selectedSkills,
      completedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem('careeriq_onboarding', JSON.stringify(onboardingProfile))
    } catch {
      /* noop */
    }
    navigate('/dashboard', { replace: true })
  }

  const nextStep = () => setStep((s) => Math.min(5, s + 1))
  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  return (
    <div className="min-h-screen bg-base-900 flex flex-col items-center justify-center p-6 text-gray-100">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <Logo size={36} withWordmark subtitle="Career Onboarding" />
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-light">
            Step {step} of 5
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-purple transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <div className="card p-6 sm:p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-purple">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Personal Information</h2>
                  <p className="text-xs text-gray-400">Let's set up your career profile details.</p>
                </div>
              </div>

              <div>
                <label className="label">Full Name</label>
                <input
                  className="input"
                  placeholder="e.g. Alex Kumar"
                  {...register('fullName', { required: 'Name is required' })}
                />
                {errors.fullName && (
                  <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="label">Current Status / Location</label>
                <input
                  className="input"
                  placeholder="e.g. Final Year Student · Bangalore, India"
                  {...register('location')}
                />
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Education & Academic Background</h2>
                  <p className="text-xs text-gray-400">Tell us about your degree and graduation timeline.</p>
                </div>
              </div>

              <div>
                <label className="label">Degree / Specialization</label>
                <input
                  className="input"
                  placeholder="e.g. B.E. Computer Science & Engineering"
                  {...register('degree', { required: 'Degree is required' })}
                />
              </div>

              <div>
                <label className="label">University / College</label>
                <input
                  className="input"
                  placeholder="e.g. R.V. College of Engineering"
                  {...register('college')}
                />
              </div>

              <div>
                <label className="label">Graduation Year</label>
                <select className="input" {...register('gradYear')}>
                  {['2024', '2025', '2026', '2027', '2028'].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Current Skills */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Brain size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Your Top Skills</h2>
                  <p className="text-xs text-gray-400">Select skills you are currently learning or know.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {SKILL_SUGGESTIONS.map((skill) => {
                  const active = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={
                        'px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-2 ' +
                        (active
                          ? 'bg-gradient-purple text-white border-transparent shadow-glow-purple'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20')
                      }
                    >
                      {active && <CheckCircle2 size={13} />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Target Role */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange">
                  <Target size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Target Career Goal</h2>
                  <p className="text-xs text-gray-400">Which role are you aiming to land next?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TARGET_ROLES.map((r) => {
                  const isSelected = watch('targetRole') === r
                  return (
                    <label
                      key={r}
                      className={
                        'card p-4 flex items-center justify-between cursor-pointer border transition ' +
                        (isSelected ? 'border-accent bg-accent/15 text-heading font-semibold' : 'border-white/10 hover:border-white/20')
                      }
                    >
                      <span className="text-xs">{r}</span>
                      <input
                        type="radio"
                        value={r}
                        className="hidden"
                        {...register('targetRole')}
                      />
                      {isSelected && <CheckCircle2 size={16} className="text-accent-light" />}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Preferences */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Commitment & Learning Style</h2>
                  <p className="text-xs text-gray-400">Customize your daily AI recommendations.</p>
                </div>
              </div>

              <div>
                <label className="label">Weekly Commitment</label>
                <select className="input" {...register('hoursPerWeek')}>
                  <option>5-10 hours/week</option>
                  <option>10-15 hours/week</option>
                  <option>15-20 hours/week</option>
                  <option>20+ hours/week (Intensive)</option>
                </select>
              </div>

              <div>
                <label className="label">Current Experience Level</label>
                <select className="input" {...register('experienceLevel')}>
                  <option>Beginner / Student</option>
                  <option>Intermediate (1-2 years projects)</option>
                  <option>Advanced (Industry experience)</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="btn-ghost flex items-center gap-2 text-xs"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary flex items-center gap-2 text-xs font-semibold px-6"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="btn-teal flex items-center gap-2 text-xs font-semibold px-6"
              >
                <Sparkles size={16} /> Generate My Career Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
