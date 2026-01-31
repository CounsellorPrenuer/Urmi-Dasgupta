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
    origin: ['https://claryntia.com', 'https://www.claryntia.com', 'http://localhost:5173'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Razorpay-Signature'],
    maxAge: 600,
}))

// Pricing Configuration (Source of Truth)
const PRICING_CONFIG: Record<string, number> = {
    // New Healing Packages
    'photo_energy_individual': 1999,
    'photo_energy_couples': 3333,
    'healing_session': 3333,
    'heartbreak_program': 9999,
    'tarot_reading': 2999,
    'animal_communication': 2999,
    'pet_healing': 3333,
    // Mentoria Packages (Preserved)
    'mp-1': 4999,   // Foundation
    'mp-2': 9999,   // Advanced
    'mp-3': 14999,  // Pro
}

// Diagnostic Endpoint
app.get('/_diag', (c) => {
    return c.json({
        status: 'ok',
        pricing_keys: Object.keys(PRICING_CONFIG)
    })
})

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
        ).bind(name, email, phone || null, message || null, Math.floor(Date.now() / 1000)).run()

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
    // ... (existing webhook code)
    // ...
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
