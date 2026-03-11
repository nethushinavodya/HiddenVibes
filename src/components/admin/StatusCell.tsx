'use client'

import type { DefaultCellComponentProps } from 'payload'

const STATUS_CFG = {
  approved: { label: 'Approved', color: '#166534', bg: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
  pending: { label: 'Pending Review', color: '#9a3412', bg: '#fef3c7' },
} as const

export default function StatusCell({ cellData }: DefaultCellComponentProps) {
  const rawStatus = typeof cellData === 'string' ? cellData : 'pending'
  const cfg = STATUS_CFG[rawStatus as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '999px',
        background: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '12px',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}

