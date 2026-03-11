import type { CollectionConfig, Where } from 'payload'

export const Places: CollectionConfig = {
  slug: 'places',
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'locationType',
      'entryFee',
      'status',
      'submittedBy',
      'createdAt',
      'actions',
    ],
    description:
      'Community-submitted hidden places across Sri Lanka. Review and approve/reject submissions.',
  },
  access: {
    // Unauthenticated → approved only; users → approved + own; admin → all
    read: ({ req: { user } }): boolean | Where => {
      if (user?.roles?.includes('admin')) return true
      if (!user) return { status: { equals: 'approved' } } as Where
      return {
        or: [{ status: { equals: 'approved' } }, { submittedBy: { equals: user.id } }],
      } as Where
    },
    // Authenticated users can create
    create: ({ req: { user } }) => Boolean(user),
    // Admin can update anything; users can update own pending submissions OR likes fields (via overrideAccess in like route)
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      // Users can update their own pending submissions
      const constraint: Where = {
        and: [{ submittedBy: { equals: user.id } }, { status: { equals: 'pending' } }],
      }
      return constraint
    },
    // Admin only can delete
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req, context }) => {
        if (operation === 'create' && req.user) {
          data.submittedBy = req.user.id
          data.status = 'pending'
        }
        // Prevent non-admins from changing status/adminNotes.
        // The review API passes context.adminOverride for trusted admin actions.
        if (
          operation === 'update' &&
          !context?.adminOverride &&
          !req.user?.roles?.includes('admin')
        ) {
          delete data.status
          delete data.adminNotes
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          req.payload.logger.info(
            `[Places] New submission "${doc.title}" (id: ${doc.id}) by user ${doc.submittedBy} — status: pending`,
          )
        }
        if (operation === 'update' && (doc.status === 'approved' || doc.status === 'rejected')) {
          req.payload.logger.info(
            `[Places] "${doc.title}" (id: ${doc.id}) was ${doc.status.toUpperCase()} by admin`,
          )
        }
        return doc
      },
    ],
  },
  fields: [
    // ── Fields that match the submission form ─────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the hidden place.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'What makes this place special.',
        rows: 5,
      },
    },
    {
      name: 'locationType',
      type: 'select',
      required: true,
      label: 'Type of Place',
      options: [
        { label: 'Waterfall', value: 'waterfall' },
        { label: 'Beach / Lagoon', value: 'beach' },
        { label: 'Forest / Jungle', value: 'forest' },
        { label: 'Ancient Ruins / Temple', value: 'ruins' },
        { label: 'Viewpoint / Hilltop', value: 'viewpoint' },
        { label: 'Cave', value: 'cave' },
        { label: 'River / Stream', value: 'river' },
        { label: 'Wildlife / Nature Reserve', value: 'wildlife' },
        { label: 'Village / Cultural Site', value: 'village' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'entryFee',
      type: 'select',
      label: 'Entry Fee',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Small Fee (< LKR 500)', value: 'small' },
        { label: 'Moderate Fee (LKR 500 – 2000)', value: 'moderate' },
        { label: 'High Fee (> LKR 2000)', value: 'high' },
        { label: 'Unknown', value: 'unknown' },
      ],
    },
    {
      name: 'district',
      type: 'select',
      label: 'District',
      required: true,
      options: [
        { label: 'Ampara', value: 'Ampara' },
        { label: 'Anuradhapura', value: 'Anuradhapura' },
        { label: 'Badulla', value: 'Badulla' },
        { label: 'Batticaloa', value: 'Batticaloa' },
        { label: 'Colombo', value: 'Colombo' },
        { label: 'Galle', value: 'Galle' },
        { label: 'Gampaha', value: 'Gampaha' },
        { label: 'Hambantota', value: 'Hambantota' },
        { label: 'Jaffna', value: 'Jaffna' },
        { label: 'Kalutara', value: 'Kalutara' },
        { label: 'Kandy', value: 'Kandy' },
        { label: 'Kegalle', value: 'Kegalle' },
        { label: 'Kilinochchi', value: 'Kilinochchi' },
        { label: 'Kurunegala', value: 'Kurunegala' },
        { label: 'Mannar', value: 'Mannar' },
        { label: 'Matale', value: 'Matale' },
        { label: 'Matara', value: 'Matara' },
        { label: 'Monaragala', value: 'Monaragala' },
        { label: 'Mullaitivu', value: 'Mullaitivu' },
        { label: 'Nuwara Eliya', value: 'Nuwara Eliya' },
        { label: 'Polonnaruwa', value: 'Polonnaruwa' },
        { label: 'Puttalam', value: 'Puttalam' },
        { label: 'Ratnapura', value: 'Ratnapura' },
        { label: 'Trincomalee', value: 'Trincomalee' },
        { label: 'Vavuniya', value: 'Vavuniya' },
      ],
      admin: { description: 'District where the place is located.' },
    },
    {
      name: 'city',
      type: 'text',
      label: 'City / Town / Village',
      admin: { description: 'Nearest city, town or village.' },
    },
    // ── Media preview + raw array ─────────────────────────────────────────
    {
      name: 'mediaPreview',
      type: 'ui',
      label: 'Media Preview',
      admin: {
        components: {
          Field: '/components/admin/MediaPreviewField',
        },
      },
    },
    {
      name: 'mediaFiles',
      type: 'array',
      label: 'Photos / Videos (raw data)',
      maxRows: 10,
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'Cloudinary URL',
          admin: { readOnly: true },
        },
        {
          name: 'publicId',
          type: 'text',
          required: true,
          label: 'Cloudinary Public ID',
          admin: { readOnly: true },
        },
        {
          name: 'resourceType',
          type: 'select',
          required: true,
          label: 'Type',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
          defaultValue: 'image',
          admin: { readOnly: true },
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
          admin: { readOnly: true },
        },
      ],
      admin: {
        description: 'Raw Cloudinary data — use Media Preview above to view images/videos.',
      },
    },
    // ── Submission Meta ───────────────────────────────────────────────────
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
      admin: {
        readOnly: true,
        description: 'Automatically set to the logged-in user who submitted this place.',
      },
    },
    // ── Admin Review ──────────────────────────────────────────────────────
    {
      name: 'reviewActions',
      type: 'ui',
      label: 'Review Actions',
      admin: {
        components: {
          Field: '/components/admin/ReviewActions',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: '⏳ Pending Review', value: 'pending' },
        { label: '✅ Approved', value: 'approved' },
        { label: '❌ Rejected', value: 'rejected' },
      ],
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
      admin: {
        description: 'Set by admin after reviewing the submission.',
        components: {
          Cell: '/components/admin/StatusCell',
        },
      },
    },
    {
      name: 'actions',
      type: 'ui',
      label: 'Actions',
      admin: {
        components: {
          Cell: '/components/admin/ReviewCell',
        },
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes / Rejection Reason',
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
      admin: {
        description: 'Shown to the submitter — explain why it was approved or rejected.',
      },
    },
  ],
  timestamps: true,
}
