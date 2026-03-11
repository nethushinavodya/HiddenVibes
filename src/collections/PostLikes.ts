import type { CollectionConfig } from 'payload'
export const PostLikes: CollectionConfig = {
  slug: 'post-likes',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['place', 'user', 'createdAt'],
    description: 'One record per user-post like.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: () => false,
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { user: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'place',
      type: 'relationship',
      relationTo: 'places',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
  ],
  timestamps: true,
}