import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const mobile = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const workspace = resolve(mobile, '..')
const source = join(mobile, 'dist/build/h5')
const destination = join(workspace, 'publish/github-pages')
const configuration = JSON.parse(readFileSync(join(workspace, 'publish/deployment.json'), 'utf8'))
if (!existsSync(join(source, 'index.html'))) throw new Error('Run npm run build:h5 first.')
if (existsSync(destination) && lstatSync(destination).isSymbolicLink()) throw new Error('Deployment directory must not be a symlink.')
if (existsSync(join(destination, '.git'))) {
  const remote = spawnSync('git', ['-C', destination, 'remote', 'get-url', 'origin'], { encoding: 'utf8' })
  const normalize = value => value.trim().replace(/\.git$/, '').replace(/\/$/, '')
  if (remote.status !== 0 || normalize(remote.stdout) !== normalize(configuration.primary.repository)) throw new Error('Unexpected deployment Git remote; nothing changed.')
}
mkdirSync(destination, { recursive: true })
// These are generated exports only. Preserve .git, repository settings and unrelated root files.
for (const name of ['assets', 'static', 'memorymate', 'index.html']) {
  const target = resolve(destination, name)
  if (!target.startsWith(destination + sep) || dirname(target) !== destination) throw new Error('Unsafe export path.')
  if (existsSync(target)) rmSync(target, { recursive: true, force: true })
}
cpSync(source, destination, { recursive: true })
mkdirSync(join(destination, 'memorymate'), { recursive: true })
cpSync(join(source, 'index.html'), join(destination, 'memorymate/index.html'))
writeFileSync(join(destination, '.nojekyll'), '')
console.log(JSON.stringify({ prepared: destination, url: configuration.primary.url, published: false }))
