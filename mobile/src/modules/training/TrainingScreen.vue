<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import AppIcon from '@/components/AppIcon.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import EmptyState from '@/components/EmptyState.vue'
import { usePageData } from '@/composables/usePageData'
import { getRoute } from '@/config/routes'
import { go } from '@/utils/navigation'
import { perform, confirmAction } from '@/utils/actions'
import { newId } from '@/utils/date'
import type { TrainingRecord } from '@/types'
const props = defineProps<{ routeId: string }>()
const { family, db, catalog, params } = usePageData()
const route = computed(() => getRoute(props.routeId))
const definition = computed(() =>
  catalog.value?.training.find((d) => d.type === (params.value.type || 'memory')),
)
const index = ref(0)
const choice = ref<number | null>(null)
const answers = ref<number[]>([])
const revealed = ref(false)
const recalling = ref(false)
const saving = ref(false)
const allowedExit = ref(false)
const historyFilter = ref('all')
const start = ref(Date.now())
const sessionId = newId('training')
onLoad(() => {
  start.value = Date.now()
})
const question = computed(() => definition.value?.questions[index.value])
const record = computed(() => db.value?.trainingRecords.find((r) => r.id === params.value.id))
const recordDefinition = computed(() =>
  catalog.value?.training.find((d) => d.type === record.value?.type),
)
const history = computed(
  () =>
    db.value?.trainingRecords.filter(
      (r) => historyFilter.value === 'all' || r.type === historyFilter.value,
    ) ?? [],
)
const progress = computed(() =>
  definition.value
    ? Math.round(
        ((index.value + (revealed.value ? 1 : 0)) / definition.value.questions.length) * 100,
      )
    : 0,
)
async function leave() {
  if (!(await confirmAction('先休息一下？', '未完成的活动不会生成成绩。随时都可以回来重新开始。')))
    return
  allowedExit.value = true
  go('training')
}
onBackPress(() => {
  if (props.routeId === 'trainingPlay' && !allowedExit.value) {
    void leave()
    return true
  }
  return false
})
function submit() {
  if (choice.value === null || revealed.value) return
  answers.value.push(choice.value)
  revealed.value = true
}
async function next() {
  if (!definition.value || !revealed.value) return
  if (index.value < definition.value.questions.length - 1) {
    index.value++
    choice.value = null
    revealed.value = false
    recalling.value = false
    return
  }
  if (saving.value) return
  saving.value = true
  const d = definition.value
  const result: TrainingRecord = {
    id: sessionId,
    type: d.type,
    title: d.title,
    createdAt: new Date().toISOString(),
    seconds: Math.max(1, Math.round((Date.now() - start.value) / 1000)),
    answers: [...answers.value],
    correct: answers.value.filter((a, i) => a === d.questions[i].answer).length,
    total: d.questions.length,
  }
  const ok = await perform(() => family.saveTraining(result), '这次活动已经记下来了')
  saving.value = false
  if (ok) {
    allowedExit.value = true
    go('trainingResult', { id: result.id }, true)
  }
}
</script>
<template>
  <AppLayout :title="route.title" :tab="route.tab ? route.id : undefined">
    <view v-if="db && catalog" class="stack">
      <template v-if="routeId === 'training'">
        <view>
          <text class="eyebrow">选一个活动，轻松开始</text>
          <view class="page-title">今天，一起动动脑</view>
          <text class="muted">没有时间压力，选择喜欢的小活动。</text>
        </view>
        <view class="card row between">
          <view>
            <view>我的活动足迹</view>
            <text class="muted">已记录 {{ db.trainingRecords.length }} 次参与</text>
          </view>
          <button role="button" tabindex="0" class="text-action" @click="go('trainingHistory')">
            查看历史
            <AppIcon name="chevron" :size="18" />
          </button>
        </view>
        <button
          v-for="d in catalog.training"
          :key="d.type"
          role="button"
          tabindex="0"
          class="card row category"
          @click="go('trainingDetail', { type: d.type })"
        >
          <view :class="['icon-tile', d.tone]"><AppIcon :name="d.icon" :size="27" /></view>
          <view class="grow">
            <view class="category-title">{{ d.title }}</view>
            <text class="muted">{{ d.detail }} · {{ d.questions.length }} 道小题</text>
          </view>
          <AppIcon name="chevron" :size="18" />
        </button>
        <text class="prototype-note">这些活动用于日常参与和体验，不用于认知诊断。</text>
      </template>
      <template v-else-if="routeId === 'trainingDetail'">
        <template v-if="definition">
          <view :class="['activity-hero', definition.tone]">
            <AppIcon :name="definition.icon" :size="44" />
            <view class="page-title">{{ definition.title }}小活动</view>
            <text>{{ definition.detail }}</text>
          </view>
          <view class="card stack">
            <SectionTitle title="怎么玩？" />
            <text>{{ definition.description }}</text>
            <text class="muted">
              共
              {{ definition.questions.length }}
              道选择题，选好后点“确认答案”。每题都有解释，最后可以回看本次记录。
            </text>
            <text class="muted">不设限时，也不用和别人比较。</text>
          </view>
          <AppButton @click="go('trainingPlay', { type: definition.type }, true)">
            开始活动
          </AppButton>
          <AppButton variant="ghost" @click="go('trainingHistory')">看看以前的活动</AppButton>
        </template>
        <EmptyState
          v-else
          title="没有找到这种活动"
          action="回到活动中心"
          @action="go('training')"
        />
      </template>
      <template v-else-if="routeId === 'trainingPlay'">
        <template v-if="definition && question">
          <view class="row between">
            <text class="muted">
              {{ definition.title }} · 第 {{ index + 1 }} / {{ definition.questions.length }} 题
            </text>
            <button role="button" tabindex="0" class="text-action" @click="leave">先休息</button>
          </view>
          <view class="progress-track">
            <view :style="{ width: progress + '%' }" class="progress-fill" />
          </view>
          <template v-if="question.remember && !recalling">
            <view class="card remember">
              <text class="eyebrow">先看一看，记在心里</text>
              <view class="stimulus">{{ question.remember }}</view>
              <text class="muted">准备好了再继续，不用着急。</text>
            </view>
            <AppButton @click="recalling = true">我看好了，开始回想</AppButton>
          </template>
          <template v-else>
            <view class="question-title">{{ question.prompt }}</view>
            <view v-if="question.stimulus" class="stimulus card">{{ question.stimulus }}</view>
            <button
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              role="button"
              tabindex="0"
              :disabled="revealed"
              :aria-pressed="choice === optionIndex"
              :class="[
                'answer-option',
                {
                  selected: choice === optionIndex,
                  correct: revealed && optionIndex === question.answer,
                },
              ]"
              @click="choice = optionIndex"
            >
              <text class="answer-letter">{{ ['A', 'B', 'C'][optionIndex] }}</text>
              <text>{{ option }}</text>
              <text v-if="choice === optionIndex && !revealed" class="selection-label">已选</text>
              <text
                v-if="revealed && optionIndex === question.answer"
                class="selection-label correct-label"
              >
                参考答案
              </text>
            </button>
            <AppButton v-if="!revealed" :disabled="choice === null" @click="submit">
              确认答案
            </AppButton>
            <view v-else class="card feedback">
              <view class="feedback-title">
                {{ choice === question.answer ? '选得很好！' : '一起看看这道题' }}
              </view>
              <text>{{ question.explanation }}</text>
              <AppButton :disabled="saving" @click="next">
                {{
                  saving
                    ? '正在记录…'
                    : index === definition.questions.length - 1
                      ? '查看本次结果'
                      : '下一题'
                }}
              </AppButton>
            </view>
          </template>
        </template>
        <EmptyState
          v-else
          title="这个活动暂时没有找到"
          action="回到活动中心"
          @action="go('training')"
        />
      </template>
      <template v-else-if="routeId === 'trainingResult'">
        <template v-if="record && recordDefinition">
          <view class="result-hero">
            <AppIcon name="check" :size="45" />
            <view class="page-title">今天的参与，值得记住</view>
            <text>{{ record.title }} · 已完成 {{ record.total }} 道题</text>
            <view class="result-count">
              {{ record.correct }}
              <text>/ {{ record.total }} 题答对</text>
            </view>
            <text class="muted">
              用时 {{ record.seconds }} 秒 · {{ record.createdAt.slice(0, 10) }}
            </text>
          </view>
          <view class="card">
            这只是本次题目的作答记录，不代表认知水平。按自己的节奏，多一次参与就多一份体验。
          </view>
          <SectionTitle title="一起回看" />
          <view v-for="(q, i) in recordDefinition.questions" :key="q.id" class="card review">
            <view>{{ i + 1 }}. {{ q.prompt }}</view>
            <text class="muted">您的选择：{{ q.options[record.answers[i]] ?? '未作答' }}</text>
            <text class="review-answer">参考答案：{{ q.options[q.answer] }}</text>
            <text class="muted">{{ q.explanation }}</text>
          </view>
          <AppButton @click="go('training')">回到活动中心</AppButton>
          <AppButton variant="secondary" @click="go('trainingHistory')">查看活动历史</AppButton>
        </template>
        <EmptyState
          v-else
          title="还没有这次活动记录"
          description="完成一轮活动后，就可以在这里回看。"
          action="开始一个活动"
          @action="go('training')"
        />
      </template>
      <template v-else-if="routeId === 'trainingHistory'">
        <view class="page-title">每一次参与，都有足迹</view>
        <view class="chips">
          <button
            v-for="d in [{ type: 'all', title: '全部' }, ...catalog.training]"
            :key="d.type"
            role="button"
            tabindex="0"
            :class="['chip', { active: historyFilter === d.type }]"
            @click="historyFilter = d.type"
          >
            {{ d.title }}
          </button>
        </view>
        <button
          v-for="r in history"
          :key="r.id"
          role="button"
          tabindex="0"
          class="card history-item"
          @click="go('trainingResult', { id: r.id })"
        >
          <view class="row between">
            <text class="category-title">{{ r.title }}</text>
            <AppIcon name="chevron" :size="18" />
          </view>
          <view>{{ r.correct }} / {{ r.total }} 题答对 · {{ r.seconds }} 秒</view>
          <text class="muted">{{ new Date(r.createdAt).toLocaleString('zh-CN') }}</text>
        </button>
        <EmptyState
          v-if="!history.length"
          title="第一次活动，随时开始"
          description="完成一轮小活动后，这里会留下您的参与记录。"
          action="去动动脑"
          @action="go('training')"
        />
      </template>
    </view>
    <EmptyState v-else title="正在准备小活动…" />
  </AppLayout>
