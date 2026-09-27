// Isolated manual UI regression fixture. Not an application entry point.
// All API requests are answered locally; never reads or changes real accounts.
import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
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
  is_reviewer: true, created_at: '2026-09-26T12:00:00', reviewed_at: null, review_started_at: null, markers: [],
  parent_review: null, assignment: 'fixture-assignment', surah_number: 1,
  start_ayah: 1, end_ayah: 7, duration_seconds: 60, summary: '', notes: [],
}
// A long ayah crosses pages; exercise manual paging without any backend reads.
if (new URLSearchParams(location.search).get('range') === 'long') {
  review.surah_number = 2
  review.start_ayah = 282
  review.end_ayah = 283
}
const publicAudio = new URLSearchParams(location.search).get('audio') === 'public'
if (publicAudio) {
  review.start_ayah = 2
  review.end_ayah = 2
  review.duration_seconds = 5.534
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
const assetFetch = window.fetch.bind(window)
window.fetch = async (input, init) => {
  const url = String(input)
  const resource = new URL(url, location.origin)
  if (resource.origin === location.origin && resource.pathname.startsWith('/quran/')) return assetFetch(input, init)
  if (url.includes('recitation_tracking.')) {
    // Public mode uses the actual local ASR probe output, never invented timings.
    const result = publicAudio
      ? await (await assetFetch('/tests/.tracking-sample.json')).json()
      : { spans: [{ start: 1, end: 3, ayah: review.start_ayah, word: 1 }, { start: 3, end: 5, ayah: review.start_ayah, word: 2 }] }
    return new Response(JSON.stringify({ data: { state: 'ready', spans: result.spans } }), { headers: { 'Content-Type': 'application/json' } })
  }
  const method = url.split('teacher_review.')[1]?.split('?')[0]
  const values = init?.body instanceof FormData ? init.body : new FormData()
  let result: unknown = review
  if (method === 'recording') return publicAudio ? assetFetch('/tests/.tracking-sample.mp3') : silence()
  if (method === 'dashboard') result = {
    is_teacher: true, has_more: false, links: [{
      name: 'fixture-link', teacher_name: review.teacher_name,
      student_name: review.student_name, status: 'active', is_teacher: true,
      is_mutual: true, can_respond: false, can_submit: true, partner_name: 'صاحب تجريبي',
    }, {
      name: 'fixture-pending', teacher_name: 'حسابي', student_name: 'صاحب آخر',
      status: 'pending', is_teacher: true, is_mutual: true, can_respond: true,
      can_submit: false, partner_name: 'صاحب آخر',
    }], reviews: new URL(url, location.origin).searchParams.get('scope') === 'mine'
      ? [{ ...review, name: 'fixture-mine', is_reviewer: false }]
      : [review],
  }
  else if (method === 'begin_review') {
    review.status = 'in_review'
    review.review_started_at ||= new Date().toISOString()
  } else if (method === 'mark_ayah') {
    const at = Math.round(Number(values.get('at_seconds')) * 100) / 100
    review.markers = review.markers.filter(m => m.at_seconds !== at)
    review.markers.push({ name: 'marker-' + at, at_seconds: at, ayah: Number(values.get('ayah')), author_name: review.teacher_name, added_at: new Date().toISOString() })
    review.status = 'in_review'
    review.review_started_at ||= new Date().toISOString()
  } else if (method === 'remove_marker') {
    review.markers = review.markers.filter(m => m.name !== values.get('marker'))
  } else if (method === 'add_note') {
    review.notes.push({
      name: 'note-' + review.notes.length, at_seconds: Number(values.get('at_seconds')),
      ayah: Number(values.get('ayah')), category: String(values.get('category')),
      body: String(values.get('body')),
      author_name: review.teacher_name, added_at: new Date().toISOString(),
    })
    review.status = 'in_review'
    review.review_started_at ||= new Date().toISOString()
  } else if (method === 'remove_note') {
    review.notes = review.notes.filter(n => n.name !== values.get('note'))
  } else if (method === 'publish') {
    review.status = String(values.get('decision')) as TeacherReview['status']
    review.summary = String(values.get('summary'))
    review.reviewed_at = new Date().toISOString()
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
createApp({ render: () => h('div', [
  publicAudio ? h('aside', { dir: 'rtl', class: 'teacher-card' }, [
    h('p', 'مثال بتلاوة عامة للآية الثانية من الفاتحة، وتوقيت مستخرج بخدمة التعرّف المحلية. بيانات المراجعة وهمية.'),
    h('a', { href: 'https://everyayah.com/data/Alafasy_128kbps/001002.mp3' }, 'مصدر التلاوة: العفاسي — EveryAyah'),
    h('button', { type: 'button', onClick: async () => {
      const audio = document.querySelector('audio')
      if (!audio) return
      audio.currentTime = 0
      audio.playbackRate = 0.5
      await audio.play()
    } }, 'إعادة المثال ببطء (بعد تحميل التسجيل)'),
  ]) : null,
  h(RouterView),
]) }).use(pinia).use(VueQueryPlugin).use(router).mount('#app')
