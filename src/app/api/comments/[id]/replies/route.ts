import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import type { Comment } from '@/payload-types'

// Normalize likedBy to plain string IDs
function normalizeComment(doc: Comment) {
  return {
    ...doc,
    likedBy: Array.isArray(doc.likedBy)
      ? doc.likedBy.map((u) => (typeof u === 'string' ? u : (u as { id: string }).id))
      : [],
  }
}

// GET /api/comments/[id]/replies
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'comments',
    where: { parentComment: { equals: id } },
    sort: 'createdAt',
    limit: 100,
    depth: 1,
  })

  return NextResponse.json({
    docs: result.docs.map(normalizeComment),
    total: result.totalDocs,
  })
}

// POST /api/comments/[id]/replies
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parent = await payload.findByID({ collection: 'comments', id, depth: 0 })
  if (!parent) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  const body = await req.json()
  const text = (body?.text ?? '').trim()
  if (!text) {
    return NextResponse.json({ error: 'Reply text is required' }, { status: 400 })
  }
  if (text.length > 500) {
    return NextResponse.json({ error: 'Reply too long (max 500 chars)' }, { status: 400 })
  }

  const placeId = typeof parent.place === 'string' ? parent.place : (parent.place as { id: string }).id

  const reply = (await payload.create({
    collection: 'comments',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { place: placeId, parentComment: id, author: user.id, text, likes: 0, likedBy: [] } as any,
    req,
  })) as Comment

  return NextResponse.json(normalizeComment(reply), { status: 201 })
}
