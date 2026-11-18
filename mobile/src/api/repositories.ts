import type { LocalDatabase } from '@/types'
import {
  trainingCatalog,
  companionTopics,
  demoVoiceInputs,
  observationCategories,
  avatarOptions,
  demoNarrations,
} from '@/mock/catalog'
import { createSeedDatabase } from '@/mock/database'
import { readStorage, writeStorage } from '@/utils/storage'
import { todayKey, daysAgo } from '@/utils/date'
import { storyPhoto } from '@/utils/presentation'
const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data)) as T
function normalize(db: LocalDatabase) {
  // Upgrade bundled placeholder covers without touching uploaded media or user records.
  db.stories.forEach((story) => {
    story.cover = storyPhoto(story.cover, story.id)
  })
  db.media
    .filter((media) => media.type === 'photo')
    .forEach((media) => {
      media.src = storyPhoto(media.src, media.storyId)
    })
  if (db.taskDay !== todayKey()) {
    db.taskDay = todayKey()
    db.tasks.forEach((t) => (t.done = false))
  }
  db.weeklyMinutes = Array.from({ length: 7 }, (_, i) =>
    db.activity
      .filter((a) => a.date === daysAgo(6 - i))
      .reduce((sum, a) => sum + (a.minutes ?? 0), 0),
  )
  return db
}
function snapshot(): LocalDatabase {
  const stored = readStorage<LocalDatabase | null>('database.v2', null)
  return normalize(stored?.schemaVersion === 2 ? clone(stored) : createSeedDatabase())
}
export const familyRepository = {
  async getDashboard() {
    return snapshot()
  },
  async getTrainingCategories() {
    return clone(trainingCatalog)
  },
  async getCatalog() {
    return clone({
      training: trainingCatalog,
      topics: companionTopics,
      voiceInputs: demoVoiceInputs,
      observationCategories,
      avatars: avatarOptions,
      narrations: demoNarrations,
    })
  },
  async transact(operation: (draft: LocalDatabase) => void): Promise<LocalDatabase> {
    const draft = snapshot()
    operation(draft)
    normalize(draft)
    if (!writeStorage('database.v2', draft))
      throw new Error('设备存储空间不足，尚未保存。请减少附件后再试。')
    return clone(draft)
  },
  async reset() {
    const db = createSeedDatabase()
    if (!writeStorage('database.v2', db)) throw new Error('暂时无法重置，请稍后重试')
    return db
  },
}
export type AppCatalog = Awaited<ReturnType<typeof familyRepository.getCatalog>>
