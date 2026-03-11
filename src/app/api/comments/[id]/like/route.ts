import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import type { Comment } from '@/payload-types'

function normalizeIds(likedBy: Comment['likedBy']): string[] {
  if (!Array.isArray(likedBy)) return []
  return likedBy.map((u) => (typeof u === 'string' ? u : (u as { id: string }).id))
}

// GET /api/comments/[id]/like — check like status for current user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })

  const comment = (await payload.findByID({ collection: 'comments', id, depth: 0 })) as Comment
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const likedBy = normalizeIds(comment.likedBy)
  return NextResponse.json({
    likes: comment.likes ?? 0,
    liked: user ? likedBy.includes(user.id) : false,
    likedBy,
  })
}

// POST /api/comments/[id]/like — toggle like
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const comment = (await payload.findByID({ collection: 'comments', id, depth: 0 })) as Comment
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const likedBy = normalizeIds(comment.likedBy)
  const alreadyLiked = likedBy.includes(user.id)
  const updatedLikedBy = alreadyLiked
    ? likedBy.filter((uid) => uid !== user.id)
    : [...likedBy, user.id]

  await payload.update({
    collection: 'comments',
    id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { likes: updatedLikedBy.length, likedBy: updatedLikedBy } as any,
    overrideAccess: true,
  })

  return NextResponse.json({
    liked: !alreadyLiked,
    likes: updatedLikedBy.length,
    likedBy: updatedLikedBy,
  })
}
