import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'pricing',
    title: 'Pricing Plan',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'planId',
            title: 'Plan ID',
            type: 'string',
            description: 'MUST match existing frontend plan IDs (e.g., "basic", "pro")',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'displayPrice',
            title: 'Display Price',
            type: 'string',
            description: 'Formatted price string (e.g., "₹499")',
        }),
        defineField({
            name: 'features',
            title: 'Features',
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Individual', value: 'individual' },
                    { title: 'Business', value: 'business' },
                ],
            },
        }),
    ],
})
