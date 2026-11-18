import type { ChatMessage } from '@/types'
import { familyRepository } from './repositories'
import { companionReplies } from '@/mock/companion'
import { newId } from '@/utils/date'
export interface CompanionService {
  reply(messages: readonly ChatMessage[], context?: { storyId?: string }): Promise<ChatMessage>
}
export const mockCompanionService: CompanionService = {
  async reply(messages, context) {
    if (!messages.length) throw new Error('请先说一句话')
    await new Promise((resolve) => setTimeout(resolve, 450))
    const db = await familyRepository.getDashboard()
    const input = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content ?? ''
    let content = companionReplies.fallback
    if (/诊断|阿尔茨海默|痴呆|治疗|开药/.test(input)) content = companionReplies.medical
    else if (context?.storyId || /故事|春节|回忆/.test(input)) {
      const story =
        db.stories.find((s) => s.id === context?.storyId) ??
        db.stories.find((s) => input.includes(s.title)) ??
        db.stories[0]
      content = story
        ? `我们一起想想《${story.title}》。${(story.content || story.description).split('\n')[0]}\n您还记得当时最开心的是什么吗？`
        : '家里还没有故事。可以请家属写下一段大家熟悉的回忆，我们再一起聊聊。'
    } else if (/散步|公园|运动/.test(input)) content = companionReplies.walk
    else if (/想念|想家|小红|难过|孤单/.test(input)) content = companionReplies.miss
    else if (/今天|你好|您好/.test(input)) content = companionReplies.daily
    return {
      id: newId('reply'),
      role: 'assistant',
      content,
      createdAt: new Date().toISOString(),
      simulated: true,
    }
  },
}
// Local mock only. A future adapter can implement CompanionService without changing pages.
