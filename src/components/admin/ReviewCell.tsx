'use client'

import { useState } from 'react'
import type { DefaultCellComponentProps } from 'payload'

export default function ReviewCell({ rowData }: DefaultCellComponentProps) {
  const doc = rowData as Record<string, unknown>
  const id = doc?.id as string | undefined
  const [current, setCurrent] = useState<string>((doc?.status as string) ?? 'pending')
  const [loading, setLoading] = useState(false)

  const handleAction = async (newStatus: 'approved' | 'rejected', e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!id || loading || current === 'approved' || current === newStatus) return

    setLoading(true)
    try {
      const res = await fetch(`/api/places/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const updated = (await res.json().catch(() => ({}))) as { status?: string }
        setCurrent(updated.status ?? newStatus)
      }
    } finally {
      setLoading(false)
    }
  }

  const isLocked = current === 'approved'

  const btn = (newStatus: 'approved' | 'rejected'): React.CSSProperties => {
    const isActive = current === newStatus
    const isDisabled = loading || isLocked || isActive
    const colors = {
      approved: { active: '#bbf7d0', activeFg: '#16a34a', normal: '#16a34a' },
      rejected: { active: '#fecaca', activeFg: '#dc2626', normal: '#dc2626' },
    }
    const c = colors[newStatus]
    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      border: isActive ? `2px solid ${c.activeFg}` : 'none',
      fontWeight: 800,
      fontSize: '15px',
      lineHeight: 1,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      color: isActive ? c.activeFg : isDisabled ? '#9ca3af' : '#fff',
      flexShrink: 0,
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <button
        title="Approve"
        disabled={loading || isLocked || current === 'approved'}
        onClick={(e) => handleAction('approved', e)}
        style={btn('approved')}
      >
        ✓
      </button>
      <button
        title="Reject"
        disabled={loading || isLocked || current === 'rejected'}
        onClick={(e) => handleAction('rejected', e)}
        style={btn('rejected')}
      >
        ✗
      </button>
    </span>
  )
}