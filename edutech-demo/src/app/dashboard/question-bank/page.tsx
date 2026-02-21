'use client'

import { useEffect, useState } from 'react'

export default function QuestionBankPage() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState({ subject: 'Math', topic: 'Algebra', difficulty: 'medium', stem: '', answer: '', options: '' })
  const [selected, setSelected] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)

  const load = async () => setItems(await (await fetch('/api/question-bank')).json())
  useEffect(() => { load() }, [])

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-4">
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <input placeholder="Question stem" value={form.stem} onChange={(e)=>setForm({...form, stem:e.target.value})} className="w-full border rounded p-2" />
        <div className="grid grid-cols-3 gap-2">
          <input value={form.subject} onChange={(e)=>setForm({...form, subject:e.target.value})} className="border rounded p-2" />
          <input value={form.topic} onChange={(e)=>setForm({...form, topic:e.target.value})} className="border rounded p-2" />
          <select value={form.difficulty} onChange={(e)=>setForm({...form, difficulty:e.target.value})} className="border rounded p-2"><option>easy</option><option>medium</option><option>hard</option></select>
        </div>
        <input placeholder="Options JSON (optional)" value={form.options} onChange={(e)=>setForm({...form, options:e.target.value})} className="w-full border rounded p-2" />
        <input placeholder="Correct answer" value={form.answer} onChange={(e)=>setForm({...form, answer:e.target.value})} className="w-full border rounded p-2" />
        <button onClick={async()=>{await fetch('/api/question-bank',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,options:form.options?JSON.parse(form.options):null})});setForm({...form,stem:'',answer:'',options:''});load()}} className="px-4 py-2 rounded bg-indigo-600 text-white">Add Question</button>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Practice Set</h2>
        <div className="space-y-3 max-h-[65vh] overflow-auto">
          {items.map((q) => (
            <div key={q.id} className="border rounded-lg p-3">
              <label className="flex items-start gap-2"><input type="checkbox" checked={selected.includes(q.id)} onChange={(e)=>setSelected(e.target.checked?[...selected,q.id]:selected.filter(id=>id!==q.id))} /> <span className="font-medium">{q.stem}</span></label>
              <input placeholder="Your answer" value={answers[q.id]||''} onChange={(e)=>setAnswers({...answers,[q.id]:e.target.value})} className="mt-2 w-full border rounded p-2" />
            </div>
          ))}
        </div>
        <button onClick={async()=>setResult(await (await fetch('/api/practice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({questionIds:selected,answers})})).json())} className="mt-3 px-4 py-2 rounded bg-indigo-600 text-white">Submit Practice</button>
        {result && <p className="mt-3 text-sm">Score: <b>{Math.round(result.score)}%</b> ({result.correct}/{result.total})</p>}
      </div>
    </div>
  )
}
