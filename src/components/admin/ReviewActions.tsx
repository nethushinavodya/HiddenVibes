'use client'

import { useEffect, useState } from 'react'
import { useDocumentInfo, useAuth, useAllFormFields } from '@payloadcms/ui'

const STATUS_CFG = {
  approved: {
    label: 'Approved',
    color: 'var(--color-success-500)',
    bg: 'var(--color-success-100)',
  },
  rejected: { label: 'Rejected', color: 'var(--color-error-500)', bg: 'var(--color-error-100)' },
  pending: {
    label: 'Pending Review',
    color: 'var(--color-warning-500)',
    bg: 'var(--color-warning-100)',
  },
} as const

export default function ReviewActions() {
  const { id } = useDocumentInfo()
  const { user } = useAuth()
  const [fields] = useAllFormFields()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const fieldStatus = (fields?.status?.value as string) ?? 'pending'
  const [currentStatus, setCurrentStatus] = useState(fieldStatus)

  useEffect(() => {
    setCurrentStatus(fieldStatus)
  }, [fieldStatus])

  if (!user?.roles?.includes('admin') || !id) return null

  const cfg = STATUS_CFG[currentStatus as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending

  const handleAction = async (newStatus: 'approved' | 'rejected') => {
    if (loading || currentStatus === 'approved') return

    setLoading(true)
    setFeedback(null)
    try {
      const body: Record<string, string> = { status: newStatus }
      if (note.trim()) body.adminNotes = note.trim()

      const res = await fetch(`/api/places/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const updated = (await res.json().catch(() => ({}))) as { status?: string }
        const nextStatus = updated.status ?? newStatus
        setCurrentStatus(nextStatus)
        if (fields?.status) {
          fields.status.value = nextStatus
        }
        setFeedback({
          ok: true,
          msg: `Place ${nextStatus === 'approved' ? 'approved' : 'rejected'} successfully.`,
        })
      } else {
        const err = await res.json().catch(() => ({}))
        setFeedback({ ok: false, msg: (err?.message as string) ?? `Error ${res.status}` })
      }
    } catch {
      setFeedback({ ok: false, msg: 'Network error — please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        borderRadius: '6px',
        border: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-elevation-50)',
        padding: '18px 20px',
        marginBottom: '8px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--theme-text)' }}>
          Review
        </span>
        <span
          style={{
            padding: '2px 10px',
            borderRadius: '999px',
            background: cfg.bg,
            color: cfg.color,
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.02em',
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Note textarea */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note to the submitter…"
        rows={2}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-200)',
          background: 'var(--theme-input-bg)',
          color: 'var(--theme-text)',
          fontSize: '13px',
          resize: 'vertical',
          marginBottom: '12px',
          boxSizing: 'border-box',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          disabled={loading || currentStatus === 'approved'}
          onClick={() => handleAction('approved')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 18px',
            borderRadius: '4px',
            border: 'none',
            background:
              currentStatus === 'approved'
                ? 'var(--color-success-100)'
                : currentStatus === 'rejected'
                  ? '#e5e7eb'
                  : 'var(--color-success-500)',
            color:
              currentStatus === 'approved'
                ? 'var(--color-success-700)'
                : currentStatus === 'rejected'
                  ? '#9ca3af'
                  : '#fff',
            fontWeight: 700,
            fontSize: '13px',
            cursor: loading || currentStatus === 'approved' ? 'not-allowed' : 'pointer',
            opacity: currentStatus === 'rejected' ? 0.4 : loading ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span>✓</span> Approve
        </button>

        <button
          disabled={loading || currentStatus === 'approved' || currentStatus === 'rejected'}
          onClick={() => handleAction('rejected')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 18px',
            borderRadius: '4px',
            border: 'none',
            background:
              currentStatus === 'rejected'
                ? 'var(--color-error-100)'
                : currentStatus === 'approved'
                  ? '#e5e7eb'
                  : 'var(--color-error-500)',
            color:
              currentStatus === 'rejected'
                ? 'var(--color-error-700)'
                : currentStatus === 'approved'
                  ? '#9ca3af'
                  : '#fff',
            fontWeight: 700,
            fontSize: '13px',
            cursor:
              loading || currentStatus === 'approved' || currentStatus === 'rejected'
                ? 'not-allowed'
                : 'pointer',
            opacity: currentStatus === 'approved' ? 0.4 : loading ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span>✗</span> Reject
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          style={{
            marginTop: '10px',
            padding: '7px 12px',
            borderRadius: '4px',
            background: feedback.ok ? 'var(--color-success-100)' : 'var(--color-error-100)',
            color: feedback.ok ? 'var(--color-success-700)' : 'var(--color-error-700)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {feedback.msg}
        </div>
      )}
    </div>
  )
}