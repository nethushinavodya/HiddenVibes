import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, district, password } = await req.json()

    // Basic validation
    if (!firstName || !lastName || !email || !district || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Check if email already exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      return NextResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 },
      )
    }

    // Create the user – overrideAccess: true is fine here because this is a
    // public registration endpoint (the user doesn't exist yet)
    await payload.create({
      collection: 'users',
      data: {
        firstName,
        lastName,
        email,
        district,
        password,
        roles: ['user'],
        profileImage: null,
      },
    })

    return NextResponse.json({ message: 'Account created successfully.' }, { status: 201 })
  } catch (err: unknown) {
    console.error('[register]', err)
    const message = err instanceof Error ? err.message : 'Registration failed.'
    return NextResponse.json({ message }, { status: 500 })
  }
}
