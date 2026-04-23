import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/explore/batch
// Body: { placeIds: string[] }
// Returns: { [placeId]: { likes: number, liked: boolean, commentCount: number } }
// One single request replaces N*2 individual requests for the explore grid enrichment.
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  const body = await req.json()
  const placeIds: string[] = body?.placeIds ?? []

  if (!placeIds.length) {
    return NextResponse.json({})
  }

  // Batch 1: fetch all likes for these places
  const likesRes = await payload.find({
    collection: 'post-likes',
    where: { place: { in: placeIds } },
    depth: 0,
    limit: 10000,
  })
  const likeDocs = likesRes.docs ?? []
  const likesMap: Record<string, number> = {}
  for (const l of likeDocs) {
    const pid = typeof l.place === 'object' ? (l.place?.id ?? '') : (l.place as string)
    if (!pid) continue
    likesMap[pid] = (likesMap[pid] ?? 0) + 1
  }

  // Batch 2: fetch top-level comments for these places
  const commentsRes = await payload.find({
    collection: 'comments',
    where: {
      and: [
        { place: { in: placeIds } },
        { parentComment: { exists: false } },
      ],
    },
    depth: 0,
    limit: 10000,
  })
  const commentDocs = commentsRes.docs ?? []
  const commentsMap: Record<string, number> = {}
  for (const c of commentDocs) {
    const pid = typeof c.place === 'object' ? (c.place?.id ?? '') : (c.place as string)
    if (!pid) continue
    commentsMap[pid] = (commentsMap[pid] ?? 0) + 1
  }

  // Batch 3: if user exists, fetch their likes for these places
  const userLikesMap: Record<string, boolean> = {}
  if (user) {
    const userLikesRes = await payload.find({
      collection: 'post-likes',
      where: {
        and: [{ place: { in: placeIds } }, { user: { equals: user.id } }],
      },
      depth: 0,
      limit: 10000,
    })
    const userLikeDocs = userLikesRes.docs ?? []
    for (const ul of userLikeDocs) {
      const pid = typeof ul.place === 'object' ? (ul.place?.id ?? '') : (ul.place as string)
      if (!pid) continue
      userLikesMap[pid] = true
    }
  }

  // Build response map
  const map: Record<string, { likes: number; commentCount: number; liked: boolean }> = {}
  for (const pid of placeIds) {
    map[pid] = {
      likes: likesMap[pid] ?? 0,
      commentCount: commentsMap[pid] ?? 0,
      liked: userLikesMap[pid] ?? false,
    }
  }

  return NextResponse.json(map)
}
