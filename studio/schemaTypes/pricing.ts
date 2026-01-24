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
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 2,
        }),
        defineField({
            name: 'price',
            title: 'Price (Numeric)',
            type: 'number',
            description: 'Used for payment calculations (e.g. 5500)',
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: 'isPopular',
            title: 'Is Popular?',
            type: 'boolean',
            initialValue: false,
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
                    { title: 'Claryntia: General', value: 'general' },
                    { title: 'Mentoria: 8-9 Students', value: '8-9 Students' },
                    { title: 'Mentoria: 10-12 Students', value: '10-12 Students' },
                    { title: 'Mentoria: College Graduates', value: 'College Graduates' },
                    { title: 'Mentoria: Working Professionals', value: 'Working Professionals' },
                ],
            },
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            initialValue: 0,
        }),
    ],
})
