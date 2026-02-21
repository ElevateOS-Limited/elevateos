'use client'

import { useEffect, useState } from 'react'

export default function HelpPage() {
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('general')
  const [items, setItems] = useState<any[]>([])

  const load = async () => setItems(await (await fetch('/api/feedback')).json())
  useEffect(() => { load() }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Help & Feedback</h1>
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <select value={category} onChange={(e)=>setCategory(e.target.value)} className="border rounded p-2"><option value="general">General</option><option value="bug">Bug</option><option value="feature">Feature</option></select>
        <textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={4} className="w-full border rounded p-2" placeholder="Tell us what to improve" />
        <button onClick={async()=>{await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category,message})});setMessage('');load()}} className="px-4 py-2 rounded bg-indigo-600 text-white">Send feedback</button>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-2">Recent feedback</h2>
        <div className="space-y-2">{items.slice(0,10).map((f)=> <div key={f.id} className="p-2 border rounded text-sm"><b>{f.category}</b>: {f.message}</div>)}</div>
      </div>
    </div>
  )
}
