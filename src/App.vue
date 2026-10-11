<script setup>
import { nextTick, ref } from 'vue'

const name = ref('')
const problem = ref('')
const ideas = ref([''])
const ideaInputs = ref([])
const status = ref('idle')
const message = ref('')
const isStaticHost = window.location.hostname.endsWith('github.io')

async function addIdea() {
  ideas.value.push('')
  await nextTick()
  ideaInputs.value.at(-1)?.focus()
}

function removeIdea(index) {
  if (ideas.value.length === 1) return
  ideas.value.splice(index, 1)
}

async function submitIdea() {
  status.value = 'saving'
  message.value = ''

  try {
    const payload = { name: name.value, problem: problem.value, ideas: ideas.value }

    if (isStaticHost) {
      const saved = JSON.parse(localStorage.getItem('brightboard-ideas') || '[]')
      saved.push({
        id: crypto.randomUUID(),
        ...payload,
        ideas: ideas.value.map((idea) => idea.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem('brightboard-ideas', JSON.stringify(saved))
    } else {
    const response = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message)
    }

    status.value = 'success'
    message.value = isStaticHost ? 'Your spark is saved in this browser.' : 'Your spark is on the board.'
    name.value = ''
    problem.value = ''
    ideas.value = ['']
  } catch (error) {
    status.value = 'error'
    message.value = error.message || 'Something went wrong. Please try again.'
  }
}
</script>

<template>
  <main>
    <nav class="nav" aria-label="Main navigation">
      <a class="brand" href="#" aria-label="Brightboard home">
        <span class="brand-mark" aria-hidden="true">
          <i></i><i></i><i></i><i></i>
        </span>
        <span>BRIGHTBOARD</span>
      </a>
      <span class="nav-note">A place for ideas worth building</span>
    </nav>

    <section class="hero">
      <div class="eyebrow"><span></span> Open call for bright minds</div>
      <h1>What should we<br /><em>build next?</em></h1>
      <p class="intro">Every meaningful change starts as a rough thought. Share the problem you see—and the spark of an idea that could solve it.</p>
    </section>

    <section class="workspace">
      <aside class="guide">
        <p class="section-label">How it works</p>
        <ol>
          <li><span>01</span><div><strong>Name it</strong><p>Let us know who's behind the spark.</p></div></li>
          <li><span>02</span><div><strong>Frame it</strong><p>Tell us what isn't working yet.</p></div></li>
          <li><span>03</span><div><strong>Imagine it</strong><p>Give the solution room to breathe.</p></div></li>
        </ol>
        <blockquote>“The best ideas are clear enough to share and unfinished enough to invite others in.”</blockquote>
      </aside>

      <form class="idea-form" @submit.prevent="submitIdea">
        <div class="form-heading">
          <div>
            <p class="section-label">Idea submission</p>
            <h2>Put your thought<br />into words.</h2>
          </div>
          <span class="asterisk" aria-hidden="true">✳</span>
        </div>

        <label>
          <span>Your name <b>01</b></span>
          <input v-model="name" name="name" type="text" maxlength="100" placeholder="How should we credit you?" required />
        </label>

        <label>
          <span>The problem <b>02</b></span>
          <textarea v-model="problem" name="problem" maxlength="2000" rows="4" placeholder="What friction, gap, or opportunity do you see?" required></textarea>
        </label>

        <fieldset>
          <legend>The idea <b>03</b></legend>
          <div v-for="(_idea, index) in ideas" :key="index" class="idea-field">
            <textarea
              :ref="(element) => { if (element) ideaInputs[index] = element }"
              v-model="ideas[index]"
              :name="`idea-${index + 1}`"
              maxlength="2000"
              rows="3"
              :placeholder="index === 0 ? 'How might we make it better?' : `Another angle, approach, or possibility…`"
              required
            ></textarea>
            <button v-if="ideas.length > 1" class="remove" type="button" :aria-label="`Remove idea ${index + 1}`" @click="removeIdea(index)">×</button>
          </div>
          <button class="add" type="button" @click="addIdea"><span>+</span> Add another idea</button>
        </fieldset>

        <div class="submit-row">
          <p :class="['form-message', status]" role="status">{{ message }}</p>
          <button class="submit" type="submit" :disabled="status === 'saving'">
            <span>{{ status === 'saving' ? 'Saving…' : 'Send the spark' }}</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>
    </section>

    <footer><span>BRIGHTBOARD / 2026</span><span>Think freely. Build thoughtfully.</span></footer>
  </main>
</template>
