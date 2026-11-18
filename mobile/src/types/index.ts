export type UserMode = 'elder' | 'family'
export type FontSize = 'standard' | 'large' | 'extra'
export type TrainingType = 'memory' | 'attention' | 'language' | 'executive' | 'spatial'
export interface TrainingCategory {
  type: TrainingType
  title: string
  detail: string
  icon: string
  tone: string
}
export interface Person {
  id: string
  familyId: string
  name: string
  relation: string
  intro: string
  avatar: string
}
export interface Story {
  id: string
  title: string
  date: string
  description: string
  personIds: string[]
  cover: string
  content?: string
}
export interface DailyTask {
  id: string
  title: string
  detail: string
  icon: string
  tone: string
  done: boolean
}
export interface FamilyMessage {
  id: string
  personId: string
  name: string
  relation: string
  text: string
  time: string
  avatar: string
  createdAt?: string
  mediaId?: string
  read?: boolean
}
export interface ActivityRecord {
  id: string
  label: string
  time: string
  detail: string
  date?: string
  minutes?: number
  taskId?: string
  source?: 'example' | 'local'
}
export interface Dashboard {
  familyUser: { name: string; avatar: string }
  elder: { name: string; nickname: string; age: number; avatar: string }
  people: Person[]
  stories: Story[]
  tasks: DailyTask[]
  messages: FamilyMessage[]
  activity: ActivityRecord[]
  weeklyMinutes: number[]
}
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  simulated: boolean
}
export interface MediaAsset {
  id: string
  familyId: string
  type: 'photo' | 'audio' | 'video'
  objectKey: string
  consentId?: string
}
export interface MemoryMedia {
  id: string
  title: string
  type: 'photo' | 'audio' | 'video'
  src: string
  date: string
  personIds: string[]
  storyId?: string
  transcript?: string
  local: boolean
}
export interface Observation {
  id: string
  date: string
  category: string
  content: string
}
export interface ImportantDate {
  id: string
  title: string
  date: string
  repeat: boolean
  note: string
}
export interface TrainingQuestion {
  id: string
  prompt: string
  stimulus?: string
  options: string[]
  answer: number
  explanation: string
  remember?: string
}
export interface TrainingDefinition extends TrainingCategory {
  description: string
  questions: TrainingQuestion[]
}
export interface TrainingRecord {
  id: string
  type: TrainingType
  title: string
  createdAt: string
  seconds: number
  answers: number[]
  correct: number
  total: number
}
export interface Preferences {
  shareActivity: boolean
  allowFamilyEdit: boolean
  familyMessages: boolean
  taskReminders: boolean
  importantDateReminders: boolean
  familyBound: boolean
}
export interface LocalDatabase extends Dashboard {
  schemaVersion: 2
  familyName: string
  taskDay: string
  media: MemoryMedia[]
  observations: Observation[]
  dates: ImportantDate[]
  trainingRecords: TrainingRecord[]
  chat: ChatMessage[]
  preferences: Preferences
  inviteCode: string
}
