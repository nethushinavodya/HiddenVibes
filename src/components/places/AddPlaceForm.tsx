'use client'

import React, { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  Upload,
  X,
  Camera,
  Video,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  MapPin,
} from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────

const PLACE_TYPES = [
  { value: 'waterfall', label: '💧 Waterfall' },
  { value: 'beach', label: '🏖️ Beach / Lagoon' },
  { value: 'forest', label: '🌿 Forest / Jungle' },
  { value: 'ruins', label: '🏛️ Ancient Ruins / Temple' },
  { value: 'viewpoint', label: '🌅 Viewpoint / Hilltop' },
  { value: 'cave', label: '🪨 Cave' },
  { value: 'river', label: '🌊 River / Stream' },
  { value: 'wildlife', label: '🦚 Wildlife / Nature Reserve' },
  { value: 'village', label: '🏡 Village / Cultural Site' },
  { value: 'other', label: '📍 Other' },
]

const ENTRY_FEES = [
  { value: 'free', label: '🆓 Free' },
  { value: 'small', label: '💵 Small Fee (< LKR 500)' },
  { value: 'moderate', label: '💴 Moderate (LKR 500 – 2000)' },
  { value: 'high', label: '💎 High Fee (> LKR 2000)' },
  { value: 'unknown', label: '❓ Unknown' },
]

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
]

// ── Types ──────────────────────────────────────────────────────────────────

interface MediaFile {
  file: File
  previewUrl: string
  uploadedUrl?: string
  uploadedPublicId?: string
  resourceType: 'image' | 'video'
  caption: string
  uploading: boolean
  error?: string
}

// ── Input class ────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow hover:border-gray-300'

// ── Main Component ─────────────────────────────────────────────────────────

