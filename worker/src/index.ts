/// <reference types="@cloudflare/workers-types" />
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
    RESEND_API_KEY: string
}


const app = new Hono<{ Bindings: Bindings }>()

// CORS Configuration
app.use('/*', cors({
    origin: ['https://claryntia.com', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))


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

        // 1. Insert into D1
        const { success } = await c.env.DB.prepare(
            `INSERT INTO leads (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?)`
        ).bind(name, email, phone || null, message || null, Math.floor(Date.now() / 1000)).run()

        if (!success) {
            return c.json({ success: false, message: 'Database insert failed' }, 500)
        }

        // 2. Send Email Notification via Resend (using fetch to avoid nodejs runtime issues)
        if (c.env.RESEND_API_KEY) {
            try {
                const emailRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'Claryntia <onboarding@resend.dev>', // Use default until domain verified
                        to: ['joint.arum@gmail.com'],
                        subject: `New Lead: ${name}`,
                        html: `
                            <h1>New Lead Captured</h1>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                            <p><strong>Message/Purpose:</strong><br/>${message || 'N/A'}</p>
                            <p><small>Timestamp: ${new Date().toLocaleString()}</small></p>
                        `
                    })
                })

                if (!emailRes.ok) {
                    const error = await emailRes.text()
                    console.error('Resend API Error:', error)
                } else {
                    const data = await emailRes.json() as any
                    console.log('Email sent:', data?.id)
                }
            } catch (emailError) {
                console.error('Failed to send email:', emailError)
                // Don't fail the request if email fails, but log it.
            }
        }

        return c.json({ success: true, message: 'Lead captured successfully' })

    } catch (error: any) {
        console.error('Lead submission error:', error)
        console.log('RESEND_KEY_EXISTS:', !!c.env.RESEND_API_KEY) // Debug log

        if (error instanceof z.ZodError) {
            return c.json({ success: false, message: 'Validation failed', errors: error.errors }, 400)
        }
        // Return actual error for debugging
        return c.json({ success: false, message: `Internal Server Error: ${error.message || error}` }, 500)
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

        // 1. Fetch Plan Details from Sanity (Source of Truth)
        const query = `*[_type == "pricing" && planId == "${planId}"][0]{price, title}`
        const sanityUrl = `https://${c.env.SANITY_PROJECT_ID}.apicdn.sanity.io/v2024-01-01/data/query/${c.env.SANITY_DATASET}?query=${encodeURIComponent(query)}`

        const priceRes = await fetch(sanityUrl, {
            headers: { 'Authorization': `Bearer ${c.env.SANITY_API_TOKEN}` }
        })

        if (!priceRes.ok) {
            throw new Error("Failed to fetch price from Sanity")
        }

        const { result: plan } = await priceRes.json() as any

        if (!plan) {
            return c.json({ success: false, message: 'Invalid Plan ID' }, 400)
        }

        let finalAmount = plan.price // Base price from Sanity

        // 2. Coupon Validation
        if (couponCode) {
            const couponQuery = `*[_type == "coupon" && code == "${couponCode}" && isActive == true][0]`
            const couponUrl = `https://${c.env.SANITY_PROJECT_ID}.apicdn.sanity.io/v2024-01-01/data/query/${c.env.SANITY_DATASET}?query=${encodeURIComponent(couponQuery)}`

            const couponRes = await fetch(couponUrl, {
                headers: { 'Authorization': `Bearer ${c.env.SANITY_API_TOKEN}` }
            })

            if (couponRes.ok) {
                const { result } = await couponRes.json() as any
                if (result) {
                    const now = new Date()
                    if (result.expiryDate && new Date(result.expiryDate) < now) {
                        return c.json({ success: false, message: 'Coupon expired' }, 400)
                    }

                    if (result.discountType === 'percentage') {
                        finalAmount = Math.floor(plan.price * (1 - result.discountAmount / 100))
                    } else if (result.discountType === 'flat') {
                        finalAmount = Math.max(0, plan.price - result.discountAmount)
                    }
                } else {
                    return c.json({ success: false, message: 'Invalid coupon' }, 400)
                }
            }
        }

        // 3. Create Order via Razorpay API
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
                notes: { planId, couponCode, planName: plan.title }
            })
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Razorpay Error:', error)
            return c.json({ success: false, message: 'Failed to create order' }, 500)
        }

        const order: any = await response.json()

        // 4. Store transaction in D1
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
        const bodyText = await c.req.text()

        if (!signature) {
            return c.json({ success: false, message: 'Missing signature' }, 401)
        }

        // Verify Signature
        const encoder = new TextEncoder()
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(c.env.RAZORPAY_WEBHOOK_SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        )

        try {
            const verified = await crypto.subtle.verify(
                'HMAC',
                key,
                hexToBytes(signature) as any,
                encoder.encode(bodyText)
            )
            if (!verified) {
                console.error('Invalid Webhook Signature')
                return c.json({ success: false, message: 'Invalid signature' }, 401)
            }
        } catch (err) {
            console.error('Signature verification error:', err)
            // In case of hex decoding error or other crypto issues
            return c.json({ success: false, message: 'Invalid signature format' }, 400)
        }

        const body = JSON.parse(bodyText)
        const event = body.event

        console.log('Webhook Event:', event)

        if (event === 'payment.captured' || event === 'order.paid') {
            const payment = body.payload.payment.entity
            const orderId = payment.order_id

            // Update transaction status
            const currentStatus = event === 'order.paid' ? 'paid' : 'captured'

            const { success } = await c.env.DB.prepare(
                `UPDATE transactions SET status = ?, updated_at = ? WHERE order_id = ?`
            ).bind(currentStatus, Date.now(), orderId).run()

            if (success) {
                console.log(`Transaction ${orderId} updated to ${currentStatus}`)
            } else {
                console.error(`Failed to update transaction ${orderId}`)
            }
        } else if (event === 'payment.failed') {
            const payment = body.payload.payment.entity
            const orderId = payment.order_id

            await c.env.DB.prepare(
                `UPDATE transactions SET status = 'failed', updated_at = ? WHERE order_id = ?`
            ).bind(Date.now(), orderId).run()
        }

        return c.json({ success: true, status: 'ok' })

    } catch (error) {
        console.error('Webhook Error:', error)
        // Important: Return 200 to Razorpay even on internal error to prevent disabling, 
        // unless it's a critical logic failure we want them to retry. 
        // But usually retries are annoying if logic is permanently broken.
        // Returning 500 will trigger retries and potential disabling.
        // Let's return 500 for now so we see it in logs, but maybe catch-all 200 is safer?
        // Usage says: "If the webhook responds with a non-200 status code... Razorpay will retry..."
        // Since we are fixing the "deactivated" issue, we likely want to ensure 200 unless it's a transient DB issue.
        return c.json({ success: false, message: 'Internal Error' }, 500)
    }
})

