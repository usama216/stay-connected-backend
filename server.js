import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

// Fixed admin credentials
const ADMIN_EMAIL = 'aqib@stay-connected.com'
const ADMIN_PASSWORD = 'Admin@123'

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '')

app.use(cors({ origin: true }))
app.use(express.json())

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const token = auth.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// ——— Auth ———
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ sub: 'admin', email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token })
  }
  res.status(401).json({ message: 'Invalid email or password' })
})

app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true })
})

// ——— Contact: public submit ———
app.post('/api/contact/submit', async (req, res) => {
  const { name, email, company, phone, service_interest, message } = req.body || {}
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required' })
  }
  try {
    const { data, error } = await supabase
      .from('contact_queries')
      .insert({
        name: String(name).trim(),
        email: String(email).trim(),
        company: company ? String(company).trim() : null,
        phone: phone ? String(phone).trim() : null,
        service_interest: service_interest ? String(service_interest).trim() : null,
        message: String(message).trim(),
        status: 'new'
      })
      .select('id')
      .single()
    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ message: 'Failed to save contact. Please try again.' })
    }
    res.status(201).json({ success: true, id: data?.id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
})

// ——— Contact: admin only ———
app.get('/api/contact/queries', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contact_queries')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Supabase select error:', error)
      return res.status(500).json({ message: 'Failed to load queries' })
    }
    res.json({ data: data || [] })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.put('/api/contact/queries/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params
  const { status } = req.body || {}
  const allowed = ['new', 'in_progress', 'completed', 'closed']
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }
  try {
    const { error } = await supabase
      .from('contact_queries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('Supabase update error:', error)
      return res.status(500).json({ message: 'Failed to update' })
    }
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/api/contact/queries/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  try {
    const { error } = await supabase.from('contact_queries').delete().eq('id', id)
    if (error) {
      console.error('Supabase delete error:', error)
      return res.status(500).json({ message: 'Failed to delete' })
    }
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('Warning: SUPABASE_URL and SUPABASE_ANON_KEY should be set in .env')
  }
})
