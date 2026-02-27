'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Camera, Mail, MapPin, Pencil, User, X, Check, Loader2 } from 'lucide-react'
import Navbar from '@/components/ui/Navbar'

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

interface FullUser {
  id: string
  email: string
  firstName: string
  lastName: string
  district: string
  profileImage?: { id: string; url?: string } | null
}

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<FullUser | null>(null)
  const [fetching, setFetching] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [form, setForm] = useState({ firstName: '', lastName: '', district: '' })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  // Fetch full user data (includes profileImage URL)
  useEffect(() => {
    if (!user) return
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setProfile(data.user as FullUser)
          setForm({
            firstName: data.user.firstName ?? '',
            lastName: data.user.lastName ?? '',
            district: data.user.district ?? '',
          })
        }
      })
      .finally(() => setFetching(false))
  }, [user])

  const startEdit = () => {
    setSaveError('')
    setSaveSuccess(false)
    setEditing(true)
  }

  const cancelEdit = () => {
    if (!profile) return
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      district: profile.district,
    })
    setEditing(false)
    setSaveError('')
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    const res = await fetch(`/api/users/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        district: form.district,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setSaveError(d?.message ?? 'Failed to save changes.')
      return
    }

    const data = await res.json()
    setProfile((prev) => ({ ...prev!, ...data.doc }))
    await refreshUser()
    setEditing(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleImageClick = () => fileInputRef.current?.click()

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingImg(true)

    // 1. Upload to /api/media
    const fd = new FormData()
    fd.append('file', file)
    fd.append('alt', `${profile.firstName} profile photo`)

    const uploadRes = await fetch('/api/media', {
      method: 'POST',
      credentials: 'include',
      body: fd,
    })

    if (!uploadRes.ok) {
      setUploadingImg(false)
      return
    }

    const uploadData = await uploadRes.json()
    const mediaId = uploadData?.doc?.id

    if (!mediaId) {
      setUploadingImg(false)
      return
    }

    // 2. Attach media ID to user
    const patchRes = await fetch(`/api/users/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ profileImage: mediaId }),
    })

    if (patchRes.ok) {
      const patchData = await patchRes.json()
      setProfile((prev) => ({ ...prev!, profileImage: patchData.doc?.profileImage }))
      await refreshUser()
    }

    setUploadingImg(false)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  if (loading || fetching) {
    return (
      <div className="hv-profile-loading">
        <Loader2 size={36} className="hv-profile-spinner" />
      </div>
    )
  }

  if (!profile) return null

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
  const avatarUrl = profile.profileImage?.url ?? null

  return (
    <>
      <Navbar />
      <div className="hv-profile-page">
        {/* ── Hero banner ── */}
        <div className="hv-profile-banner" />

        <div className="hv-profile-layout">
          {/* ── Left card — avatar + identity ── */}
          <aside className="hv-profile-card hv-profile-card--left">
            {/* Avatar */}
            <div className="hv-profile-avatar-wrap">
              <div className="hv-profile-avatar" onClick={handleImageClick}>
                {uploadingImg ? (
                  <Loader2 size={32} className="hv-profile-spinner" />
                ) : avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Profile" className="hv-profile-avatar-img" />
                ) : (
                  <span className="hv-profile-avatar-initials">{initials}</span>
                )}
                <div className="hv-profile-avatar-overlay">
                  <Camera size={20} />
                  <span>Change</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>

            <h2 className="hv-profile-name">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="hv-profile-email">
              <Mail size={14} />
              {profile.email}
            </p>
            <p className="hv-profile-district">
              <MapPin size={14} />
              {profile.district}
            </p>
          </aside>

          {/* ── Right card — details / edit ── */}
          <main className="hv-profile-card hv-profile-card--right">
            <div className="hv-profile-card-header">
              <h3 className="hv-profile-card-title">
                <User size={18} />
                Personal Information
              </h3>
              {!editing && (
                <button className="hv-profile-edit-btn" onClick={startEdit}>
                  <Pencil size={14} />
                  Edit
                </button>
              )}
            </div>

            {saveError && <p className="hv-profile-alert hv-profile-alert--error">{saveError}</p>}
            {saveSuccess && (
              <p className="hv-profile-alert hv-profile-alert--success">Changes saved!</p>
            )}

            {editing ? (
              <div className="hv-profile-form">
                <div className="hv-profile-form-row">
                  <div className="hv-profile-field">
                    <label className="hv-profile-label">First Name</label>
                    <input
                      className="hv-profile-input"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </div>
                  <div className="hv-profile-field">
                    <label className="hv-profile-label">Last Name</label>
                    <input
                      className="hv-profile-input"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="hv-profile-field">
                  <label className="hv-profile-label">District</label>
                  <select
                    className="hv-profile-input hv-profile-select"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hv-profile-field">
                  <label className="hv-profile-label">Email Address</label>
                  <input
                    className="hv-profile-input hv-profile-input--readonly"
                    value={profile.email}
                    readOnly
                  />
                  <span className="hv-profile-hint">Email cannot be changed here.</span>
                </div>

                <div className="hv-profile-form-actions">
                  <button
                    className="hv-profile-btn hv-profile-btn--save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 size={15} className="hv-profile-spinner" />
                    ) : (
                      <Check size={15} />
                    )}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    className="hv-profile-btn hv-profile-btn--cancel"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    <X size={15} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <dl className="hv-profile-details">
                <div className="hv-profile-detail-row">
                  <dt>First Name</dt>
                  <dd>{profile.firstName}</dd>
                </div>
                <div className="hv-profile-detail-row">
                  <dt>Last Name</dt>
                  <dd>{profile.lastName}</dd>
                </div>
                <div className="hv-profile-detail-row">
                  <dt>Email</dt>
                  <dd>{profile.email}</dd>
                </div>
                <div className="hv-profile-detail-row">
                  <dt>District</dt>
                  <dd>{profile.district}</dd>
                </div>
              </dl>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
