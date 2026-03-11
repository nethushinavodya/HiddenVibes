import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['text', 'place', 'author', 'createdAt'],
    description: 'User comments on approved places.',
  },
  access: {
    // Anyone can read comments on approved places
    read: () => true,
    // Only authenticated users can create
    create: ({ req: { user } }) => Boolean(user),
    // Author can update their own comment; admins can update any
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { author: { equals: user.id } }
    },
    // Author or admin can delete
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { author: { equals: user.id } }
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && req.user) {
          data.author = req.user.id
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'place',
      type: 'relationship',
      relationTo: 'places',
      required: true,
      admin: { description: 'The place this comment belongs to.' },
    },
    {
      name: 'parentComment',
      type: 'relationship',
      relationTo: 'comments',
      required: false,
      label: 'Parent Comment (for replies)',
      admin: { description: 'Set when this is a reply to another comment.' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        description: 'Automatically set to the logged-in user.',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      maxLength: 500,
      admin: { description: 'The comment text.' },
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'likedBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}

