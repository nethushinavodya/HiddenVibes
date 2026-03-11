'use client'

import { useAllFormFields } from '@payloadcms/ui'

export default function MediaPreviewField() {
  const [fields] = useAllFormFields()

  const mediaItems: { url: string; type: string; caption: string }[] = []

  if (fields) {
    let i = 0
    while (fields[`mediaFiles.${i}.url`]) {
      const url = fields[`mediaFiles.${i}.url`]?.value as string
      const type = (fields[`mediaFiles.${i}.resourceType`]?.value as string) || 'image'
      const caption = (fields[`mediaFiles.${i}.caption`]?.value as string) || ''
      if (url) mediaItems.push({ url, type, caption })
      i++
    }
  }

  if (mediaItems.length === 0) {
    return (
      <div
        style={{
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          color: '#6c757d',
          fontSize: '13px',
          textAlign: 'center',
          border: '1px dashed #dee2e6',
        }}
      >
        No media uploaded for this submission.
      </div>
    )
  }

  return (
    <div style={{ marginTop: '4px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '10px',
        }}
      >
        {mediaItems.map((m, i) => (
          <div
            key={i}
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #dee2e6',
              background: '#000',
            }}
          >
            {m.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.url}
                alt={m.caption || `Media ${i + 1}`}
                style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <video
                src={m.url}
                controls
                muted
                style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
              />
            )}
            {m.caption && (
              <div
                style={{
                  background: '#fff',
                  padding: '6px 8px',
                  fontSize: '11px',
                  color: '#495057',
                  borderTop: '1px solid #dee2e6',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {m.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
