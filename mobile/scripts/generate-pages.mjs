import { readFile, writeFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const routes = JSON.parse(await readFile(resolve(root, 'src/config/routes.json'), 'utf8'))
const check = process.argv.includes('--check')
if (
  new Set(routes.map((r) => r.id)).size !== routes.length ||
  new Set(routes.map((r) => r.path)).size !== routes.length
)
  throw new Error('Duplicate route')
const output =
  JSON.stringify(
    {
      pages: routes.map((r) => ({
        path: r.path,
        style: { navigationStyle: 'custom', navigationBarTitleText: r.title },
      })),
      globalStyle: {
        navigationStyle: 'custom',
        navigationBarTextStyle: 'black',
        backgroundColor: '#F7F8F2',
        backgroundColorTop: '#F7F8F2',
        pageOrientation: 'portrait',
        rpxCalcMaxDeviceWidth: 480,
        rpxCalcBaseDeviceWidth: 375,
        rpxCalcIncludeWidth: 750,
      },
    },
    null,
    2,
  ) + '\n'
const pagesPath = resolve(root, 'src/pages.json')
if (check) {
  if ((await readFile(pagesPath, 'utf8')) !== output)
    throw new Error('pages.json drift; run npm run pages:generate')
} else await writeFile(pagesPath, output)
for (const route of routes) {
  for (const id of route.links ?? [])
    if (!routes.some((r) => r.id === id)) throw new Error(`Broken link ${id}`)
  const target = resolve(root, 'src', route.path + '.vue')
  try {
    await access(target)
  } catch {
    throw new Error(`Missing business page ${route.path}. Create the page before registering its route.`)
  }
}
console.log(`${check ? 'Checked' : 'Generated'} ${routes.length} routes; existing pages preserved.`)
