import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  try {
    const place = await payload.findByID({
      collection: 'places',
      id,
      depth: 1,
      overrideAccess: false,
      user: user ?? undefined,
    })

    return NextResponse.json(place)
  } catch {
    return NextResponse.json({ message: 'Place not found.' }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    status?: 'pending' | 'approved' | 'rejected'
    adminNotes?: string
  }

  const isAdmin = user.roles?.includes('admin')

  if (!isAdmin) {
    return NextResponse.json({ message: 'Only admins can review submissions.' }, { status: 403 })
  }

  if (!body.status || !['pending', 'approved', 'rejected'].includes(body.status)) {
    return NextResponse.json({ message: 'A valid status is required.' }, { status: 400 })
  }

  try {
    const updated = await payload.update({
      collection: 'places',
      id,
      data: {
        status: body.status,
        ...(typeof body.adminNotes === 'string' ? { adminNotes: body.adminNotes } : {}),
      },
      req,
      overrideAccess: true,
      context: { adminOverride: true },
    })

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      adminNotes: updated.adminNotes,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update place status.'
    payload.logger.error(`[Places Review] Failed to update ${id}: ${message}`)
    return NextResponse.json({ message }, { status: 400 })
  }
}
