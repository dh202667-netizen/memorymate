import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const routes = JSON.parse(await readFile(resolve(root, 'src/config/routes.json'), 'utf8'))
const groups = {
  memory: {
    'memory/MemoryScreen': [
      'memory',
      'people',
      'person',
      'stories',
      'story',
      'album',
      'relations',
      'timeline',
      'manageMemory',
    ],
    'memory/MemoryEditor': ['personEdit', 'storyEdit', 'mediaAdd'],
  },
  training: {
    'training/TrainingScreen': [
      'training',
      'trainingDetail',
      'trainingPlay',
      'trainingResult',
      'trainingHistory',
    ],
  },
  daily: {
    'companion/CompanionScreen': ['companion'],
    'health/HealthScreen': ['health', 'observation', 'observationAdd'],
  },
  family: { 'family/InteractionScreen': ['interaction', 'messageAdd', 'dates', 'messages'] },
  account: {
    'account/AccountScreen': [
      'profile',
      'binding',
      'notifications',
      'privacy',
      'settings',
      'register',
    ],
  },
}
for (const group of process.argv.slice(2)) {
  if (!groups[group]) throw new Error('Unknown group ' + group)
  for (const [module, ids] of Object.entries(groups[group]))
    for (const id of ids) {
      const route = routes.find((r) => r.id === id)
      const name = module.split('/').pop()
      await writeFile(
        resolve(root, 'src', route.path + '.vue'),
        `<script setup lang="ts">\nimport ${name} from '@/modules/${module}.vue'\n</script>\n<template><${name} route-id="${id}" /></template>\n`,
      )
    }
}
