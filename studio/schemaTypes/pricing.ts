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
            name: 'image',
            title: 'Package Image',
            type: 'image',
            options: {
                hotspot: true,
            },
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
            name: 'duration',
            title: 'Duration',
            type: 'string',
            description: 'e.g., "60 mins" or "3 Months"',
        }),
        defineField({
            name: 'category',
            title: 'Category (Section)',
            type: 'string',
            options: {
                list: [
                    { title: 'Healing Packages', value: 'healing' },
                    { title: 'Mentoria Packages', value: 'mentoria' },
                    { title: 'Mentoria Custom Packages', value: 'mentoria-custom' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
        }),
        defineField({
            name: 'paymentType',
            title: 'Payment Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Razorpay', value: 'razorpay' },
                    { title: 'QR Code', value: 'qr' },
                ],
                layout: 'radio',
            },
            initialValue: 'razorpay',
        }),
        defineField({
            name: 'qrImage',
            title: 'QR Code Image',
            type: 'image',
            hidden: ({ document }) => document?.paymentType !== 'qr',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'subgroup',
            title: 'Subgroup (Mentoria Tabs)',
            type: 'string',
            hidden: ({ document }) => document?.category !== 'mentoria',
            options: {
                list: [
                    { title: '8-9 Students', value: '8-9 students' },
                    { title: '10-12 Students', value: '10-12 students' },
                    { title: 'College Graduates', value: 'graduates' },
                    { title: 'Working Professionals', value: 'working professionals' },
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
