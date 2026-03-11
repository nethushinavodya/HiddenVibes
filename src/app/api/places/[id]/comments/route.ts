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
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '200', 10)
  const depth = parseInt(searchParams.get('depth') ?? '1', 10)

  const result = await payload.find({
    collection: 'comments',
    where: {
      and: [
        { place: { equals: id } },
        { parentComment: { exists: false } },
      ],
    },
    sort: 'createdAt',
    limit,
    depth,
  })

  if (limit === 0) {
    return NextResponse.json({ docs: [], total: result.totalDocs })
  }

  // Fetch reply counts for all top-level comments in parallel (single round-trip per comment, all concurrent)
  const docs = await Promise.all(
    result.docs.map(async (doc) => {
      const replyResult = await payload.count({
        collection: 'comments',
        where: { parentComment: { equals: doc.id } },
      })
      return { ...normalizeComment(doc as Comment), replyCount: replyResult.totalDocs }
    }),
  )

  return NextResponse.json({ docs, total: result.totalDocs })
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
