import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const {
  OPENAI_API_KEY,
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  GITHUB_PR_NUMBER,
  GITHUB_BASE_REF,
  GITHUB_HEAD_REF,
} = process.env

if (!OPENAI_API_KEY) {
  console.log('OPENAI_API_KEY not set; skipping Codex review.')
  process.exit(0)
}

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !GITHUB_PR_NUMBER) {
  throw new Error('Missing GitHub context vars')
}

const agents = readFileSync('AGENTS.md', 'utf8')

const base = GITHUB_BASE_REF || 'main'
const head = GITHUB_HEAD_REF || 'HEAD'

let diff = ''
try {
  diff = execSync(`git diff --unified=1 origin/${base}...origin/${head}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 10 * 1024 * 1024,
  })
} catch {
  diff = execSync('git diff --unified=1 HEAD~1..HEAD', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 10 * 1024 * 1024,
  })
}

const prompt = [
  'You are Codex reviewer for PR gating.',
  'Use AGENTS.md as policy source of truth.',
  'Return concise markdown with sections:',
  '1) Verdict: PASS or CHANGES_REQUESTED',
  '2) Blockers (bullets)',
  '3) Risks (bullets)',
  '4) Recommended actions (bullets)',
  '',
  'AGENTS.md:',
  agents.slice(0, 12000),
  '',
  'Diff:',
  diff.slice(0, 120000),
].join('\n')

const response = await fetch('https://api.openai.com/v1/responses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-5-mini',
    input: prompt,
  }),
})

if (!response.ok) {
  const text = await response.text()
  throw new Error(`OpenAI API error: ${response.status} ${text}`)
}

const data = await response.json()
const outputText = data.output_text || 'Codex review: no output.'

const commentBody = `## Codex Policy Review\n\n${outputText}`

const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${GITHUB_PR_NUMBER}/comments`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ body: commentBody }),
})

if (!ghRes.ok) {
  const text = await ghRes.text()
  throw new Error(`GitHub comment failed: ${ghRes.status} ${text}`)
}

console.log('Codex review comment posted.')

if (/CHANGES_REQUESTED/i.test(outputText)) {
  console.log('Codex requested changes.')
  process.exit(1)
}