// --- Auth Endpoints ---
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123'; // Hardcoded for simplicity
// In a real app, use a secret key for signing tokens.
// For this simple case, we'll just use a recognizable "token" string that we validate.
const MOCK_TOKEN = 'valid-admin-token-12345';

// Middleware helper for protected routes (can be used manually inside handlers)
const isAuthenticated = (c: any) => {
    const authHeader = c.req.header('Authorization');
    return authHeader === `Bearer ${MOCK_TOKEN}`;
}

app.post('/api/auth/login', async (c) => {
    try {
        const { username, password } = await c.req.json();
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Token-based Auth (Simpler for cross-origin than cookies)
            return c.json({
                success: true,
                message: 'Login successful',
                token: MOCK_TOKEN
            });
        }
        return c.json({ success: false, message: 'Invalid credentials' }, 401);
    } catch (e) {
        return c.json({ success: false, message: 'Error logging in' }, 500);
    }
});

app.post('/api/auth/logout', async (c) => {
    // Client should clear token
    return c.json({ success: true, message: 'Logged out' });
});

app.get('/api/auth/session', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader === `Bearer ${MOCK_TOKEN}`) {
        return c.json({ success: true, user: { username: ADMIN_USERNAME, id: 1 } });
    }
    return c.json({ success: false, message: 'Unauthorized' }, 401);
});

// --- Admin Endpoints ---

// Get all Leads (Contact Submissions)
app.get('/api/contact', async (c) => {
    if (!isAuthenticated(c)) return c.json({ error: 'Unauthorized' }, 401);
    try {
        const { results } = await c.env.DB.prepare(
            `SELECT * FROM leads ORDER BY created_at DESC`
        ).all();
        // Map snake_case to camelCase for frontend
        const leads = results.map((r: any) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            message: r.message,
            purpose: 'General Inquiry', // Default or schema evolution needed
            createdAt: r.created_at * 1000 // Convert sec to ms
        }));
        return c.json(leads);
    } catch (e) {
        return c.json({ error: 'Failed to fetch leads' }, 500);
    }
});

// Get all Payments (Transactions)
app.get('/api/payments', async (c) => {
    if (!isAuthenticated(c)) return c.json({ error: 'Unauthorized' }, 401);
    try {
        const { results } = await c.env.DB.prepare(
            `SELECT * FROM transactions ORDER BY created_at DESC`
        ).all();
        const payments = results.map((r: any) => ({
            id: r.id,
            razorpayOrderId: r.order_id,
            amount: r.amount,
            currency: r.currency,
            status: r.status,
            planId: r.plan_id,
            couponCode: r.coupon_code,
            packageName: r.plan_id, // Map this if possible
            createdAt: r.created_at, // Alredy ms? check schema
            name: 'Customer', // Needs join or store in transaction
            email: 'customer@email.com',
            phone: '0000000000'
        }));
        return c.json(payments);
    } catch (e) {
        return c.json({ error: 'Failed to fetch payments' }, 500);
    }
});

// Helper for hex string to bytes (needed for signature verification)
function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }
    return bytes
}

export default app
