import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Brain,
  FileText,
  Video,
  Search,
  Route as RouteIcon,
  BookOpen,
  CheckCircle2,
  Code2,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import Logo from '../components/Logo'

const features = [
  {
    icon: RouteIcon,
    title: 'AI Career Roadmap',
    description: 'Get a personalized, step-by-step learning roadmap tailored to your target role.',
    color: 'from-purple-500/20 to-fuchsia-500/20 text-purple-400',
  },
  {
    icon: Brain,
    title: 'Skill Gap Analysis',
    description: 'Compare your skills against industry benchmarks and target role requirements.',
    color: 'from-teal-500/20 to-emerald-500/20 text-teal-400',
  },
  {
    icon: FileText,
    title: 'AI Resume Analyzer & Builder',
    description: 'Scan your resume for ATS scoring or build a compelling, action-verb resume with AI.',
    color: 'from-orange-500/20 to-amber-500/20 text-orange-400',
  },
  {
    icon: Code2,
    title: 'DSA Practice Hub',
    description: 'Master Data Structures & Algorithms with categorized problems, hints, and progress tracking.',
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
  },
  {
    icon: HelpCircle,
    title: 'Aptitude Test Assessments',
    description: 'Practice Quantitative, Logical, Verbal, and Technical tests with instant explanations.',
    color: 'from-pink-500/20 to-rose-500/20 text-pink-400',
  },
  {
    icon: MessageSquare,
    title: 'Communication Coach',
    description: 'Improve self-introductions, HR responses, and technical vocabulary with AI feedback.',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
  },
  {
    icon: Video,
    title: 'Voice & Video Mock Interviews',
    description: 'Practice live video interviews with AI or peers and receive real-time STAR coaching.',
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400',
  },
  {
    icon: Search,
    title: 'Smart Job Discovery',
    description: 'Discover curated job opportunities matched directly to your current skill score.',
    color: 'from-violet-500/20 to-purple-500/20 text-violet-400',
  },
]

const steps = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Set up your education, degree, current skills, and target career goal.',
  },
  {
    step: '02',
    title: 'Assess Your Skill Gaps',
    description: 'Run AI diagnostic scans to identify critical skills needed for your target role.',
  },
  {
    step: '03',
    title: 'Follow Your AI Roadmap',
    description: 'Complete structured milestones, practice DSA, and build ATS-ready projects.',
  },
  {
    step: '04',
    title: 'Ace Interviews & Get Hired',
    description: 'Practice mock video interviews, optimize your resume, and land top tech offers.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-base-900 text-gray-100 selection:bg-accent selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-base-900/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size={40} withWordmark subtitle="Career Intelligence Platform" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary !py-2 !px-5 text-sm font-semibold shadow-glow-purple"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent-light text-xs font-semibold mb-6">
            <Sparkles size={14} /> AI-Powered Career Growth & Readiness Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-heading leading-[1.15]">
            Build Your Career.<br />
            <span className="bg-gradient-purple bg-clip-text text-transparent">
              Powered by Artificial Intelligence.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            CareerAI is your all-in-one intelligent career copilot. Get personalized AI roadmaps,
            skill gap diagnostics, ATS resume scoring, DSA & aptitude practice, and mock video interviews.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-base !py-3.5 !px-8 shadow-glow-purple"
            >
              Get Started Free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-ghost text-base !py-3.5 !px-8 border border-white/10"
            >
              Quick Demo Login
            </button>
          </div>

          {/* Interactive UI Mockup Preview */}
          <div className="mt-16 relative rounded-2xl border border-white/15 bg-base-850/80 backdrop-blur-xl p-4 shadow-2xl overflow-hidden max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10 px-2">
              <span className="w-3 h-3 rounded-full bg-danger/80" />
              <span className="w-3 h-3 rounded-full bg-orange/80" />
              <span className="w-3 h-3 rounded-full bg-teal/80" />
              <span className="ml-4 text-xs font-mono text-gray-500">careeriq.platform.app/dashboard</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4 bg-base-900 border-accent/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Career Readiness</span>
                  <span className="text-sm font-bold text-accent-light">88%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[88%] bg-gradient-purple rounded-full" />
                </div>
                <p className="text-[11px] text-teal mt-2 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Target Role: Full Stack Engineer
                </p>
              </div>

              <div className="card p-4 bg-base-900 border-teal/30">
                <div className="flex items-center gap-2 mb-1 text-teal">
                  <Brain size={16} /> <span className="text-xs font-semibold text-heading">Skill Gap Diagnostic</span>
                </div>
                <p className="text-xs text-gray-400">3 high-demand skills to learn</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="badge bg-teal/15 text-teal text-[10px]">System Design</span>
                  <span className="badge bg-purple-500/15 text-purple-400 text-[10px]">TypeScript</span>
                  <span className="badge bg-blue/15 text-blue text-[10px]">Docker</span>
                </div>
              </div>

              <div className="card p-4 bg-base-900 border-orange/30">
                <div className="flex items-center gap-2 mb-1 text-orange">
                  <FileText size={16} /> <span className="text-xs font-semibold text-heading">ATS Resume Score</span>
                </div>
                <p className="text-2xl font-bold text-heading">85/100</p>
                <p className="text-[11px] text-teal flex items-center gap-1">
                  <ShieldCheck size={12} /> Recruiter Ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 px-6 border-t border-white/5 bg-base-850/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-heading">
              Everything You Need to Land Your Dream Tech Role
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Integrated career tools designed to guide you from foundational learning to offer letter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="card card-hover p-6 flex flex-col group">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-heading text-lg group-hover:text-accent-light transition">
                  {title}
                </h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed flex-1">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-heading">How CareerAI Accelerates Your Growth</h2>
            <p className="mt-3 text-sm text-gray-400">
              A simple, data-driven workflow designed to optimize your time and preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map(({ step, title, description }) => (
              <div key={step} className="card p-6 relative flex flex-col">
                <span className="text-4xl font-extrabold text-white/10 font-mono mb-3">{step}</span>
                <h3 className="font-semibold text-heading text-base">{title}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 border-t border-white/5 bg-gradient-to-b from-base-850 to-base-900 text-center">
        <div className="max-w-3xl mx-auto card p-10 border-accent/30 bg-gradient-to-br from-accent/15 via-base-850 to-transparent">
          <h2 className="text-3xl font-extrabold text-heading">Ready to Master Your Tech Career?</h2>
          <p className="text-sm text-gray-400 mt-3 max-w-lg mx-auto">
            Join students and developers using CareerAI to track skills, build roadmaps, and crack technical interviews.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary mt-8 !py-3.5 !px-8 text-base shadow-glow-purple"
          >
            Start Preparing Now <ArrowRight size={18} />
          </button>
        </div>

        <footer className="mt-16 text-center text-xs text-gray-600">
          CareerAI Platform · Intelligence Powered Career Acceleration
        </footer>
      </section>
    </div>
  )
}
