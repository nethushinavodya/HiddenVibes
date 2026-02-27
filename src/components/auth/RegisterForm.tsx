'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Mail, Lock, MapPin } from 'lucide-react'

const DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
]

const RegisterForm = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    district: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          district: form.district,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? 'Registration failed. Please try again.')
        return
      }

      setSuccess(true)
      // Redirect to login after a short delay so the user sees the success message
      setTimeout(() => router.push('/login'), 1500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="hv-auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="hv-auth-alert hv-auth-alert--error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="hv-auth-alert hv-auth-alert--success" role="status">
          Account created! Redirecting to login…
        </div>
      )}
      <div className="hv-auth-form-row">
        {/* First Name */}
        <div className="hv-auth-field">
          <label className="hv-auth-label" htmlFor="firstName">
            First Name
          </label>
          <div className="hv-auth-input-wrap">
            <User size={16} className="hv-auth-input-icon" />
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Nethushi"
              className="hv-auth-input"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="hv-auth-field">
          <label className="hv-auth-label" htmlFor="lastName">
            Last Name
          </label>
          <div className="hv-auth-input-wrap">
            <User size={16} className="hv-auth-input-icon" />
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Fernando"
              className="hv-auth-input"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

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
          />
        </div>
      </div>

      {/* District */}
      <div className="hv-auth-field">
        <label className="hv-auth-label" htmlFor="district">
          District
        </label>
        <div className="hv-auth-input-wrap">
          <MapPin size={16} className="hv-auth-input-icon" />
          <select
            id="district"
            name="district"
            className="hv-auth-input hv-auth-select"
            value={form.district}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select your district
            </option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Password */}
      <div className="hv-auth-field">
        <label className="hv-auth-label" htmlFor="password">
          Password
        </label>
        <div className="hv-auth-input-wrap">
          <Lock size={16} className="hv-auth-input-icon" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            className="hv-auth-input hv-auth-input--padded"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="hv-auth-eye"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="hv-auth-field">
        <label className="hv-auth-label" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="hv-auth-input-wrap">
          <Lock size={16} className="hv-auth-input-icon" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            className="hv-auth-input hv-auth-input--padded"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="hv-auth-eye"
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label="Toggle confirm password"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="hv-auth-submit" disabled={loading || success}>
        {loading ? 'Creating Account…' : 'Create Account'}
      </button>

      <p className="hv-auth-switch">
        Already have an account?{' '}
        <Link href="/login" className="hv-auth-switch-link">
          Sign in
        </Link>
      </p>
    </form>
  )
}

export default RegisterForm
