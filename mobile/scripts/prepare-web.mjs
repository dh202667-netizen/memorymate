import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const mobile = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(mobile, 'dist/build/h5')
const publish = resolve(mobile, '../publish/web')
const destination = resolve(publish, 'dist')
if (!existsSync(join(source, 'index.html'))) throw new Error('Run npm run build:h5 before preparing the public Demo.')
// Only remove the owned generated directory inside this deployment checkout.
if (destination !== join(publish, 'dist') || !destination.startsWith(publish + sep)) throw new Error('Unexpected deployment destination.')
if (existsSync(destination)) rmSync(destination, { recursive: true })
mkdirSync(publish, { recursive: true })
cpSync(source, destination, { recursive: true })
const files = readdirSync(destination, { recursive: true, withFileTypes: true }).filter(entry => entry.isFile())
const manifest = JSON.parse(readFileSync(join(mobile, 'src/manifest.json'), 'utf8'))
const report = {
  version: manifest.versionName,
  preparedAt: new Date().toISOString(),
  source: 'mobile/dist/build/h5',
  files: files.length,
  indexSha256: createHash('sha256').update(readFileSync(join(destination, 'index.html'))).digest('hex'),
  dataMode: 'device-local-demo',
  backend: false,
}
writeFileSync(join(publish, 'release.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report))
