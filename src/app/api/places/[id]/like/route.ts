import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/places/[id]/like  — toggle like (create or delete a PostLike row)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: placeId } = await params
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized — please log in to like posts.' }, { status: 401 })
  }

  // Check if a like row already exists for this user + place
  const existing = await payload.find({
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

  const alreadyLiked = existing.totalDocs > 0

  if (alreadyLiked) {
    // Unlike — delete the row
    await payload.delete({
      collection: 'post-likes',
      id: existing.docs[0].id,
      overrideAccess: true,
    })
  } else {
    // Like — create a new row
    await payload.create({
      collection: 'post-likes',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { place: placeId, user: user.id } as any,
      overrideAccess: true,
    })
  }

  // Get fresh total count from the DB
  const total = await payload.count({
    collection: 'post-likes',
    where: { place: { equals: placeId } },
  })

  return NextResponse.json({
    liked: !alreadyLiked,
    likes: total.totalDocs,
  })
}

// GET /api/places/[id]/like  — get like count + whether current user liked
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: placeId } = await params
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })

  // Total likes count
  const total = await payload.count({
    collection: 'post-likes',
    where: { place: { equals: placeId } },
  })

  // Whether this user liked it
  let liked = false
  if (user) {
    const existing = await payload.find({
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
    liked = existing.totalDocs > 0
  }

  return NextResponse.json({
    likes: total.totalDocs,
    liked,
  })
}

