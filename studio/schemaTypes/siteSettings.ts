import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'siteTitle',
            title: 'Site Title',
            type: 'string',
        }),
        defineField({
            name: 'description',
            title: 'Site Description',
            type: 'text',
        }),
        defineField({
            name: 'upiQrCode',
            title: 'UPI QR Code Image',
            type: 'image',
            description: 'Upload the static UPI QR code image to be displayed for payments.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'upiId',
            title: 'UPI ID (VPA)',
            type: 'string',
            description: 'e.g. yourname@upi',
        }),
    ],
})
