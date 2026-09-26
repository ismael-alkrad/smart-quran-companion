// Isolated manual UI regression fixture. Not an application entry point.
// All API requests are answered locally; never reads or changes real accounts.
import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import { useThemeStore } from '../src/shared/theme'
import { createRouter, createWebHashHistory, RouterView } from 'vue-router'
import { setBrowserCsrfToken } from '../src/shared/api'
import type { TeacherReview } from '../src/modules/tasmee/api/teacherReview'
import Hub from '../src/modules/tasmee/pages/TasmeeTeacherHubPage.vue'
import Review from '../src/modules/tasmee/pages/TasmeeTeacherReviewPage.vue'
import '../src/styles/app.css'

const review: TeacherReview = {
  name: 'fixture-review', session: 'fixture-session', relationship: 'fixture-link',
  status: 'submitted', student_name: 'طالب تجريبي', teacher_name: 'مدرّس تجريبي',
  is_reviewer: true, created_at: '2026-09-26T12:00:00', reviewed_at: null,
  parent_review: null, assignment: 'fixture-assignment', surah_number: 1,
  start_ayah: 1, end_ayah: 7, duration_seconds: 60, summary: '', notes: [],
}
function silence() {
  const wav = new ArrayBuffer(44 + 8000 * 60 * 2)
  const view = new DataView(wav)
  const write = (offset: number, text: string) => [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  write(0, 'RIFF'); view.setUint32(4, wav.byteLength - 8, true); write(8, 'WAVE')
  write(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true)
  view.setUint16(22, 1, true); view.setUint32(24, 8000, true); view.setUint32(28, 16000, true)
  view.setUint16(32, 2, true); view.setUint16(34, 16, true)
  write(36, 'data'); view.setUint32(40, wav.byteLength - 44, true)
  return new Response(wav, { headers: { 'Content-Type': 'audio/wav' } })
}
setBrowserCsrfToken('isolated-preview')
window.fetch = async (input, init) => {
  const url = String(input)
  const method = url.split('teacher_review.')[1]?.split('?')[0]
  const values = init?.body instanceof FormData ? init.body : new FormData()
  let result: unknown = review
  if (method === 'recording') return silence()
  if (method === 'dashboard') result = {
    is_teacher: true, has_more: false, links: [{
      name: 'fixture-link', teacher_name: review.teacher_name,
      student_name: review.student_name, status: 'active', is_teacher: true,
    }], reviews: [review],
  }
  else if (method === 'add_note') {
    review.notes.push({
      name: 'note-' + review.notes.length, at_seconds: Number(values.get('at_seconds')),
      ayah: Number(values.get('ayah')), category: String(values.get('category')),
      body: String(values.get('body')),
    })
    review.status = 'in_review'
  } else if (method === 'remove_note') {
    review.notes = review.notes.filter(n => n.name !== values.get('note'))
  } else if (method === 'publish') {
    review.status = String(values.get('decision')) as TeacherReview['status']
    review.summary = String(values.get('summary'))
  } else if (method !== 'detail' && method !== 'dashboard') {
    return new Response('{}', { status: 400 })
  }
  return new Response(JSON.stringify({ data: result }), { headers: { 'Content-Type': 'application/json' } })
}
const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', redirect: '/tasmee' }, { path: '/tasmee', component: Hub },
    { path: '/tasmee/reviews/:name', component: Review }],
})
const pinia = createPinia()
useThemeStore(pinia).initialize()
createApp({ render: () => h(RouterView) }).use(pinia).use(router).mount('#app')
