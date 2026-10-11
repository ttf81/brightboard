import express from 'express'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 3001
const root = dirname(fileURLToPath(import.meta.url))
const dataFile = join(root, 'test.json')
let writeQueue = Promise.resolve()

app.use(express.json({ limit: '64kb' }))

async function readIdeas() {
  try {
    const contents = await readFile(dataFile, 'utf8')
    const data = JSON.parse(contents)
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

app.get('/api/ideas', async (_request, response) => {
  try {
    response.json(await readIdeas())
  } catch {
    response.status(500).json({ message: 'Could not read saved ideas.' })
  }
})

app.post('/api/ideas', (request, response) => {
  const name = String(request.body?.name || '').trim()
  const problem = String(request.body?.problem || '').trim()
  const ideas = Array.isArray(request.body?.ideas)
    ? request.body.ideas.map((idea) => String(idea).trim()).filter(Boolean)
    : []

  if (!name || !problem || !ideas.length) {
    return response.status(400).json({ message: 'Name, problem, and at least one idea are required.' })
  }

  if (name.length > 100 || problem.length > 2000 || ideas.some((idea) => idea.length > 2000)) {
    return response.status(400).json({ message: 'One or more fields are too long.' })
  }

  const entry = {
    id: crypto.randomUUID(),
    name,
    problem,
    ideas,
    createdAt: new Date().toISOString(),
  }

  writeQueue = writeQueue.then(async () => {
    const saved = await readIdeas()
    saved.push(entry)
    await writeFile(dataFile, `${JSON.stringify(saved, null, 2)}\n`, 'utf8')
  })

  writeQueue
    .then(() => response.status(201).json(entry))
    .catch(() => response.status(500).json({ message: 'Could not save your idea.' }))
})

app.use(express.static(join(root, 'dist')))
app.get('*splat', (_request, response) => response.sendFile(join(root, 'dist', 'index.html')))

app.listen(port, () => {
  console.log(`Brightboard API listening on http://localhost:${port}`)
})
