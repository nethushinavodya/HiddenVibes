import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/users/[id]/follow — returns { following, followers, isFollowing }
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  // Count how many people follow the target user
  const followersResult = await payload.count({
    collection: 'follows',
    where: { following: { equals: targetUserId } },
  })

  // Count how many people the target user follows
  const followingResult = await payload.count({
    collection: 'follows',
    where: { follower: { equals: targetUserId } },
  })

  // Check if the current user already follows this target
  let isFollowing = false
  if (user && user.id !== targetUserId) {
    const existing = await payload.find({
      collection: 'follows',
      where: {
        and: [
          { follower: { equals: user.id } },
          { following: { equals: targetUserId } },
        ],
      },
      limit: 1,
      depth: 0,
    })
    isFollowing = existing.totalDocs > 0
  }

  return NextResponse.json({
    followers: followersResult.totalDocs,
    following: followingResult.totalDocs,
    isFollowing,
  })
}

// POST /api/users/[id]/follow — toggle follow/unfollow
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized — please log in.' }, { status: 401 })
  }

  if (user.id === targetUserId) {
    return NextResponse.json({ error: 'You cannot follow yourself.' }, { status: 400 })
  }

  // Check if already following
  const existing = await payload.find({
    collection: 'follows',
    where: {
      and: [
        { follower: { equals: user.id } },
        { following: { equals: targetUserId } },
      ],
    },
    limit: 1,
    depth: 0,
  })

  const alreadyFollowing = existing.totalDocs > 0

  if (alreadyFollowing) {
    // Unfollow — delete the row
    await payload.delete({
      collection: 'follows',
      id: existing.docs[0].id,
      overrideAccess: true,
    })
  } else {
    // Follow — create a new row
    await payload.create({
      collection: 'follows',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { follower: user.id, following: targetUserId } as any,
      overrideAccess: true,
    })
  }

  // Return fresh counts
  const followersResult = await payload.count({
    collection: 'follows',
    where: { following: { equals: targetUserId } },
  })

  return NextResponse.json({
    isFollowing: !alreadyFollowing,
    followers: followersResult.totalDocs,
  })
}

