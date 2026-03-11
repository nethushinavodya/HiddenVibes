'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { useAuth } from '@/context/AuthContext'
import { Loader2, MapPin, Clock, CheckCircle, XCircle, Plus, RefreshCw } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface PlaceSubmission {
  id: string
  title: string
  description: string
  locationType?: string
  entryFee?: string
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  mediaFiles?: { url: string; resourceType: 'image' | 'video'; caption?: string }[]
  createdAt: string
  updatedAt: string
}

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PlaceSubmission['status'] }) {
  if (status === 'approved')
    return (
      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
        <CheckCircle className="w-3.5 h-3.5" /> Approved
      </span>
    )
  if (status === 'rejected')
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
      <Clock className="w-3.5 h-3.5" /> Pending Review
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function MySubmissionsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [submissions, setSubmissions] = useState<PlaceSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/api/places?where[submittedBy][equals]=${user!.id}&sort=-createdAt&limit=50&depth=0`,
        { credentials: 'include' },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? 'Failed to load submissions')
      setSubmissions(data.docs ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/my-submissions')
      return
    }
    if (user) fetchSubmissions()
  }, [authLoading, user, router, fetchSubmissions])

  const counts = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-[90px] pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track the review status of the hidden places you&apos;ve shared.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchSubmissions}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/add-place"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Place
              </Link>
            </div>
          </div>

          {/* Stats */}
          {!loading && !error && submissions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: counts.total, cls: 'text-gray-700' },
                { label: 'Pending', value: counts.pending, cls: 'text-amber-600' },
                { label: 'Approved', value: counts.approved, cls: 'text-green-600' },
                { label: 'Rejected', value: counts.rejected, cls: 'text-red-500' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm"
                >
                  <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Loading */}
          {(loading || authLoading) && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 text-sm">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && submissions.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
              <MapPin className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">No submissions yet</h2>
              <p className="text-sm text-gray-400 mb-6">
                Share a hidden gem in Sri Lanka and it will appear here.
              </p>
              <Link
                href="/add-place"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Your First Place
              </Link>
            </div>
          )}

          {/* List */}
          {!loading && !error && submissions.length > 0 && (
            <div className="space-y-4">
              {submissions.map((place) => (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-5">
                    {/* Thumbnail */}
                    {place.mediaFiles?.[0] && (
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        {place.mediaFiles[0].resourceType === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={place.mediaFiles[0].url}
                            alt={place.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={place.mediaFiles[0].url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        )}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="text-base font-bold text-gray-900 leading-tight">
                          {place.title}
                        </h2>
                        <StatusBadge status={place.status} />
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2">{place.description}</p>

                      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                        {place.locationType && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                            {place.locationType}
                          </span>
                        )}
                        {place.entryFee && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                            {place.entryFee}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                          Submitted {new Date(place.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin notes */}
                  {place.adminNotes && (
                    <div
                      className={`px-5 py-3 border-t text-sm ${
                        place.status === 'approved'
                          ? 'border-green-100 bg-green-50 text-green-800'
                          : place.status === 'rejected'
                            ? 'border-red-100 bg-red-50 text-red-700'
                            : 'border-amber-100 bg-amber-50 text-amber-800'
                      }`}
                    >
                      <span className="font-semibold">Admin note: </span>
                      {place.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