export default function AddPlaceForm() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationType, setLocationType] = useState('')
  const [entryFee, setEntryFee] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [previewItem, setPreviewItem] = useState<{ url: string; type: 'image' | 'video' } | null>(
    null,
  )

  // ── File handling ─────────────────────────────────────────────────────────

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      if (!files.length) return
      const toAdd = files.slice(0, 10 - mediaFiles.length)
      setMediaFiles((prev) => [
        ...prev,
        ...toAdd.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
          resourceType: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
          caption: '',
          uploading: false,
        })),
      ])
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [mediaFiles.length],
  )

  const removeMedia = useCallback((index: number) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[index]!.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const updateCaption = useCallback((index: number, caption: string) => {
    setMediaFiles((prev) => prev.map((m, i) => (i === index ? { ...m, caption } : m)))
  }, [])

  // ── Upload single file to Cloudinary ─────────────────────────────────────

  const uploadFile = async (
    mf: MediaFile,
    index: number,
  ): Promise<{ url: string; publicId: string } | null> => {
    setMediaFiles((prev) =>
      prev.map((m, i) => (i === index ? { ...m, uploading: true, error: undefined } : m)),
    )
    const fd = new FormData()
    fd.append('file', mf.file)
    try {
      const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setMediaFiles((prev) =>
        prev.map((m, i) =>
          i === index
            ? { ...m, uploading: false, uploadedUrl: data.url, uploadedPublicId: data.publicId }
            : m,
        ),
      )
      return { url: data.url as string, publicId: data.publicId as string }
    } catch (err) {
      setMediaFiles((prev) =>
        prev.map((m, i) =>
          i === index ? { ...m, uploading: false, error: (err as Error).message } : m,
        ),
      )
      return null
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login?redirect=/add-place')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    // Upload any un-uploaded files; collect results directly (state is stale in this closure)
    const uploadResults = await Promise.all(
      mediaFiles.map((mf, i) =>
        mf.uploadedUrl
          ? Promise.resolve({ url: mf.uploadedUrl, publicId: mf.uploadedPublicId! })
          : uploadFile(mf, i),
      ),
    )
    if (uploadResults.some((r) => r === null)) {
      setIsSubmitting(false)
      setErrorMsg('Some files failed to upload. Please retry or remove them.')
      return
    }

    const uploadedMedia = mediaFiles.map((mf, i) => ({
      url: uploadResults[i]!.url,
      publicId: uploadResults[i]!.publicId,
      resourceType: mf.resourceType,
      caption: mf.caption,
    }))

    try {
      const body: Record<string, unknown> = {
        title,
        description,
        locationType,
        district,
        status: 'pending',
      }
      if (entryFee) body.entryFee = entryFee
      if (city.trim()) body.city = city.trim()
      if (uploadedMedia.length > 0) body.mediaFiles = uploadedMedia

      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok)
        throw new Error(data?.errors?.[0]?.message ?? data?.message ?? 'Submission failed')
      setSubmitStatus('success')
    } catch (err) {
      setErrorMsg((err as Error).message)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────

  if (submitStatus === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Received!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your hidden place has been submitted for review. Our team will approve it shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setSubmitStatus('idle')
                setTitle('')
                setDescription('')
                setLocationType('')
                setEntryFee('')
                setDistrict('')
                setCity('')
                setMediaFiles([])
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              + Add Another Place
            </button>
            <button
              onClick={() => router.push('/my-submissions')}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl border border-gray-200 transition-colors"
            >
              My Submissions
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-6">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
          <MapPin className="w-3.5 h-3.5" /> Share a Hidden Gem
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Add a Hidden Place</h1>
        <p className="text-sm text-gray-500">
          Every submission is reviewed by our team before going public.
        </p>
      </div>

      {/* ── Single form box ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        {/* Place Name */}
        <div className="px-6 py-5 space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Place Name <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400">What is this hidden place called?</p>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ravana Ella Secret Pool"
            className={inputCls}
          />
        </div>

        {/* Description */}
        <div className="px-6 py-5 space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Description <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400">What makes this place special?</p>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what people can expect — scenery, atmosphere, unique features…"
            className={inputCls}
          />
        </div>

        {/* Type of Place + Entry Fee — same row */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Type of Place <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400">What kind of hidden spot is this?</p>
            <select
              required
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className={inputCls}
            >
              <option value="">Select type…</option>
              {PLACE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Entry Fee</label>
            <p className="text-xs text-gray-400">Is there a cost to visit?</p>
            <select
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className={inputCls}
            >
              <option value="">Select entry fee…</option>
              {ENTRY_FEES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* District + City — same row */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              District <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400">Which district is this place in?</p>
            <select
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className={inputCls}
            >
              <option value="">Select district…</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">City / Town / Village</label>
            <p className="text-xs text-gray-400">Nearest city, town or village</p>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Ella, Mirissa, Sigiriya…"
              className={inputCls}
            />
          </div>
        </div>

        {/* Photos & Videos */}
        <div className="px-6 py-5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Photos &amp; Videos
              <span className="ml-2 text-xs font-normal text-gray-400">
                {mediaFiles.length}/10 added
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Upload images or short videos of this place
            </p>
          </div>

          {mediaFiles.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-green-200 hover:border-green-400 bg-green-50 hover:bg-green-100 rounded-xl py-8 flex flex-col items-center gap-2 transition-colors group cursor-pointer"
            >
              <Upload className="w-7 h-7 text-green-500 group-hover:text-green-600" />
              <p className="text-sm font-semibold text-green-800">
                Click to upload photos or videos
              </p>
              <p className="text-xs text-green-500">JPG, PNG, WebP, MP4, MOV · Max 100 MB each</p>
              <div className="flex gap-3 text-xs text-green-400 mt-1">
                <span className="flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Images
                </span>
                <span className="flex items-center gap-1">
                  <Video className="w-3 h-3" /> Videos
                </span>
              </div>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaFiles.map((mf, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group"
                >
                  {mf.resourceType === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mf.previewUrl}
                      alt="preview"
                      className="w-full h-32 object-cover cursor-zoom-in"
                      onClick={() => setPreviewItem({ url: mf.previewUrl, type: 'image' })}
                    />
                  ) : (
                    <video
                      src={mf.previewUrl}
                      className="w-full h-32 object-cover cursor-zoom-in"
                      muted
                      onClick={() => setPreviewItem({ url: mf.previewUrl, type: 'video' })}
                    />
                  )}
                  {mf.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                  {mf.error && (
                    <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center p-2">
                      <AlertCircle className="w-4 h-4 text-red-200 mb-1" />
                      <span className="text-xs text-red-100 text-center">{mf.error}</span>
                    </div>
                  )}
                  {mf.uploadedUrl && !mf.uploading && (
                    <div className="absolute top-1.5 left-1.5 bg-green-500 rounded-full p-0.5">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="absolute top-1.5 right-7 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {mf.resourceType === 'image' ? '📷' : '🎬'}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={mf.caption}
                    onChange={(e) => updateCaption(i, e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border-t border-gray-200 focus:outline-none focus:bg-white bg-gray-50"
                  />
                </div>
              ))}
              {mediaFiles.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-green-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Add more</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Review notice */}
        <div className="px-6 py-4 bg-amber-50 flex items-start gap-3 text-sm text-amber-800">
          <span className="text-base leading-none mt-0.5">ℹ️</span>
          <p>
            Your submission will be reviewed before it appears publicly. Track its status in{' '}
            <a href="/my-submissions" className="font-semibold underline hover:text-amber-900">
              My Submissions
            </a>
            .
          </p>
        </div>
      </div>

      {/* ── Error banner ── */}
      {errorMsg && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* ── Lightbox ── */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewItem(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewItem(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {previewItem.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewItem.url}
                alt="Full preview"
                className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
              />
            ) : (
              <video
                src={previewItem.url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
              />
            )}
          </div>
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isSubmitting || !title || !description || !locationType || !district}
        className="relative w-full overflow-hidden rounded-2xl py-4 text-base font-bold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2.5 group"
        style={{
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
          boxShadow: '0 4px 24px rgba(22,163,74,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Shine sweep on hover */}
        <span className="pointer-events-none absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Submitting…
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5 drop-shadow" /> Submit for Review
          </>
        )}
      </button>
    </form>
  )
}
