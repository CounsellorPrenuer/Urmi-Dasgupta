import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'

type Bindings = {
    DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS Configuration
app.use('/*', cors({
    origin: ['https://claryntia.com', 'http://localhost:5173'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 600,
}))

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

export default app
