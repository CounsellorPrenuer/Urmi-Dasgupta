import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'

type Bindings = {
    DB: D1Database
    RAZORPAY_KEY_ID: string
    RAZORPAY_KEY_SECRET: string
    RAZORPAY_WEBHOOK_SECRET: string
    SANITY_PROJECT_ID: string
    SANITY_DATASET: string
    SANITY_API_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS Configuration
app.use('/*', cors({
    origin: ['https://claryntia.com', 'http://localhost:5173'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Razorpay-Signature'],
    maxAge: 600,
}))

// Pricing Configuration (Source of Truth)
const PRICING_CONFIG: Record<string, number> = {
    'pkg-1': 5500,  // Discover
    'pkg-2': 15000, // Discovery Plus
    'pkg-3': 5999,  // Achieve
    'pkg-4': 10599, // Achieve Plus
    'pkg-5': 25000, // Ascend
    'pkg-6': 50000, // Ascend Plus
    'mp-1': 4999,   // Foundation
    'mp-2': 9999,   // Advanced
    'mp-3': 14999,  // Pro
}

// Health Check
app.get('/health', async (c) => {
    return c.json({ status: 'ok', message: 'Claryntia Worker Active' })
})

// Schema for Lead Capture
const leadSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    message: z.string().optional()
})

// Lead Capture API
app.post('/submit-lead', async (c) => {
    try {
        const body = await c.req.json()
        const { name, email, phone, message } = leadSchema.parse(body)

        // Insert into D1
        const { success } = await c.env.DB.prepare(
            `INSERT INTO leads (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?)`
        ).bind(name, email, phone || null, message || null, Date.now()).run()

        if (success) {
            return c.json({ success: true, message: 'Lead captured successfully' })
        } else {
            return c.json({ success: false, message: 'Database insert failed' }, 500)
        }

    } catch (error) {
        console.error('Lead submission error:', error)
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: 'Validation failed', errors: error.errors }, 400)
        }
        return c.json({ success: false, message: 'Internal Server Error' }, 500)
    }
})

// Schema for Order Creation
const orderSchema = z.object({
    planId: z.string(),
    couponCode: z.string().optional()
})

// Create Razorpay Order
app.post('/create-order', async (c) => {
    try {
        const body = await c.req.json()
        const { planId, couponCode } = orderSchema.parse(body)

        // Validate Plan
        const basePrice = PRICING_CONFIG[planId]
        if (!basePrice) {
            return c.json({ success: false, message: 'Invalid Plan ID' }, 400)
        }

        let finalAmount = basePrice

        // Coupon Validation
        if (couponCode) {
            const query = `*[_type == "coupon" && code == "${couponCode}" && isActive == true][0]`
            const sanityUrl = `https://${c.env.SANITY_PROJECT_ID}.apicdn.sanity.io/v2024-01-01/data/query/${c.env.SANITY_DATASET}?query=${encodeURIComponent(query)}`

            const sanityRes = await fetch(sanityUrl, {
                headers: { 'Authorization': `Bearer ${c.env.SANITY_API_TOKEN}` }
            })

            if (sanityRes.ok) {
                const { result } = await sanityRes.json() as any
                if (result) {
                    // Check active (already in query) and expiry
                    const now = new Date()
                    if (result.expiryDate && new Date(result.expiryDate) < now) {
                        return c.json({ success: false, message: 'Coupon expired' }, 400)
                    }

                    // Apply discount
                    if (result.discountType === 'percentage') {
                        finalAmount = Math.floor(basePrice * (1 - result.discountAmount / 100))
                    } else if (result.discountType === 'flat') {
                        finalAmount = Math.max(0, basePrice - result.discountAmount)
                    }
                } else {
                    return c.json({ success: false, message: 'Invalid coupon' }, 400)
                }
            }
        }

        // Create Order via Razorpay API
        const razorpayAuth = btoa(`${c.env.RAZORPAY_KEY_ID}:${c.env.RAZORPAY_KEY_SECRET}`)
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${razorpayAuth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: finalAmount * 100, // Amount in paise
                currency: 'INR',
                notes: { planId, couponCode }
            })
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Razorpay Error:', error)
            return c.json({ success: false, message: 'Failed to create order' }, 500)
        }

        const order: any = await response.json()

        // Store transaction in D1
        await c.env.DB.prepare(
            `INSERT INTO transactions (order_id, amount, currency, status, plan_id, coupon_code, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            order.id,
            finalAmount,
            'INR',
            'created',
            planId,
            couponCode || null,
            Date.now(),
            Date.now()
        ).run()

        return c.json({
            success: true,
            order_id: order.id,
            amount: finalAmount * 100,
            currency: 'INR',
            key_id: c.env.RAZORPAY_KEY_ID,
            plan_id: planId
        })

    } catch (error) {
        console.error('Create Order Error:', error)
        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: 'Validation failed' }, 400)
        }
        return c.json({ success: false, message: 'Internal Server Error' }, 500)
    }
})

// Razorpay Webhook
app.post('/razorpay-webhook', async (c) => {
    try {
        const signature = c.req.header('X-Razorpay-Signature')
        const body = await c.req.text()

        if (!signature || !c.env.RAZORPAY_WEBHOOK_SECRET) {
            return c.json({ success: false, message: 'Missing signature or secret' }, 400)
        }

        // Verify Signature (Web Crypto API)
        const encoder = new TextEncoder()
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(c.env.RAZORPAY_WEBHOOK_SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        )
        const verified = await crypto.subtle.verify(
            'HMAC',
            key,
            hexToBytes(signature),
            encoder.encode(body)
        )

        if (!verified) {
            return c.json({ success: false, message: 'Invalid signature' }, 400)
        }

        const payload = JSON.parse(body)
        if (payload.event === 'payment.captured') {
            const payment = payload.payload.payment.entity
            const orderId = payment.order_id

            if (orderId) {
                await c.env.DB.prepare(
                    `UPDATE transactions SET status = 'paid', updated_at = ? WHERE order_id = ?`
                ).bind(Date.now(), orderId).run()
            }
        }

        return c.json({ success: true })

    } catch (error) {
        console.error('Webhook Error:', error)
        return c.json({ success: false, message: 'Webhook processing failed' }, 500)
    }
})

// Helper for hex string to bytes (needed for signature verification)
function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }
    return bytes
}

export default app
