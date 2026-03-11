import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Place } from '@/payload-types'

// ── Fetch latest 6 approved places from DB ───────────────────────────────────

async function getFeaturedPlaces(): Promise<Place[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'places',
      where: { status: { equals: 'approved' } },
      sort: '-createdAt',
      limit: 6,
      depth: 0,
    })
    return result.docs
  } catch {
    return []
  }
}

const locationTypeEmoji: Record<string, string> = {
  waterfall: '💧',
  beach: '🏖️',
  forest: '🌲',
  ruins: '🏛️',
  viewpoint: '🏔️',
  cave: '🦇',
  river: '🌊',
  wildlife: '🦜',
  village: '🏘️',
  other: '📍',
}

// ── Component ────────────────────────────────────────────────────────────────

export default async function FeaturedPlaces() {
  const places = await getFeaturedPlaces()

  return (
    <section className="hv-featured">
      <div className="hv-featured-wrap">
        {/* Header */}
        <div className="hv-featured-header">
          <div>
            <p className="hv-featured-label">Featured Discoveries</p>
            <h2 className="hv-featured-title">
              Hidden Gems of
              <br />
              <em className="hv-featured-title-em">Sri Lanka</em>
            </h2>
          </div>
          <Link href="/explore" className="hv-featured-viewall">
            View all places
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </div>

        {/* Cards grid */}
        {places.length === 0 ? (
          <div className="hv-featured-empty">
            <p>No featured places yet.</p>
            <Link href="/add-place" className="hv-featured-viewall">
              Be the first to add one →
            </Link>
          </div>
        ) : (
          <div className="hv-featured-grid">
            {places.map((place) => {
              const firstMedia = Array.isArray(place.mediaFiles) ? place.mediaFiles[0] : null
              const emoji = locationTypeEmoji[place.locationType] ?? '📍'

              return (
                <Link
                  key={place.id}
                  href={`/explore`}
                  className="hv-place-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="hv-place-card-img-wrap">
                    {firstMedia ? (
                      firstMedia.resourceType === 'video' ? (
                        <video
                          src={firstMedia.url}
                          className="hv-place-card-img"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firstMedia.url}
                          alt={place.title}
                          className="hv-place-card-img"
                          loading="lazy"
                        />
                      )
                    ) : (
                      <div className="hv-place-card-no-img">
                        <span style={{ fontSize: '3rem' }}>{emoji}</span>
                      </div>
                    )}
                  </div>
                  <div className="hv-place-card-overlay" />
                  <div className="hv-place-card-content">
                    {/* District — always shown */}
                    <div className="hv-place-card-district">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {place.district} District
                      {place.city && (
                        <span className="hv-place-card-city">· {place.city}</span>
                      )}
                    </div>
                    <h3 className="hv-place-card-title">{place.title}</h3>
                    <p className="hv-place-card-desc">
                      {place.description.length > 100
                        ? place.description.slice(0, 100) + '…'
                        : place.description}
                    </p>
                    <div className="hv-place-card-type">
                      {emoji} {place.locationType.charAt(0).toUpperCase() + place.locationType.slice(1)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
