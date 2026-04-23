import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

// Use a local any-typed alias for the 'post-saves' collection to avoid generated payload-types mismatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SAVES_COLLECTION: any = 'post-saves'

// POST /api/places/[id]/save — toggle save/bookmark for the current user
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: placeId } = await params
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized — please log in to save posts.' }, { status: 401 })
  }

  // Check if a save row already exists for this user + place
  const existing = await payload.find({
    collection: SAVES_COLLECTION,
    where: {
      and: [
        { place: { equals: placeId } },
        { user: { equals: user.id } },
      ],
    },
    limit: 1,
    depth: 0,
  })

  const alreadySaved = existing.totalDocs > 0

  if (alreadySaved) {
    // Unsave — delete the row
    await payload.delete({
      collection: SAVES_COLLECTION,
      id: existing.docs[0].id,
      overrideAccess: true,
    })
  } else {
    // Save — create a new row
    await payload.create({
      collection: SAVES_COLLECTION,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { place: placeId, user: user.id } as any,
      overrideAccess: true,
    })
  }

  // Get fresh total count from the DB
  const total = await payload.count({
    collection: SAVES_COLLECTION,
    where: { place: { equals: placeId } },
  })

  return NextResponse.json({
    saved: !alreadySaved,
    saves: total.totalDocs,
  })
}

// GET /api/places/[id]/save — get save count + whether current user saved
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: placeId } = await params
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })

  // Total saves count
  const total = await payload.count({
    collection: SAVES_COLLECTION,
    where: { place: { equals: placeId } },
  })

  // Whether this user saved it
  let saved = false
  if (user) {
    const existing = await payload.find({
      collection: SAVES_COLLECTION,
      where: {
        and: [
          { place: { equals: placeId } },
          { user: { equals: user.id } },
        ],
      },
      limit: 1,
      depth: 0,
    })
    saved = existing.totalDocs > 0
  }

  return NextResponse.json({
    saves: total.totalDocs,
    saved,
  })
}
