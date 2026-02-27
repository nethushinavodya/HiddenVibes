'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const LoginForm = () => {
  const { login } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      router.push('/')
    }
  }

  return (
    <form className="hv-auth-form" onSubmit={handleSubmit} noValidate>
      {error && <p className="hv-auth-error">{error}</p>}
      {/* Email */}
      <div className="hv-auth-field">
        <label className="hv-auth-label" htmlFor="email">
          Email Address
        </label>
        <div className="hv-auth-input-wrap">
          <Mail size={16} className="hv-auth-input-icon" />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="hv-auth-input"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password */}
      <div className="hv-auth-field">
        <div className="hv-auth-label-row">
          <label className="hv-auth-label" htmlFor="password">
            Password
          </label>
          <Link href="/forgot-password" className="hv-auth-forgot">
            Forgot password?
          </Link>
        </div>
        <div className="hv-auth-input-wrap">
          <Lock size={16} className="hv-auth-input-icon" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            className="hv-auth-input hv-auth-input--padded"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="hv-auth-eye"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="hv-auth-submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="hv-auth-switch">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="hv-auth-switch-link">
          Create one
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
