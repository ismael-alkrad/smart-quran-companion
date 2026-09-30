// Isolated database: never reads or changes the application's recordings.
const testDb = 'test-tasmee-library-' + crypto.randomUUID()
const open = indexedDB.open.bind(indexedDB)
indexedDB.open = ((name: string, version?: number) => open(name === 'smart-quran-tasmee' ? testDb : name, version)) as typeof indexedDB.open
const output = document.querySelector('#result')!
try {
  // Seed the previous schema to exercise the upgrade without losing recordings.
  await new Promise<void>((resolve, reject) => {
    const req = open(testDb, 1)
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore('recordings', { keyPath: 'id' })
      store.createIndex('assignmentName', 'assignmentName')
      for (const [id, ownerUser, createdAt] of [
        ['older', 'alice', '2026-09-28'], ['newer', 'alice', '2026-09-30'],
        ['other', 'bob', '2026-09-30'], ['legacy', undefined, '2026-09-30'],
      ]) store.put({ id, ownerUser, createdAt, assignmentName: 'test', surahNumber: 1,
        startAyah: 1, endAyah: 7, durationSeconds: 1, mimeType: 'audio/wav', blob: new Blob(['synthetic']) })
    }
    req.onsuccess = () => { req.result.close(); resolve() }
    req.onerror = () => reject(req.error)
  })
  const { listOwnedTasmeeRecordings, getTasmeeRecording } = await import('../src/modules/tasmee/repositories/tasmeeRecording.repository')
  const alice = await listOwnedTasmeeRecordings('alice')
  const bob = await listOwnedTasmeeRecordings('bob')
  const guest = await listOwnedTasmeeRecordings('')
  const stored = await getTasmeeRecording('older')
  const checks = [
    ['ترتيب الأحدث أولًا واستبعاد تسجيلات الآخرين والقديمة دون مالك', alice.map(r => r.id).join(',') === 'newer,older'],
    ['عزل الحساب الثاني', bob.length === 1 && bob[0]?.id === 'other'],
    ['لا تسجيلات دون حساب', guest.length === 0],
    ['القائمة لا تعيد ملفات الصوت', alice.every(r => !('blob' in r))],
    ['ترقية قاعدة البيانات تحافظ على التسجيل', await stored?.blob.text() === 'synthetic'],
  ] as const
  output.textContent = checks.map(([name, ok]) => `${ok ? 'PASS' : 'FAIL'}: ${name}`).join('\n')
  if (checks.some(([, ok]) => !ok)) throw new Error('Recording library regression')
  output.setAttribute('data-passed', 'true')
} catch (error) {
  output.textContent += '\nFAIL: ' + String(error)
} finally {
  indexedDB.open = open
  indexedDB.deleteDatabase(testDb)
}
