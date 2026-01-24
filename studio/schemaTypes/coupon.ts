import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'coupon',
    title: 'Coupon',
    type: 'document',
    fields: [
        defineField({
            name: 'code',
            title: 'Coupon Code',
            type: 'string',
            validation: (Rule) => Rule.required().uppercase(),
        }),
        defineField({
            name: 'discountType',
            title: 'Discount Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Percentage', value: 'percentage' },
                    { title: 'Flat Amount', value: 'flat' },
                ],
            },
            initialValue: 'percentage',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'discountAmount',
            title: 'Discount Amount',
            type: 'number',
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: 'expiryDate',
            title: 'Expiry Date',
            type: 'datetime',
        }),
        defineField({
            name: 'isActive',
            title: 'Is Active',
            type: 'boolean',
            initialValue: true,
        }),
    ],
})
