'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Search, SlidersHorizontal, Leaf, Loader2, RefreshCw } from 'lucide-react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import PlaceCard, { type PlacePost } from '@/components/explore/PlaceCard'
import PostModal from '@/components/explore/PostModal'
import { useAuth } from '@/context/AuthContext'

const districts = [
  'All',
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

const locationTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'waterfall', label: '💧 Waterfalls' },
  { value: 'beach', label: '🏖️ Beaches' },
  { value: 'forest', label: '🌲 Forests' },
  { value: 'ruins', label: '🏛️ Ruins' },
  { value: 'viewpoint', label: '🏔️ Viewpoints' },
  { value: 'cave', label: '🦇 Caves' },
  { value: 'river', label: '🌊 Rivers' },
  { value: 'wildlife', label: '🦜 Wildlife' },
  { value: 'village', label: '🏘️ Villages' },
  { value: 'other', label: '📍 Other' },
]

export default function ExplorePage() {
  const { user } = useAuth()

  const [places, setPlaces] = useState<PlacePost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedDistrict, setSelectedDistrict] = useState('All')
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [activePlace, setActivePlace] = useState<PlacePost | null>(null)

  // New: when the page loads, check for ?open=<id> and open that place
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const openId = params.get('open')
    if (!openId) return

    // Fetch single place via API and open modal
    ;(async () => {
      try {
        const res = await fetch(`/api/places/${openId}`, { credentials: 'include' })
        if (!res.ok) {
          // remove the param anyway to avoid infinite attempts
          params.delete('open')
          const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
          window.history.replaceState({}, '', url)
          return
        }
        const place: PlacePost = await res.json()
        // Ensure likes/comment defaults match what PostModal expects
        setActivePlace({ ...place, likes: place.likes ?? 0, commentCount: place.commentCount ?? 0, liked: place.liked ?? false })
      } catch (_e) {
        // ignore failures; remove query param
      } finally {
        params.delete('open')
        const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
        window.history.replaceState({}, '', url)
      }
    })()
  }, [])

  // Keep card hover stats in sync after a like toggle inside the modal
  const handleLikeUpdate = useCallback((placeId: string, liked: boolean, likes: number) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, liked, likes } : p)),
    )
    setActivePlace((prev) => (prev?.id === placeId ? { ...prev, liked, likes } : prev))
  }, [])

  // Keep card comment count in sync after a comment or reply is added inside the modal
  const handleCommentCountChange = useCallback((placeId: string, delta: number) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, commentCount: (p.commentCount ?? 0) + delta } : p)),
    )
    setActivePlace((prev) =>
      prev?.id === placeId ? { ...prev, commentCount: (prev.commentCount ?? 0) + delta } : prev,
    )
  }, [])

  const fetchPlaces = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/api/places?where[status][equals]=approved&sort=-createdAt&limit=30&depth=1`,
        { credentials: 'include' },
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? 'Failed to load places')
        return
      }

      const docs: PlacePost[] = data.docs ?? []

      // ── Phase 1: render cards instantly ──────────────────────────────────
      setPlaces(docs.map((p) => ({ ...p, commentCount: 0, likes: p.likes ?? 0, liked: false })))
      setLoading(false)

      if (!docs.length) return

      // ── Phase 2: single batch request for all likes + comment counts ──────
      const batchRes = await fetch('/api/explore/batch', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeIds: docs.map((p) => p.id) }),
      })
      if (!batchRes.ok) return
      const batchMap: Record<string, { likes: number; commentCount: number; liked: boolean }> =
        await batchRes.json()

      setPlaces(
        docs.map((p) => ({
          ...p,
          likes: batchMap[p.id]?.likes ?? p.likes ?? 0,
          commentCount: batchMap[p.id]?.commentCount ?? 0,
          liked: batchMap[p.id]?.liked ?? false,
        })),
      )
    } catch (e) {
      setError((e as Error).message)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlaces()
  }, [fetchPlaces])

  const filteredPlaces = places.filter((place) => {
    const matchesDistrict = selectedDistrict === 'All' || place.district === selectedDistrict

    const matchesType = selectedType === 'all' || place.locationType === selectedType

    const q = searchQuery.toLowerCase()
    const submitterName =
      typeof place.submittedBy === 'object' && place.submittedBy
        ? `${place.submittedBy.firstName ?? ''} ${place.submittedBy.lastName ?? ''}`
        : ''

    const matchesSearch =
      !q ||
      place.title.toLowerCase().includes(q) ||
      place.description.toLowerCase().includes(q) ||
      place.locationType.toLowerCase().includes(q) ||
      (place.district?.toLowerCase().includes(q) ?? false) ||
      (place.city?.toLowerCase().includes(q) ?? false) ||
      submitterName.toLowerCase().includes(q) ||
      (typeof place.submittedBy === 'object' &&
        place.submittedBy?.email?.toLowerCase().includes(q))

    return matchesDistrict && matchesType && matchesSearch
  })

  return (
    <div className="hv-explore-root">
      <Navbar />

      <main className="hv-explore-main">
        {/* ── Header ── */}
        <div className="hv-explore-header">
          <div className="hv-explore-header__badge">
            <Leaf className="w-4 h-4" />
            <span>Explore</span>
          </div>
          <h1 className="hv-explore-header__title">
            Discover Hidden <em>Gems</em>
          </h1>
          <p className="hv-explore-header__sub">
            Community-shared secret spots across Sri Lanka
          </p>
        </div>

        {/* ── Search & Filter bar ── */}
        <div className="hv-explore-controls">
          <div className="hv-explore-search">
            <Search className="hv-explore-search__icon" />
            <input
              type="text"
              placeholder="Search places, locations, types…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hv-explore-search__input"
            />
          </div>
          <button
            className={`hv-explore-filter-btn${showFilters ? ' active' : ''}`}
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            className="hv-explore-refresh-btn"
            onClick={fetchPlaces}
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── District pills ── */}
        <div className="hv-explore-pills">
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`hv-explore-pill${selectedDistrict === d ? ' active' : ''}`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* ── Type filters (collapsible) ── */}
        {showFilters && (
          <div className="hv-explore-type-filters">
            {locationTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`hv-explore-pill${selectedType === t.value ? ' active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="hv-explore-loading">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--hv-emerald)' }} />
            <p>Loading hidden gems…</p>
          </div>
        ) : error ? (
          <div className="hv-explore-error">
            <p>{error}</p>
            <button onClick={fetchPlaces} className="hv-btn-primary">
              Try Again
            </button>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="hv-explore-empty">
            <span style={{ fontSize: '3rem' }}>🌿</span>
            <p>No hidden gems found for this filter.</p>
            <button
              onClick={() => {
                setSelectedDistrict('All')
                setSelectedType('all')
                setSearchQuery('')
              }}
              className="hv-btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="hv-explore-count">
              {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'} found
            </p>
            <div className="hv-explore-grid">
              {filteredPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} onClick={setActivePlace} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* ── Post Modal ── */}
      <PostModal
        place={activePlace}
        onClose={() => setActivePlace(null)}
        currentUserId={user?.id ?? null}
        onLikeUpdate={handleLikeUpdate}
        onCommentCountChange={handleCommentCountChange}
      />
    </div>
  )
}
