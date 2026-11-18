import { reactive } from 'vue'
import type {
  LocalDatabase,
  Person,
  Story,
  MemoryMedia,
  Observation,
  ImportantDate,
  TrainingRecord,
  ChatMessage,
  Preferences,
} from '@/types'
import { familyRepository, type AppCatalog } from '@/api/repositories'
import { newId, todayKey, timeLabel, validDate } from '@/utils/date'
import { useSessionStore } from './session'
import { clearSavedFiles } from '@/utils/media'
const state = reactive({
  dashboard: null as LocalDatabase | null,
  catalog: null as AppCatalog | null,
  loading: false,
  error: '',
})
let pending: Promise<void> | null = null
const text = (value: string, label: string, max = 100) => {
  if (!value.trim()) throw new Error(`请填写${label}`)
  if (value.trim().length > max) throw new Error(`${label}请控制在${max}字以内`)
  return value.trim()
}
function canEdit(db: LocalDatabase) {
  if (!db.preferences.allowFamilyEdit || !db.preferences.familyBound)
    throw new Error('长辈已暂停家属编辑，请先在隐私设置中确认授权')
}
async function update(operation: (db: LocalDatabase) => void) {
  const next = await familyRepository.transact(operation)
  state.dashboard = next
  return next
}
export function useFamilyStore() {
  return {
    state,
    async load(force: unknown = false) {
      if (pending) return pending
      if (
        state.dashboard &&
        state.catalog &&
        force !== true &&
        state.dashboard.taskDay === todayKey()
      )
        return
      state.loading = true
      state.error = ''
      pending = (async () => {
        try {
          const [db, catalog] = await Promise.all([
            familyRepository.getDashboard(),
            familyRepository.getCatalog(),
          ])
          state.dashboard = db
          state.catalog = catalog
        } catch (e) {
          state.error = e instanceof Error ? e.message : '暂时无法加载'
        } finally {
          state.loading = false
          pending = null
        }
      })()
      return pending
    },
    async savePerson(input: Omit<Person, 'familyId'>) {
      return update((db) => {
        canEdit(db)
        const person = {
          ...input,
          id: input.id || newId('person'),
          familyId: 'demo-family',
          name: text(input.name, '姓名', 30),
          relation: text(input.relation, '亲属关系', 20),
          intro: input.intro.trim().slice(0, 600),
        }
        const index = db.people.findIndex((p) => p.id === person.id)
        if (index >= 0) db.people[index] = person
        else db.people.push(person)
      })
    },
    async deletePerson(id: string) {
      return update((db) => {
        canEdit(db)
        db.people = db.people.filter((p) => p.id !== id)
        db.stories.forEach((s) => (s.personIds = s.personIds.filter((p) => p !== id)))
        db.media.forEach((m) => (m.personIds = m.personIds.filter((p) => p !== id)))
      })
    },
    async saveStory(input: Story) {
      return update((db) => {
        canEdit(db)
        if (!validDate(input.date)) throw new Error('请选择有效的故事日期')
        const story = {
          ...input,
          id: input.id || newId('story'),
          title: text(input.title, '故事标题', 60),
          description: input.description.trim().slice(0, 180),
          content: text(input.content ?? '', '故事内容', 4000),
          personIds: input.personIds.filter((id) => db.people.some((p) => p.id === id)),
        }
        const index = db.stories.findIndex((s) => s.id === story.id)
        if (index >= 0) db.stories[index] = story
        else db.stories.unshift(story)
      })
    },
    async deleteStory(id: string) {
      return update((db) => {
        canEdit(db)
        db.stories = db.stories.filter((s) => s.id !== id)
        db.media.forEach((m) => {
          if (m.storyId === id) m.storyId = undefined
        })
      })
    },
    async saveMedia(input: MemoryMedia) {
      return update((db) => {
        canEdit(db)
        db.media.unshift({
          ...input,
          id: input.id || newId('media'),
          title: text(input.title, '附件名称', 60),
        })
        if (input.storyId && input.type === 'photo') {
          const story = db.stories.find((s) => s.id === input.storyId)
          if (story) story.cover = input.src
        }
      })
    },
    async deleteMedia(id: string) {
      return update((db) => {
        canEdit(db)
        const item = db.media.find((m) => m.id === id)
        db.media = db.media.filter((m) => m.id !== id)
        if (item)
          db.stories.forEach((s) => {
            if (s.cover === item.src)
              s.cover =
                db.media.find((m) => m.type === 'photo' && m.storyId === s.id)?.src ??
                '/static/images/family-photo.png'
          })
      })
    },
    async markTask(id: string, done: boolean, minutes = 20) {
      return update((db) => {
        const task = db.tasks.find((t) => t.id === id)
        if (!task) throw new Error('没有找到这个任务')
        task.done = done
        db.activity = db.activity.filter((a) => !(a.taskId === id && a.date === todayKey()))
        if (done)
          db.activity.unshift({
            id: newId('activity'),
            label: `完成：${task.title}`,
            time: timeLabel(),
            date: todayKey(),
            detail: id === 't1' ? `记录散步 ${minutes} 分钟` : '在忆伴中记录了本次参与',
            minutes: id === 't1' ? Math.max(1, Math.min(180, minutes)) : 0,
            taskId: id,
            source: 'local',
          })
      })
    },
    async saveTraining(record: TrainingRecord) {
      return update((db) => {
        if (db.trainingRecords.some((r) => r.id === record.id)) return
        db.trainingRecords.unshift(record)
        const task = db.tasks.find((t) => t.id === 't2')
        if (task) task.done = true
        db.activity.unshift({
          id: newId('activity'),
          label: `参与${record.title}活动`,
          time: timeLabel(),
          date: todayKey(),
          detail: `完成 ${record.total} 道题，用时 ${record.seconds} 秒`,
          minutes: Math.max(1, Math.round(record.seconds / 60)),
          source: 'local',
        })
      })
    },
    async appendChat(messages: ChatMessage[]) {
      return update((db) => {
        db.chat.push(...messages)
        db.chat = db.chat.slice(-100)
      })
    },
    async clearChat() {
      return update((db) => {
        db.chat = db.chat.filter((m) => m.id === 'welcome')
      })
    },
    async saveObservation(input: Observation) {
      return update((db) => {
        if (!db.preferences.shareActivity || !db.preferences.familyBound)
          throw new Error('活动分享已暂停')
        if (!validDate(input.date)) throw new Error('请选择有效日期')
        db.observations.unshift({
          ...input,
          id: input.id || newId('observation'),
          content: text(input.content, '观察内容', 1200),
        })
      })
    },
    async deleteObservation(id: string) {
      return update((db) => {
        db.observations = db.observations.filter((o) => o.id !== id)
      })
    },
    async saveDate(input: ImportantDate) {
      return update((db) => {
        if (!validDate(input.date)) throw new Error('请选择有效日期')
        const item = {
          ...input,
          id: input.id || newId('date'),
          title: text(input.title, '日子名称', 60),
        }
        const index = db.dates.findIndex((d) => d.id === item.id)
        if (index >= 0) db.dates[index] = item
        else db.dates.push(item)
      })
    },
    async deleteDate(id: string) {
      return update((db) => {
        db.dates = db.dates.filter((d) => d.id !== id)
      })
    },
    async sendMessage(content: string, mediaId?: string) {
      return update((db) => {
        if (!db.preferences.familyBound) throw new Error('请先恢复家庭绑定')
        db.messages.unshift({
          id: newId('message'),
          personId: 'p2',
          name: db.familyUser.name,
          relation: '家属',
          text: text(content, '留言', 600),
          time: timeLabel(),
          avatar: db.familyUser.avatar,
          createdAt: new Date().toISOString(),
          mediaId,
          read: false,
        })
        db.activity.unshift({
          id: newId('activity'),
          label: '家人留下了问候',
          time: timeLabel(),
          date: todayKey(),
          detail: '家庭互动留言',
          source: 'local',
        })
      })
    },
    async markMessagesRead() {
      return update((db) => db.messages.forEach((m) => (m.read = true)))
    },
    async setPreference(key: keyof Preferences, value: boolean) {
      return update((db) => {
        if (
          useSessionStore().state.mode !== 'elder' &&
          ['shareActivity', 'allowFamilyEdit'].includes(key)
        )
          throw new Error('请由长辈本人决定是否分享和授权')
        db.preferences[key] = value
      })
    },
    async createInvite() {
      return update((db) => {
        db.inviteCode = String(Math.floor(100000 + Math.random() * 900000))
      })
    },
    async saveProfile(input: {
      name: string
      nickname?: string
      age?: number
      familyName?: string
    }) {
      return update((db) => {
        const name = text(input.name, '姓名', 30)
        if (useSessionStore().state.mode === 'family') db.familyUser.name = name
        else {
          if (!input.age || input.age < 1 || input.age > 120)
            throw new Error('年龄请填写1到120之间的数字')
          db.elder = { ...db.elder, name, nickname: input.nickname?.trim() || name, age: input.age }
        }
        if (input.familyName) db.familyName = text(input.familyName, '家庭名称', 40)
      })
    },
    async register(name: string, familyName: string) {
      return update((db) => {
        db.elder.name = text(name, '长辈姓名', 30)
        db.elder.nickname = name
        db.familyName = text(familyName, '家庭名称', 40)
      })
    },
    async reset() {
      await clearSavedFiles()
      state.dashboard = await familyRepository.reset()
    },
  }
}
