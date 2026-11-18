import type { TrainingDefinition } from '@/types'
export const trainingCatalog: TrainingDefinition[] = [
  {
    type: 'memory',
    title: '记忆力',
    detail: '记住熟悉的事物',
    icon: 'brain',
    tone: 'green',
    description: '先看一看，再回想。记不住也没关系，每一步都是练习。',
    questions: [
      {
        id: 'm1',
        prompt: '刚才的清单里，哪一种水果出现过？',
        remember: '苹果 · 香蕉 · 葡萄',
        options: ['西瓜', '香蕉', '草莓'],
        answer: 1,
        explanation: '刚才的清单是苹果、香蕉和葡萄。',
      },
      {
        id: 'm2',
        prompt: '小红准备在什么时候回家？',
        remember: '小红说：我星期六回家，陪奶奶一起吃午饭。',
        options: ['星期一', '星期三', '星期六'],
        answer: 2,
        explanation: '小红说的是星期六回家。',
      },
      {
        id: 'm3',
        prompt: '刚才有几样物品？',
        remember: '钥匙 · 水杯 · 眼镜 · 帽子',
        options: ['三样', '四样', '五样'],
        answer: 1,
        explanation: '钥匙、水杯、眼镜和帽子，一共四样。',
      },
    ],
  },
  {
    type: 'attention',
    title: '注意力',
    detail: '发现小小的不同',
    icon: 'sun',
    tone: 'amber',
    description: '仔细看看，找到目标。不用赶时间。',
    questions: [
      {
        id: 'a1',
        prompt: '下面哪一项与其他项不同？',
        stimulus: '圆形 · 圆形 · 三角形',
        options: ['第一项', '第二项', '第三项'],
        answer: 2,
        explanation: '第三项是三角形，其他是圆形。',
      },
      {
        id: 'a2',
        prompt: '这一行里，有几个“春”字？',
        stimulus: '春 夏 春 秋 冬 春',
        options: ['两个', '三个', '四个'],
        answer: 1,
        explanation: '第1、3、6个字都是春，一共三个。',
      },
      {
        id: 'a3',
        prompt: '请选择与目标完全一样的数字。',
        stimulus: '目标：618',
        options: ['681', '618', '816'],
        answer: 1,
        explanation: '目标数字是618，顺序也要一样。',
      },
    ],
  },
  {
    type: 'language',
    title: '语言能力',
    detail: '词语里的小乐趣',
    icon: 'chat',
    tone: 'peach',
    description: '从熟悉的词语开始，找一找日常生活中的联系。',
    questions: [
      {
        id: 'l1',
        prompt: '“鸟语____”中，适合填哪个词？',
        options: ['花香', '桌椅', '河流'],
        answer: 0,
        explanation: '鸟语花香，形容美好的自然景色。',
      },
      {
        id: 'l2',
        prompt: '哪一种东西通常用来写字？',
        options: ['茶杯', '铅笔', '枕头'],
        answer: 1,
        explanation: '铅笔是常用的写字工具。',
      },
      {
        id: 'l3',
        prompt: '“温暖”的意思更接近哪一项？',
        options: ['暖和', '寒冷', '遥远'],
        answer: 0,
        explanation: '温暖与暖和的意思相近。',
      },
    ],
  },
  {
    type: 'executive',
    title: '执行能力',
    detail: '把日常排个顺序',
    icon: 'check',
    tone: 'green',
    description: '想一想完成一件小事需要哪些步骤，按日常经验选择。',
    questions: [
      {
        id: 'e1',
        prompt: '出门散步之前，通常先做什么？',
        options: ['查看天气、穿好合适的鞋', '到家后洗手', '已经走到公园'],
        answer: 0,
        explanation: '出发前先做好天气和穿着准备。',
      },
      {
        id: 'e2',
        prompt: '把衣服放进洗衣机后，下一步较合适的是？',
        options: ['直接穿上湿衣服', '加入洗涤剂并选择程序', '把衣服扔掉'],
        answer: 1,
        explanation: '加入合适洗涤剂，选择程序后再开始洗涤。',
      },
      {
        id: 'e3',
        prompt: '买菜需要先准备什么，能减少遗漏？',
        options: ['购物清单', '电视节目表', '旧报纸'],
        answer: 0,
        explanation: '列一张购物清单，可以帮助安排购买顺序。',
      },
    ],
  },
  {
    type: 'spatial',
    title: '视觉空间',
    detail: '看看形状和方向',
    icon: 'photo',
    tone: 'amber',
    description: '观察方向、位置和形状，用清晰的符号进行轻松练习。',
    questions: [
      {
        id: 's1',
        prompt: '下面的箭头指向哪里？',
        stimulus: '→',
        options: ['左边', '右边', '上方'],
        answer: 1,
        explanation: '箭头 → 指向右边。',
      },
      {
        id: 's2',
        prompt: '哪个形状有三个角？',
        options: ['圆形 ○', '三角形 △', '正方形 □'],
        answer: 1,
        explanation: '三角形有三个角。',
      },
      {
        id: 's3',
        prompt: '从左向右数，星星在第几个位置？',
        stimulus: '○  □  ☆  △',
        options: ['第一个', '第二个', '第三个'],
        answer: 2,
        explanation: '星星在第三个位置。',
      },
    ],
  },
]
export const companionTopics = ['聊聊今天', '讲个家庭故事', '散步小建议', '我有些想家人了']
export const demoVoiceInputs = [
  '我想听听春节的故事。',
  '今天我去公园散步了。',
  '我有点想念小红了。',
]
export const observationCategories = ['日常交流', '活动参与', '饮食与作息', '其他日常观察']
export const avatarOptions = [
  '/static/images/grandma.svg',
  '/static/images/grandpa.svg',
  '/static/images/son.svg',
  '/static/images/girl.svg',
]
export const demoNarrations = [
  {
    id: 'voice1',
    title: '小红的周末问候',
    src: '/static/audio/greeting.wav',
    text: '奶奶，周末我回家陪您吃饭呀。到时候我们一起看看以前的照片，听您讲讲家里的故事。',
  },
  {
    id: 'voice2',
    title: '春节家庭聚会',
    src: '/static/audio/spring.wav',
    text: '那天，我们一家人围坐在桌边。建国爷爷挂好了灯笼，小明端来了热腾腾的饺子，小红笑着说，今年还要再拍一张全家福。',
  },
  {
    id: 'voice3',
    title: '忆伴的问候',
    src: '/static/audio/companion.wav',
    text: '您好，我是忆伴。我们可以聊聊今天的小事，也可以一起看看家庭故事。按自己的节奏，慢慢说，我在这里陪着您。',
  },
]
