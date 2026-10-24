import { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Lock,
  Sparkles,
  Cloud,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Database,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react'
import {
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  resetPasswordForEmail,
  signOutUser,
} from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSyncGuestProjects?: () => Promise<number>
}

type AuthTab = 'signin' | 'signup'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthModal({
  isOpen,
  onClose,
  user,
  onSyncGuestProjects,
}: AuthModalProps) {
  // Navigation States
  const [tab, setTab] = useState<AuthTab>('signin')
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Feedback States
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [syncedCount, setSyncedCount] = useState<number | null>(null)

  const clearFeedback = () => {
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // --------------------------------------------------------------------------
  // Email Validation Helper
  // --------------------------------------------------------------------------
  const validateForm = (): boolean => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.')
      return false
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address (e.g. founder@example.com).')
      return false
    }
    if (!password) {
      setErrorMsg('Please enter a password.')
      return false
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return false
    }
    if (tab === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password confirmation.')
      return false
    }
    return true
  }

  // --------------------------------------------------------------------------
  // Submit Sign In or Create Account
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearFeedback()

    if (!validateForm()) return

    setLoading(true)
    const trimmedEmail = email.trim()

    try {
      if (tab === 'signin') {
        await signInWithEmail(trimmedEmail, password)
        setSuccessMsg('Signed in successfully! Connecting your cloud projects...')
        setTimeout(() => onClose(), 800)
      } else {
        await signUpWithEmail(trimmedEmail, password)
        setSuccessMsg(
          'Account created successfully! If email confirmation is enabled in your Supabase project, check your inbox to verify your email.'
        )
        setTimeout(() => onClose(), 1400)
      }
    } catch (err: any) {
      console.warn('Authentication error:', err)
      const raw = err.message || ''

      // Provide human-friendly, actionable feedback
      if (raw.includes('Invalid login credentials')) {
        setErrorMsg('Incorrect email or password. Please double-check your credentials.')
      } else if (raw.includes('Email not confirmed')) {
        setErrorMsg(
          'Your email has not been confirmed yet. Please check your inbox for the Supabase confirmation link or toggle "Confirm email" off in your Supabase Auth settings.'
        )
      } else if (raw.includes('User already registered') || raw.includes('already exists')) {
        setErrorMsg('An account with this email already exists. Please switch to Sign In.')
      } else if (raw.includes('Password should be')) {
        setErrorMsg('Password is too weak. Please use at least 6 characters.')
      } else {
        setErrorMsg(raw || 'Authentication failed. Please verify your details and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------------------------------
  // Password Recovery Handler
  // --------------------------------------------------------------------------
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    clearFeedback()

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address to receive password reset instructions.')
      return
    }

    setLoading(true)
    try {
      await resetPasswordForEmail(trimmedEmail)
      setSuccessMsg(
        'Password recovery email sent! Check your inbox for the reset link. Note: This requires active SMTP or default Supabase email delivery.'
      )
    } catch (err: any) {
      console.warn('Password recovery error:', err)
      setErrorMsg(err.message || 'Failed to dispatch password recovery email.')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------------------------------
  // Sign Out Handler
  // --------------------------------------------------------------------------
  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOutUser()
      setSuccessMsg('Signed out successfully.')
      setTimeout(() => onClose(), 600)
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign out failed.')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------------------------------
  // Sync Guest Projects to Account Handler
  // --------------------------------------------------------------------------
  const handleSync = async () => {
    if (!onSyncGuestProjects) return
    setLoading(true)
    try {
      const count = await onSyncGuestProjects()
      setSyncedCount(count)
      setSuccessMsg(`Successfully synced ${count} local project${count === 1 ? '' : 's'} to your cloud account!`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sync local projects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dusk-ink/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="glass-solid relative w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/30 text-dusk-ink max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-dusk-mute hover:bg-white/20 hover:text-dusk-ink transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* ================================================================== */}
        {/* VIEW 1: SIGNED IN PROFILE VIEW                                      */}
        {/* ================================================================== */}
        {user ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-lg">
                <Cloud size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">Founder Account</h3>
                <p className="text-xs text-dusk-mute truncate">{user.email}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/20 border border-white/25 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-medium text-emerald-900">
                <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                <span>Cloud Sync Active · Row Level Security</span>
              </div>
              <p className="text-dusk-deep leading-relaxed text-[11px]">
                Your startup evaluations, customer interview notes, assumptions, and version histories are securely stored in your private Supabase PostgreSQL database. Other users cannot access your records.
              </p>
            </div>

            {onSyncGuestProjects && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={loading}
                  className="w-full btn-secondary text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Database size={15} />
                  {loading ? 'Syncing...' : 'Sync Local Guest Projects to Cloud'}
                </button>
                {syncedCount !== null && (
                  <p className="mt-2 text-xs text-emerald-800 text-center font-medium">
                    ✓ {syncedCount} project{syncedCount === 1 ? '' : 's'} verified and saved to database.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full btn-ghost text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 py-2.5 flex items-center justify-center gap-2 transition"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        ) : !isSupabaseConfigured ? (
          /* ================================================================== */
          /* VIEW 2: SUPABASE UNCONFIGURED NOTICE                                */
          /* ================================================================== */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <Database size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-base">Local / Guest Mode Active</h3>
                <p className="text-xs text-dusk-mute">Cloud database not yet configured</p>
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50/90 border border-amber-200/80 p-4 text-xs space-y-2 text-amber-950">
              <p className="font-medium flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-amber-700 shrink-0" />
                <span>Your work remains 100% saved on this device</span>
              </p>
              <p className="leading-relaxed text-amber-900 text-[11px]">
                FOCAS stores your startup ideas in browser storage. You can evaluate ideas, run Basic Evaluations, and revisit projects without logging in.
              </p>
            </div>

            <div className="rounded-2xl bg-white/20 border border-white/25 p-4 text-xs space-y-2 text-dusk-deep">
              <span className="font-medium text-dusk-ink block">To enable Multi-User Cloud Accounts:</span>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Create a free project at <code className="bg-white/40 px-1 py-0.5 rounded">supabase.com</code>.</li>
                <li>Run the provided <code className="bg-white/40 px-1 py-0.5 rounded">supabase/schema.sql</code> script.</li>
                <li>Set <code className="bg-white/40 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> & <code className="bg-white/40 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>.</li>
              </ol>
            </div>

            <button
              onClick={onClose}
              className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
            >
              Continue in Local Mode <ArrowRight size={14} />
            </button>
          </div>
        ) : forgotPasswordMode ? (
          /* ================================================================== */
          /* VIEW 3: FORGOT PASSWORD RECOVERY FLOW                              */
          /* ================================================================== */
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/30 text-dusk-ink">
                <KeyRound size={20} />
              </div>
              <h3 className="text-lg font-bold tracking-tight">Reset Your Password</h3>
              <p className="text-xs text-dusk-mute mt-1">
                Enter your account email to receive a password recovery link.
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-dusk-deep">Account Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-dusk-mute" />
                  <input
                    type="email"
                    required
                    placeholder="founder@example.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (errorMsg) clearFeedback()
                    }}
                    className="input pl-9 text-xs w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotPasswordMode(false)
                  clearFeedback()
                }}
                className="w-full text-center text-xs text-dusk-mute hover:text-dusk-ink underline pt-1 block"
              >
                ← Return to Sign In
              </button>
            </form>
          </div>
        ) : (
          /* ================================================================== */
          /* VIEW 4: SIGN IN & CREATE ACCOUNT FORMS (EMAIL & PASSWORD ONLY)     */
          /* ================================================================== */
          <div>
            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold tracking-tight">
                {tab === 'signin' ? 'Sign In to FOCAS' : 'Create Founder Account'}
              </h3>
              <p className="text-xs text-dusk-mute mt-1">
                {tab === 'signin'
                  ? 'Access your saved startup evaluations and project history.'
                  : 'Get private cloud storage and multi-device access.'}
              </p>
            </div>

            {/* TAB SELECTOR: Sign In vs Create Account */}
            <div className="mb-4 flex rounded-xl bg-white/20 p-1 text-xs font-medium border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setTab('signin')
                  clearFeedback()
                }}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  tab === 'signin'
                    ? 'bg-white shadow text-dusk-ink font-semibold'
                    : 'text-dusk-mute hover:text-dusk-ink'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup')
                  clearFeedback()
                }}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  tab === 'signup'
                    ? 'bg-white shadow text-dusk-ink font-semibold'
                    : 'text-dusk-mute hover:text-dusk-ink'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium mb-1 text-dusk-deep">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-dusk-mute" />
                  <input
                    type="email"
                    required
                    placeholder="founder@example.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (errorMsg) clearFeedback()
                    }}
                    className="input pl-9 text-xs w-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-dusk-deep">Password</label>
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordMode(true)
                        clearFeedback()
                      }}
                      className="text-[11px] text-dusk-mute hover:text-dusk-ink underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-dusk-mute" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      if (errorMsg) clearFeedback()
                    }}
                    className="input pl-9 pr-9 text-xs w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-dusk-mute hover:text-dusk-ink transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {tab === 'signup' && (
                  <span className="text-[10px] text-dusk-mute mt-1 block">
                    Must be at least 6 characters.
                  </span>
                )}
              </div>

              {/* Password Confirmation on Registration */}
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-medium mb-1 text-dusk-deep">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-dusk-mute" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={e => {
                        setConfirmPassword(e.target.value)
                        if (errorMsg) clearFeedback()
                      }}
                      className="input pl-9 pr-9 text-xs w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-dusk-mute hover:text-dusk-ink transition"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  tab === 'signin' ? 'Signing in...' : 'Creating account...'
                ) : tab === 'signin' ? (
                  <>Sign In <ArrowRight size={14} /></>
                ) : (
                  <>Create Founder Account <Sparkles size={14} /></>
                )}
              </button>
            </form>

            {/* Optional Registration: Continue in Guest Mode */}
            <div className="mt-4 border-t border-white/15 pt-3 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] text-dusk-mute hover:text-dusk-ink underline transition"
              >
                Continue in Guest Mode (Offline on this device)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
