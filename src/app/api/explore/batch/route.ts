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

  // Run all DB queries concurrently — one count per place for likes + comments
  const results = await Promise.all(
    placeIds.map(async (placeId) => {
      const [likesResult, commentsResult, userLikeResult] = await Promise.all([
        // Total like count
        payload.count({
          collection: 'post-likes',
          where: { place: { equals: placeId } },
        }),
        // Total top-level comment count
        payload.count({
          collection: 'comments',
          where: {
            and: [
              { place: { equals: placeId } },
              { parentComment: { exists: false } },
            ],
          },
        }),
        // Whether the current user liked this place
        user
          ? payload.find({
              collection: 'post-likes',
              where: {
                and: [
                  { place: { equals: placeId } },
                  { user: { equals: user.id } },
                ],
              },
              limit: 1,
              depth: 0,
            })
          : Promise.resolve(null),
      ])

      return {
        placeId,
        likes: likesResult.totalDocs,
        commentCount: commentsResult.totalDocs,
        liked: userLikeResult ? userLikeResult.totalDocs > 0 : false,
      }
    }),
  )

  // Shape into a map keyed by placeId for O(1) lookup on the client
  const map: Record<string, { likes: number; commentCount: number; liked: boolean }> = {}
  for (const r of results) {
    map[r.placeId] = { likes: r.likes, commentCount: r.commentCount, liked: r.liked }
  }

  return NextResponse.json(map)
}

