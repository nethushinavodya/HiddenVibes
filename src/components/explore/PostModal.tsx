'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  MoreHorizontal,
  MapPin,
  Tag,
  DollarSign,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  CornerDownRight,
} from 'lucide-react'
import type { PlacePost, MediaFile } from './PlaceCard'
import normalizeLocation from '@/utils/normalizeLocation'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CommentAuthor {
  id: string
  firstName?: string
  lastName?: string
  email?: string
}

interface DbComment {
  id: string
  text: string
  author: CommentAuthor | string
  likes: number
  likedBy?: string[]
  createdAt: string
  replies?: DbComment[]
  repliesLoaded?: boolean
  repliesLoading?: boolean
  showReplies?: boolean
  replyCount?: number
}

interface PostModalProps {
  place: PlacePost | null
  onClose: () => void
  currentUserId?: string | null
  onLikeUpdate?: (placeId: string, liked: boolean, likes: number) => void
  onCommentCountChange?: (placeId: string, delta: number) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const locationTypeLabel: Record<string, string> = {
  waterfall: 'Waterfall',
  beach: 'Beach / Lagoon',
  forest: 'Forest / Jungle',
  ruins: 'Ancient Ruins / Temple',
  viewpoint: 'Viewpoint / Hilltop',
  cave: 'Cave',
  river: 'River / Stream',
  wildlife: 'Wildlife / Nature Reserve',
  village: 'Village / Cultural Site',
  other: 'Other',
}

const entryFeeLabel: Record<string, string> = {
  free: 'Free Entry',
  small: 'Small Fee (< LKR 500)',
  moderate: 'Moderate Fee (LKR 500–2000)',
  high: 'High Fee (> LKR 2000)',
  unknown: 'Fee Unknown',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function authorName(author: CommentAuthor | string): string {
  if (typeof author === 'string') return 'user'
  return (
    `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() ||
    author.email?.split('@')[0] ||
    'user'
  )
}

function authorInitial(author: CommentAuthor | string): string {
  return authorName(author)[0]?.toUpperCase() ?? 'U'
}

// ── Reply Input sub-component ─────────────────────────────────────────────────

function ReplyInput({
                      commentId,
                      currentUserId: _currentUserId,
                      onSubmit,
                      onCancel,
                    }: {
  commentId: string
  currentUserId: string
  onSubmit: (commentId: string, text: string) => Promise<void>
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = text.trim()
    if (!val) return
    setSubmitting(true)
    await onSubmit(commentId, val)
    setSubmitting(false)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="hv-reply-form">
      <input
        ref={ref}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply…"
        className="hv-reply-input"
        maxLength={500}
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={!text.trim() || submitting}
        className="hv-reply-submit"
        aria-label="Post reply"
      >
        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
      </button>
      <button type="button" onClick={onCancel} className="hv-reply-cancel">
        Cancel
      </button>
    </form>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PostModal({ place, onClose, currentUserId, onLikeUpdate, onCommentCountChange }: PostModalProps) {
  const [mediaIdx, setMediaIdx] = useState(0)

  // Like state
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)

  // Save
  const [saved, setSaved] = useState(false)

  // Comments
  const [comments, setComments] = useState<DbComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  // Which comment has the reply box open
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  // Video
  const [videoMuted, setVideoMuted] = useState(true)
  const [videoPlaying, setVideoPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const commentsRef = useRef<HTMLDivElement>(null)

  // ── Derived: post owner id ───────────────────────────────────────────────
  const postOwnerId =
    typeof place?.submittedBy === 'object' && place?.submittedBy
      ? place.submittedBy.id
      : null
  const isOwnPost = Boolean(currentUserId && postOwnerId && currentUserId === postOwnerId)

  // ── Load place data ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!place) return
    setMediaIdx(0)
    setCommentInput('')
    setVideoMuted(true)
    setVideoPlaying(true)
    setReplyingTo(null)
    setIsFollowing(false)
    setFollowerCount(0)

    // Set initial like state from the prop
    setLiked(place.liked ?? false)
    setLikeCount(place.likes ?? 0)

    // Load follow status + comments in parallel — no serial waterfalls
    const ownerId = typeof place.submittedBy === 'object' && place.submittedBy
      ? place.submittedBy.id : null

    setCommentsLoading(true)

    const followPromise = ownerId
      ? fetch(`/api/users/${ownerId}/follow`, { credentials: 'include' })
          .then((r) => r.json())
          .then((d) => { setIsFollowing(d.isFollowing ?? false); setFollowerCount(d.followers ?? 0) })
          .catch(() => {})
      : Promise.resolve()

    const commentsPromise = fetch(`/api/places/${place.id}/comments`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        // replyCount now comes inline from the API — no extra fetches needed
        setComments((d.docs ?? []) as DbComment[])
      })
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false))

    Promise.all([followPromise, commentsPromise])
  }, [place])

  // ── ESC / Arrow keys ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!place) return
    const mediaLen = place.mediaFiles?.length ?? 1
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setMediaIdx((i) => (i + 1) % mediaLen)
      if (e.key === 'ArrowLeft') setMediaIdx((i) => (i - 1 + mediaLen) % mediaLen)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = '' }
  }, [place, onClose])

  const mediaFiles: MediaFile[] = place?.mediaFiles ?? []
  const currentMedia = mediaFiles[mediaIdx]

  const nextMedia = useCallback(() => setMediaIdx((i) => (i + 1) % mediaFiles.length), [mediaFiles.length])
  const prevMedia = useCallback(() => setMediaIdx((i) => (i - 1 + mediaFiles.length) % mediaFiles.length), [mediaFiles.length])

  // ── Like place ───────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!place || likeLoading) return
    if (!currentUserId) { alert('Please log in to like places.'); return }
    setLikeLoading(true)
    // Snapshot current state for rollback
    const prevLiked = liked
    const prevCount = likeCount
    // Optimistic update
    setLiked(!prevLiked)
    setLikeCount((c) => (prevLiked ? c - 1 : c + 1))
    try {
      const res = await fetch(`/api/places/${place.id}/like`, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        // Sync to exact server state
        setLiked(data.liked)
        setLikeCount(data.likes)
        // Notify parent so the card hover overlay updates too
        onLikeUpdate?.(place.id, data.liked, data.likes)
      } else {
        // Revert on server error
        setLiked(prevLiked)
        setLikeCount(prevCount)
      }
    } catch {
      // Revert on network error
      setLiked(prevLiked)
      setLikeCount(prevCount)
    } finally {
      setLikeLoading(false)
    }
  }

  // ── Post top-level comment ────────────────────────────────────────────────
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = commentInput.trim()
    if (!text || !place) return
    if (!currentUserId) { alert('Please log in to comment.'); return }
    setCommentSubmitting(true)
    try {
      const res = await fetch(`/api/places/${place.id}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (res.ok) {
        setComments((prev) => [...prev, { ...data, replies: [], repliesLoaded: true, showReplies: false }])
        setCommentInput('')
        onCommentCountChange?.(place.id, 1)
        setTimeout(() => commentsRef.current?.scrollTo({ top: commentsRef.current.scrollHeight, behavior: 'smooth' }), 50)
      }
    } finally { setCommentSubmitting(false) }
  }

  // ── Like a comment ───────────────────────────────────────────────────────
  const handleCommentLike = async (commentId: string, isReply = false, parentId?: string) => {
    if (!currentUserId) { alert('Please log in to like comments.'); return }

    // Optimistic toggle in local state
    const optimisticUpdate = (list: DbComment[]): DbComment[] =>
      list.map((c) => {
        if (c.id !== commentId) return c
        const wasLiked = (c.likedBy ?? []).includes(currentUserId)
        return {
          ...c,
          likes: wasLiked ? c.likes - 1 : c.likes + 1,
          likedBy: wasLiked
            ? (c.likedBy ?? []).filter((id) => id !== currentUserId)
            : [...(c.likedBy ?? []), currentUserId],
        }
      })

    if (isReply && parentId) {
      setComments((prev) => prev.map((c) => c.id === parentId ? { ...c, replies: optimisticUpdate(c.replies ?? []) } : c))
    } else {
      setComments((prev) => optimisticUpdate(prev))
    }

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        // Sync with exact server state — server returns the authoritative likedBy array
        const syncUpdate = (list: DbComment[]): DbComment[] =>
          list.map((c) =>
            c.id === commentId
              ? { ...c, likes: data.likes, likedBy: data.likedBy ?? [] }
              : c,
          )
        if (isReply && parentId) {
          setComments((prev) => prev.map((c) => c.id === parentId ? { ...c, replies: syncUpdate(c.replies ?? []) } : c))
        } else {
          setComments((prev) => syncUpdate(prev))
        }
      }
    } catch { /* optimistic state stays until next reload */ }
  }

  // ── Load replies for a comment ────────────────────────────────────────────
  const loadReplies = async (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) return

    // Toggle collapse if already loaded
    if (comment.repliesLoaded) {
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, showReplies: !c.showReplies } : c),
      )
      return
    }

    setComments((prev) =>
      prev.map((c) => c.id === commentId ? { ...c, repliesLoading: true, showReplies: true } : c),
    )
    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, { credentials: 'include' })
      const data = await res.json()
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies: data.docs ?? [], repliesLoaded: true, repliesLoading: false, showReplies: true }
            : c,
        ),
      )
    } catch {
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, repliesLoading: false } : c),
      )
    }
  }

  // ── Post a reply ──────────────────────────────────────────────────────────
  const handleReply = async (commentId: string, text: string) => {
    if (!currentUserId) return
    const res = await fetch(`/api/comments/${commentId}/replies`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const data = await res.json()
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
              ...c,
              replies: [...(c.replies ?? []), data],
              repliesLoaded: true,
              showReplies: true,
              replyCount: (c.replyCount ?? 0) + 1,
            }
            : c,
        ),
      )
      onCommentCountChange?.(place!.id, 1)
      setReplyingTo(null)
    }
  }

  // ── Video ────────────────────────────────────────────────────────────────
  const toggleVideoPlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) { videoRef.current.play(); setVideoPlaying(true) }
    else { videoRef.current.pause(); setVideoPlaying(false) }
  }
  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setVideoMuted(videoRef.current.muted)
  }

  // ── Follow user ──────────────────────────────────────────────────────────
  const handleFollow = async () => {
    if (!postOwnerId || followLoading) return
    if (!currentUserId) { alert('Please log in to follow users.'); return }
    setFollowLoading(true)
    const prevFollowing = isFollowing
    const prevCount = followerCount
    // Optimistic update
    setIsFollowing(!prevFollowing)
    setFollowerCount((c) => prevFollowing ? c - 1 : c + 1)
    try {
      const res = await fetch(`/api/users/${postOwnerId}/follow`, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setIsFollowing(data.isFollowing)
        setFollowerCount(data.followers)
      } else {
        setIsFollowing(prevFollowing)
        setFollowerCount(prevCount)
      }
    } catch {
      setIsFollowing(prevFollowing)
      setFollowerCount(prevCount)
    } finally {
      setFollowLoading(false)
    }
  }

  const submitterName =
    typeof place?.submittedBy === 'object' && place?.submittedBy
      ? `${place.submittedBy.firstName ?? ''} ${place.submittedBy.lastName ?? ''}`.trim() ||
      place.submittedBy.email?.split('@')[0] || 'explorer'
      : 'explorer'
  const submitterInitial = submitterName[0]?.toUpperCase() ?? 'E'

  const isPostOwner = (author: CommentAuthor | string): boolean => {
    if (!postOwnerId) return false
    if (typeof author === 'string') return author === postOwnerId
    return author.id === postOwnerId
  }

  if (!place) return null

  return (
    <div
      className="hv-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={place.title}
    >
      <div className="hv-modal">
        {/* Close */}
        <button className="hv-modal__close" onClick={onClose} aria-label="Close">
          <X className="w-6 h-6" />
        </button>

        {/* ── LEFT: Media ── */}
        <div className="hv-modal__media-side">
          <div className="hv-modal__media-wrap">
            {currentMedia?.resourceType === 'video' ? (
              <div className="hv-modal__video-container" onClick={toggleVideoPlay}>
                <video
                  ref={videoRef}
                  key={currentMedia.url}
                  src={currentMedia.url}
                  className="hv-modal__media-content"
                  autoPlay loop muted={videoMuted} playsInline
                />
                <div className="hv-modal__video-controls">
                  <button className="hv-modal__video-btn" onClick={(e) => { e.stopPropagation(); toggleVideoPlay() }} aria-label={videoPlaying ? 'Pause' : 'Play'}>
                    {videoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button className="hv-modal__video-btn" onClick={(e) => { e.stopPropagation(); toggleMute() }} aria-label={videoMuted ? 'Unmute' : 'Mute'}>
                    {videoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : currentMedia ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={currentMedia.url} src={currentMedia.url} alt={currentMedia.caption ?? place.title} className="hv-modal__media-content" />
            ) : (
              <div className="hv-modal__no-media">
                <MapPin className="w-12 h-12" style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
            )}
            {mediaFiles.length > 1 && (
              <>
                <button className="hv-modal__media-arrow hv-modal__media-arrow--left" onClick={prevMedia} aria-label="Previous"><ChevronLeft className="w-5 h-5" /></button>
                <button className="hv-modal__media-arrow hv-modal__media-arrow--right" onClick={nextMedia} aria-label="Next"><ChevronRight className="w-5 h-5" /></button>
                <div className="hv-modal__media-dots">
                  {mediaFiles.map((_, i) => (
                    <button key={i} className={`hv-modal__dot${i === mediaIdx ? ' hv-modal__dot--active' : ''}`} onClick={() => setMediaIdx(i)} aria-label={`Media ${i + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Info + Comments ── */}
        <div className="hv-modal__info-side">
          {/* Header */}
          <div className="hv-modal__header">
            <div className="hv-modal__avatar">{submitterInitial}</div>
            <div className="hv-modal__header-text">
              <span className="hv-modal__username">{submitterName}</span>
              <span className="hv-modal__location">
                <MapPin className="w-3 h-3 inline mr-0.5" />
                {(() => {
                  const { district, city, formatted } = normalizeLocation(place)
                  return formatted || place.title
                })()}
              </span>
            </div>
            {/* Follow button — hidden for own posts or when not logged in */}
            {!isOwnPost && postOwnerId && (
              <button
                className={`hv-modal__follow-btn${isFollowing ? ' hv-modal__follow-btn--following' : ''}`}
                onClick={handleFollow}
                disabled={followLoading}
                aria-label={isFollowing ? 'Unfollow' : 'Follow'}
              >
                {followLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isFollowing ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </button>
            )}
            <button className="hv-modal__more" aria-label="More options"><MoreHorizontal className="w-5 h-5" /></button>
          </div>

          {/* Details */}
          <div className="hv-modal__details">
            <p className="hv-modal__description">{place.description}</p>
            <div className="hv-modal__tags">
              {place.locationType && (
                <span className="hv-modal__tag"><Tag className="w-3 h-3" />{locationTypeLabel[place.locationType] ?? place.locationType}</span>
              )}
              {place.entryFee && (
                <span className="hv-modal__tag"><DollarSign className="w-3 h-3" />{entryFeeLabel[place.entryFee] ?? place.entryFee}</span>
              )}
              {typeof place.submittedBy === 'object' && place.submittedBy?.district && (
                <span className="hv-modal__tag"><MapPin className="w-3 h-3" />{normalizeLocation(place).district ?? place.submittedBy.district}</span>
              )}
            </div>
            <p className="hv-modal__time">{timeAgo(place.createdAt)}</p>
          </div>

          <hr className="hv-modal__divider" />

          {/* Comments list */}
          <div className="hv-modal__comments" ref={commentsRef}>
            {commentsLoading ? (
              <div className="hv-modal__comments-loading">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#8e8e8e' }} />
              </div>
            ) : comments.length === 0 ? (
              <p className="hv-modal__no-comments">No comments yet. Be the first!</p>
            ) : (
              comments.map((c) => {
                const isLikedByMe = currentUserId ? (c.likedBy ?? []).includes(currentUserId) : false
                const replyCount = c.replyCount ?? (c.replies?.length ?? 0)

                return (
                  <div key={c.id} className="hv-modal__comment-block">
                    {/* ── Top-level comment ── */}
                    <div className="hv-modal__comment">
                      <div className="hv-modal__comment-avatar">{authorInitial(c.author)}</div>
                      <div className="hv-modal__comment-body">
                        <span className="hv-modal__comment-user">{authorName(c.author)}</span>{' '}
                        <span className="hv-modal__comment-text">{c.text}</span>
                        <div className="hv-modal__comment-meta">
                          <span>{timeAgo(c.createdAt)}</span>
                          {c.likes > 0 && <span>{c.likes} {c.likes === 1 ? 'like' : 'likes'}</span>}
                          {currentUserId && (
                            <button
                              className="hv-modal__reply-btn"
                              onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                            >
                              Reply
                            </button>
                          )}
                          {replyCount > 0 && (
                            <button className="hv-modal__view-replies-btn" onClick={() => loadReplies(c.id)}>
                              {c.repliesLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                              ) : (
                                <CornerDownRight className="w-3 h-3 inline mr-1" />
                              )}
                              {c.showReplies ? 'Hide' : `View`} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        className={`hv-modal__comment-like${isLikedByMe ? ' liked' : ''}`}
                        onClick={() => handleCommentLike(c.id)}
                        aria-label="Like comment"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLikedByMe ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>

                    {/* ── Reply input box ── */}
                    {replyingTo === c.id && currentUserId && (
                      <div className="hv-modal__reply-input-wrap">
                        <ReplyInput
                          commentId={c.id}
                          currentUserId={currentUserId}
                          onSubmit={handleReply}
                          onCancel={() => setReplyingTo(null)}
                        />
                      </div>
                    )}

                    {/* ── Replies list ── */}
                    {c.showReplies && (c.replies ?? []).length > 0 && (
                      <div className="hv-modal__replies">
                        {(c.replies ?? []).map((r) => {
                          const isReplyLikedByMe = currentUserId ? (r.likedBy ?? []).includes(currentUserId) : false
                          return (
                            <div key={r.id} className="hv-modal__comment hv-modal__comment--reply">
                              <div className="hv-modal__comment-avatar hv-modal__comment-avatar--sm">{authorInitial(r.author)}</div>
                              <div className="hv-modal__comment-body">
                                <span className="hv-modal__comment-user">{authorName(r.author)}</span>{' '}
                                <span className="hv-modal__comment-text">{r.text}</span>
                                <div className="hv-modal__comment-meta">
                                  <span>{timeAgo(r.createdAt)}</span>
                                  {r.likes > 0 && <span>{r.likes} {r.likes === 1 ? 'like' : 'likes'}</span>}
                                </div>
                              </div>
                              <button
                                className={`hv-modal__comment-like${isReplyLikedByMe ? ' liked' : ''}`}
                                onClick={() => handleCommentLike(r.id, true, c.id)}
                                aria-label="Like reply"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isReplyLikedByMe ? 'fill-red-500 text-red-500' : ''}`} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Actions */}
          <div className="hv-modal__actions">
            <div className="hv-modal__action-row">
              <div className="hv-modal__action-left">
                <button className={`hv-modal__action-btn${liked ? ' liked' : ''}`} onClick={handleLike} aria-label={liked ? 'Unlike' : 'Like'} disabled={likeLoading}>
                  <Heart className={`w-6 h-6 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-800'}`} />
                </button>
                <button className="hv-modal__action-btn" onClick={() => inputRef.current?.focus()} aria-label="Comment">
                  <MessageCircle className="w-6 h-6 text-gray-800" />
                </button>
              </div>
              <button className={`hv-modal__action-btn${saved ? ' saved' : ''}`} onClick={() => setSaved((p) => !p)} aria-label={saved ? 'Unsave' : 'Save'}>
                <Bookmark className={`w-6 h-6 transition-all ${saved ? 'fill-black text-black' : 'text-gray-800'}`} />
              </button>
            </div>
            {likeCount > 0 && (
              <p className="hv-modal__like-count"><strong>{likeCount}</strong> {likeCount === 1 ? 'like' : 'likes'}</p>
            )}
          </div>

          {/* Comment input */}
          <div className="hv-modal__comment-input-row">
            <form onSubmit={handleComment} className="hv-modal__comment-form">
              <input
                ref={inputRef}
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={currentUserId ? 'Add a comment…' : 'Log in to comment…'}
                className="hv-modal__comment-input"
                maxLength={500}
                disabled={!currentUserId || commentSubmitting}
              />
              <button
                type="submit"
                disabled={!commentInput.trim() || commentSubmitting || !currentUserId}
                className="hv-modal__comment-submit"
                aria-label="Post comment"
              >
                {commentSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
