import type { CollectionConfig } from 'payload'

export const Follows: CollectionConfig = {
  slug: 'follows',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['follower', 'following', 'createdAt'],
    description: 'One record per follower → following relationship.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: () => false,
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { follower: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'follower',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Follower (who follows)',
    },
    {
      name: 'following',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Following (who is followed)',
    },
  ],
  timestamps: true,
}