</template>
<style scoped>
.category {
  width: 100%;
  text-align: left;
}
.category-title {
  font-size: calc(20px * var(--font-scale, 1));
  font-weight: 600;
}
.grow {
  flex: 1;
  min-width: 0;
}
.activity-hero,
.result-hero {
  padding: 28px 22px;
  border-radius: 26px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: flex-start;
}
.result-hero {
  background: var(--mm-green);
  align-items: center;
  text-align: center;
}
.result-count {
  font-size: calc(44px * var(--font-scale, 1));
  font-weight: 600;
}
.result-count text {
  font-size: calc(18px * var(--font-scale, 1));
  font-weight: 400;
}
.progress-track {
  height: 8px;
  border-radius: 8px;
  background: #e4e9dd;
}
.progress-fill {
  height: 100%;
  border-radius: 8px;
  background: #64815b;
  transition: width 0.2s;
}
.question-title {
  font-size: calc(25px * var(--font-scale, 1));
  font-weight: 600;
  line-height: 1.7;
}
.stimulus {
  font-size: calc(28px * var(--font-scale, 1));
  text-align: center;
  line-height: 1.8;
  margin: 18px 0;
  white-space: pre-wrap;
}
.answer-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 70px;
  padding: 18px;
  border: 1.5px solid #d9e1d2;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  font-size: calc(19px * var(--font-scale, 1));
}
.answer-option.selected {
  border-color: var(--mm-brand);
  background: var(--mm-amber);
}
.answer-option.correct {
  border-color: var(--mm-success);
  background: var(--mm-green);
}
.selection-label {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--mm-brand);
  font-size: calc(16px * var(--font-scale, 1));
}
.correct-label {
  color: var(--mm-success);
}
.answer-option[disabled] {
  opacity: 1;
}
.answer-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #edf1e7;
  min-width: 33px;
  height: 33px;
  font-size: calc(16px * var(--font-scale, 1));
}
.feedback {
  background: #eff3e8;
  line-height: 1.9;
}
.feedback-title {
  font-size: calc(22px * var(--font-scale, 1));
  font-weight: 600;
  margin-bottom: 8px;
}
.feedback .app-button {
  margin-top: 20px;
}
.review {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.review-answer {
  color: var(--mm-brand);
  font-weight: 600;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  border: 1px solid #d9e1d2;
  border-radius: 8px;
  min-height: 48px;
  padding: 10px 15px;
  font-size: calc(16px * var(--font-scale, 1));
}
.chip.active {
  background: var(--mm-brand);
  color: #fff;
}
.history-item {
  width: 100%;
  text-align: left;
  line-height: 1.8;
}
</style>
