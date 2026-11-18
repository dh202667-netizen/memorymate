import { dashboardSeed } from './data'
import { demoNarrations } from './catalog'
import { daysAgo, todayKey } from '@/utils/date'
import type { LocalDatabase } from '@/types'
export function createSeedDatabase(): LocalDatabase {
  const base = JSON.parse(JSON.stringify(dashboardSeed)) as typeof dashboardSeed
  const content = [
    '春节的早晨，王建国把红灯笼挂在门口，张淑芬在厨房准备大家爱吃的饺子。小明带着小红回到家，刚进门就喊了一声“我们回来啦”。\n\n吃过午饭，大家挤在客厅的沙发上拍全家福。小红坐在奶奶身边，说以后每年都要留一张这样的照片。那一刻，笑声和阳光一起留在了家里。',
    '第一次参加钢琴比赛，小红有些紧张。奶奶握着她的手说：“就像在家弹给我们听一样，慢慢来。”\n\n琴声响起时，家人在观众席安静地听着。比赛结束，小红跑过来拥抱奶奶。大家记住的，是她认真练习的每一天和开心的笑容。',
    '秋天，一家人去郊外看风景。王建国带了热茶，小明准备了点心，小红一路给大家介绍路边的花。\n\n走累了就在长椅上坐一会儿，看看远处的树。张淑芬说，和家人在一起，哪里都是好风景。',
  ]
  return {
    ...base,
    schemaVersion: 2,
    familyName: '张阿姨的温暖小家',
    taskDay: todayKey(),
    inviteCode: '628816',
    tasks: base.tasks.map((t) => ({ ...t, done: false })),
    stories: base.stories.map((s, i) => ({
      ...s,
      content: content[i],
      cover: s.cover,
    })),
    media: [
      {
        id: 'photo1',
        title: '春节家庭合影',
        type: 'photo',
        src: base.stories[0].cover,
        date: '2026-02-17',
        personIds: ['p1', 'p2', 'p3'],
        storyId: 's1',
        local: false,
      },
      {
        id: 'photo2',
        title: '与家人一起的好时光',
        type: 'photo',
        src: base.stories[2].cover,
        date: '2026-10-03',
        personIds: ['p1', 'p2', 'p3'],
        storyId: 's3',
        local: false,
      },
      {
        id: 'photo3',
        title: '小红的第一次钢琴比赛',
        type: 'photo',
        src: base.stories[1].cover,
        date: '2026-05-23',
        personIds: ['p3'],
        storyId: 's2',
        local: false,
      },
      ...demoNarrations.slice(0, 2).map((n, i) => ({
        id: n.id,
        title: n.title,
        type: 'audio' as const,
        src: n.src,
        date: todayKey(),
        personIds: ['p3'],
        storyId: i === 1 ? 's1' : undefined,
        transcript: n.text,
        local: false,
      })),
    ],
    observations: [
      {
        id: 'obs-example',
        date: todayKey(),
        category: '日常交流',
        content: '示例记录：今天和小红聊起春节聚会，愿意主动分享当时的趣事。',
      },
    ],
    dates: [
      {
        id: 'date1',
        title: '奶奶的生日',
        date: '2026-12-12',
        repeat: true,
        note: '一起吃一顿家常饭，记得提前准备照片。',
      },
    ],
    activity: base.weeklyMinutes.map((minutes, i) => ({
      id: `seed-activity-${i}`,
      label: '示例：日常散步',
      time: '09:20',
      detail: `示例活动 ${minutes} 分钟`,
      date: daysAgo(6 - i),
      minutes,
      source: 'example' as const,
    })),
    messages: base.messages.map((m) => ({
      ...m,
      createdAt: new Date().toISOString(),
      read: false,
    })),
    trainingRecords: [],
    chat: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '您好，我是忆伴。今天想聊聊什么？我们也可以一起重温家里的故事。',
        createdAt: new Date().toISOString(),
        simulated: true,
      },
    ],
    preferences: {
      shareActivity: true,
      allowFamilyEdit: true,
      familyMessages: true,
      taskReminders: true,
      importantDateReminders: true,
      familyBound: true,
    },
  }
}
