import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const pagesArg = process.argv.slice(2)
const pages = pagesArg.length ? pagesArg.map(Number) : [31]

if (process.env.QF_DEVELOPER_ACCOUNT_CONFIRMED !== '1') {
  console.error([
    'Quran Foundation permits app bundling of its documented Quran fonts when the app maintains an active Developer Console account.',
    'Create/confirm that account first, then run:',
    'QF_DEVELOPER_ACCOUNT_CONFIRMED=1 yarn quran:prepare 31',
  ].join('\n'))
  process.exit(1)
}

for (const page of pages) {
  if (!Number.isInteger(page) || page < 1 || page > 604) throw new Error(`Invalid Mushaf page: ${page}`)
}

const targetDir = resolve('public/quran/fonts/v2')
await mkdir(targetDir, { recursive: true })

for (const page of pages) {
  const url = `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${page}.woff2`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to download page ${page} font: HTTP ${response.status}`)
  await writeFile(resolve(targetDir, `p${page}.woff2`), new Uint8Array(await response.arrayBuffer()))
  console.log(`Prepared QCF V2 font for page ${page}`)
}
