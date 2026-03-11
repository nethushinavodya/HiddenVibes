import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import type { Comment } from '@/payload-types'

// Normalize likedBy to plain string IDs regardless of depth
function normalizeComment(doc: Comment) {
  return {
    ...doc,
    likedBy: Array.isArray(doc.likedBy)
      ? doc.likedBy.map((u) => (typeof u === 'string' ? u : (u as { id: string }).id))
      : [],
  }
}

// GET /api/places/[id]/comments
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'comments',
    where: {
      and: [
        { place: { equals: id } },
        // only top-level comments (no parentComment set)
        { parentComment: { exists: false } },
      ],
    },
    sort: 'createdAt',
    limit: 200,
    depth: 1,
  })

  return NextResponse.json({
    docs: result.docs.map(normalizeComment),
    total: result.totalDocs,
  })
}

// POST /api/places/[id]/comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const text = (body?.text ?? '').trim()
  if (!text) {
    return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
  }
  if (text.length > 500) {
    return NextResponse.json({ error: 'Comment too long (max 500 chars)' }, { status: 400 })
  }

  const comment = (await payload.create({
    collection: 'comments',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { place: id, author: user.id, text, likes: 0, likedBy: [] } as any,
    req,
  })) as Comment

  return NextResponse.json(normalizeComment(comment), { status: 201 })
}
