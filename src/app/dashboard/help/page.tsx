'use client'

import { useEffect, useMemo, useState } from 'react'

const MAX_MESSAGE_LEN = 2000
const MAX_EMAIL_LEN = 254

export default function HelpPage() {
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('general')
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const load = async () => setItems(await (await fetch('/api/feedback')).json())
  useEffect(() => { load() }, [])

  const normalizedMessage = useMemo(() => message.trim().replace(/\s+/g, ' '), [message])
  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email])

  const isEmailFormatValid = !normalizedEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  const isMessageValid = normalizedMessage.length > 0 && normalizedMessage.length <= MAX_MESSAGE_LEN
  const isEmailLengthValid = normalizedEmail.length <= MAX_EMAIL_LEN
  const canSubmit = isMessageValid && isEmailFormatValid && isEmailLengthValid && !sending

  const submit = async () => {
    if (!canSubmit) return
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message, email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || 'Failed to send feedback')
        return
      }
      setMessage('')
      setEmail('')
      load()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Help & Feedback</h1>
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <select value={category} onChange={(e)=>setCategory(e.target.value)} className="border rounded p-2">
          <option value="general">General</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="billing">Billing</option>
          <option value="other">Other</option>
        </select>
        <input
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Optional email for follow-up"
        />
        {!isEmailFormatValid && <p className="text-xs text-red-600">Enter a valid email format.</p>}
        {!isEmailLengthValid && <p className="text-xs text-red-600">Email must be 254 characters or less.</p>}
        <textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={4} className="w-full border rounded p-2" placeholder="Tell us what to improve" />
        <div className="text-xs text-gray-500">{normalizedMessage.length}/{MAX_MESSAGE_LEN} characters (normalized)</div>
        {!isMessageValid && <p className="text-xs text-red-600">Message is required and must be 2000 chars or less.</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button disabled={!canSubmit} onClick={submit} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">{sending ? 'Sending…' : 'Send feedback'}</button>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-2">Recent feedback</h2>
        <div className="space-y-2">{items.slice(0,10).map((f)=> <div key={f.id} className="p-2 border rounded text-sm"><b>{f.category}</b>: {f.message}</div>)}</div>
      </div>
    </div>
  )
}
