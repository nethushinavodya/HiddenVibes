'use client'

import React from 'react'
import { Heart, MessageCircle, Play } from 'lucide-react'

export interface MediaFile {
  url: string
  publicId: string
  resourceType: 'image' | 'video'
  caption?: string | null
  id?: string | null
}

export interface PlacePost {
  id: string
  title: string
  description: string
  locationType: string
  district?: string | null
  city?: string | null
  entryFee?: string | null
  mediaFiles?: MediaFile[] | null
  submittedBy?: { id: string; firstName?: string; lastName?: string; email?: string; district?: string } | string | null
  status: string
  createdAt: string
  likes?: number
  liked?: boolean
  likedBy?: string[]
  saved?: boolean
  commentCount?: number
}

interface PlaceCardProps {
  place: PlacePost
  onClick: (place: PlacePost) => void
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

export default function PlaceCard({ place, onClick }: PlaceCardProps) {
  const firstMedia = place.mediaFiles?.[0]
  const hasMultiple = (place.mediaFiles?.length ?? 0) > 1
  const isVideo = firstMedia?.resourceType === 'video'

  return (
    <div
      className="hv-place-card"
      onClick={() => onClick(place)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(place)}
      aria-label={`View ${place.title}`}
    >
      {/* Media thumbnail */}
      <div className="hv-place-card__media">
        {firstMedia ? (
          isVideo ? (
            <video
              src={firstMedia.url}
              className="hv-place-card__img"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={firstMedia.url}
              alt={place.title}
              className="hv-place-card__img"
              loading="lazy"
            />
          )
        ) : (
          <div className="hv-place-card__no-media">
            <span>{locationTypeEmoji[place.locationType] ?? '📍'}</span>
          </div>
        )}

        {/* Overlay icons */}
        <div className="hv-place-card__overlay">
          <div className="hv-place-card__overlay-stats">
            <span>
              <Heart className="w-5 h-5 fill-white text-white drop-shadow" />
              {place.likes ?? 0}
            </span>
            <span>
              <MessageCircle className="w-5 h-5 fill-white text-white drop-shadow" />
              {place.commentCount ?? 0}
            </span>
          </div>
        </div>

        {/* Multi-media badge */}
        {hasMultiple && (
          <div className="hv-place-card__multi-badge" title="Multiple photos">
            <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm16-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2V4z" />
            </svg>
          </div>
        )}

        {/* Video badge */}
        {isVideo && (
          <div className="hv-place-card__video-badge">
            <Play className="w-4 h-4 fill-white text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

