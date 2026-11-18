<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import AppIcon from '@/components/AppIcon.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import FormField from '@/components/FormField.vue'
import EmptyState from '@/components/EmptyState.vue'
import { usePageData } from '@/composables/usePageData'
import { getRoute } from '@/config/routes'
import { go, back } from '@/utils/navigation'
import { perform, confirmAction } from '@/utils/actions'
import { todayKey, daysAgo } from '@/utils/date'
const props = defineProps<{ routeId: string }>()
const { family, db, catalog, isFamily } = usePageData()
const route = computed(() => getRoute(props.routeId))
const minutes = ref('20')
const busy = ref(false)
const period = ref(7)
const observation = reactive({ id: '', date: todayKey(), category: '日常交流', content: '' })
const sharing = computed(
  () =>
    !isFamily.value || (db.value?.preferences.shareActivity && db.value?.preferences.familyBound),
)
const recentTraining = computed(
  () => db.value?.trainingRecords.filter((r) => r.createdAt.slice(0, 10) >= daysAgo(6)) ?? [],
)
const completion = computed(() => db.value?.tasks.filter((t) => t.done).length ?? 0)
const bars = computed(() =>
  Array.from({ length: period.value === 7 ? 7 : 4 }, (_, i) => {
    const end = period.value === 7 ? 6 - i : (3 - i) * 7
    const start = period.value === 7 ? end : end + 6
    const records =
      db.value?.activity.filter(
        (a) => a.date && a.date >= daysAgo(start) && a.date <= daysAgo(end),
      ) ?? []
    return {
      label: period.value === 7 ? daysAgo(end).slice(5) : `${daysAgo(start).slice(5)}起`,
      minutes: records.reduce((sum, a) => sum + (a.minutes ?? 0), 0),
      count: records.length,
    }
  }),
)
const maxMinutes = computed(() => Math.max(1, ...bars.value.map((b) => b.minutes)))
async function task(id: string, done: boolean) {
  if (busy.value) return
  const count = Number(minutes.value)
  if (id === 't1' && done && (!Number.isFinite(count) || count < 1 || count > 180)) {
    await perform(async () => {
      throw new Error('散步时长请填1到180之间的分钟数')
    })
    return
  }
  busy.value = true
  await perform(
    () => family.markTask(id, done, count),
    done ? '今天的参与已记下来' : '已撤销这次记录',
  )
  busy.value = false
}
async function save() {
  if (busy.value) return
  busy.value = true
  const ok = await perform(() => family.saveObservation(observation), '观察记录已保存')
  busy.value = false
  if (ok) back()
}
async function remove(id: string) {
  if (await confirmAction('删除观察记录？', '这条设备上的观察记录将被移除。'))
    await perform(() => family.deleteObservation(id), '已删除观察记录')
}
</script>
<template>
  <AppLayout :title="route.title" :tab="route.tab ? route.id : undefined">
    <view v-if="db && catalog" class="stack">
      <template v-if="routeId === 'observationAdd'">
        <view class="page-title">记下生活中的真实变化</view>
        <text class="muted">描述观察到的事实，避免替家人下诊断结论。</text>
        <FormField label="观察日期（YYYY-MM-DD）" v-model="observation.date" :maxlength="10" />
        <view class="card">
          <view>观察分类</view>
          <view class="chips">
            <button
              v-for="category in catalog.observationCategories"
              :key="category"
              role="button"
              tabindex="0"
              :class="['chip', { active: observation.category === category }]"
              @click="observation.category = category"
            >
              {{ category }}
            </button>
          </view>
        </view>
        <FormField
          label="观察内容"
          v-model="observation.content"
          placeholder="例如：今天主动提起周末的家庭聚会，愿意分享当时的趣事。"
          multiline
          :maxlength="1200"
        />
        <AppButton :disabled="busy || !sharing" @click="save">保存观察</AppButton>
        <AppButton variant="ghost" @click="back">取消，返回</AppButton>
      </template>
      <template v-else-if="!sharing">
        <EmptyState
          title="日常活动分享已暂停"
          description="长辈可以在隐私与授权中决定是否向家属分享。恢复前不展示活动和观察记录。"
        />
      </template>
      <template v-else-if="routeId === 'health'">
        <view>
          <text class="eyebrow">完成一件小事，记下今天</text>
          <view class="page-title">今天，也照顾好自己</view>
          <text class="muted">
            {{ todayKey() }} · 已完成 {{ completion }} / {{ db.tasks.length }} 个小目标
          </text>
        </view>
        <view v-for="t in db.tasks" :key="t.id" class="card stack">
          <view class="row">
            <view :class="['icon-tile', t.tone]"><AppIcon :name="t.icon" /></view>
            <view>
              <view class="task-title">{{ t.title }}</view>
              <text class="muted">{{ t.done ? '今天已参与' : t.detail }}</text>
            </view>
          </view>
          <template v-if="!isFamily">
            <view v-if="t.id === 't1' && !t.done" class="duration-options">
              <text class="muted">点选本次散步时长</text>
              <view class="chips">
                <button
                  v-for="duration in [10, 15, 20, 30]"
                  :key="duration"
                  role="button"
                  tabindex="0"
                  :aria-pressed="minutes === String(duration)"
                  :class="['chip', { active: minutes === String(duration) }]"
                  @click="minutes = String(duration)"
                >
                  {{ duration }}分钟
                </button>
              </view>
            </view>
            <FormField
              v-if="t.id === 't1' && !t.done"
              label="本次散步时长（分钟）"
              v-model="minutes"
              type="number"
              :maxlength="3"
            />
            <text v-if="t.id === 't3' && !t.done" class="muted">
              与家人实际交流后，再点击下方记录。
            </text>
            <AppButton v-if="!t.done && t.id === 't2'" @click="go('training')">
              开始认知小活动
            </AppButton>
            <AppButton v-else-if="!t.done" :disabled="busy" @click="task(t.id, true)">
              {{ t.id === 't1' ? '记录今日散步' : '记录一次家庭交流' }}
            </AppButton>
            <AppButton v-else variant="ghost" :disabled="busy" @click="task(t.id, false)">
              撤销今天这次记录
            </AppButton>
          </template>
          <text v-else class="muted">由长辈端记录参与情况。</text>
        </view>
        <SectionTitle title="今天留下的日常" />
        <view
          v-for="a in db.activity.filter((a) => a.date === todayKey())"
          :key="a.id"
          class="card"
        >
          <view>{{ a.label }}</view>
          <text class="muted">{{ a.time }} · {{ a.detail }}</text>
        </view>
        <EmptyState
          v-if="!db.activity.some((a) => a.date === todayKey())"
          title="从一件小事开始"
          description="完成任务后，这里会留下真实的本地参与记录。"
        />
      </template>
      <template v-else>
        <view>
          <view class="page-title">用记录，看见日常</view>
          <text class="muted">展示参与事实和家属观察，不评价认知水平。</text>
        </view>
        <view class="stats-row">
          <view class="card stat">
            <strong>{{ completion }}/{{ db.tasks.length }}</strong>
            <text>今日任务</text>
          </view>
          <view class="card stat">
            <strong>{{ recentTraining.length }}</strong>
            <text>近7天活动次数</text>
          </view>
        </view>
        <AppButton variant="secondary" @click="go('health')">查看今日健康任务</AppButton>
        <SectionTitle title="活动时长记录" caption="单位：分钟；示例记录与本地操作记录一起展示" />
        <view class="chips">
          <button
            role="button"
            tabindex="0"
            :class="['chip', { active: period === 7 }]"
            @click="period = 7"
          >
            近7天
          </button>
          <button
            role="button"
            tabindex="0"
            :class="['chip', { active: period === 28 }]"
            @click="period = 28"
          >
            近4周
          </button>
        </view>
        <view class="card">
          <view class="bars">
            <view v-for="bar in bars" :key="bar.label" class="bar-column">
              <text class="bar-number">{{ bar.count ? bar.minutes : '—' }}</text>
              <view
                class="bar"
                :style="{
                  height: bar.count ? Math.max(4, (bar.minutes / maxMinutes) * 100) + 'px' : '0px',
                }"
              />
              <text class="bar-label">{{ bar.label }}</text>
            </view>
          </view>
          <text class="muted chart-note">
            “—”表示没有记录，不能解释为没有活动。原型中的示例条目会单独标记。
          </text>
        </view>
        <SectionTitle title="认知活动参与" />
        <view class="card">
          <text>近7天完成 {{ recentTraining.length }} 次小活动。</text>
          <view v-for="r in recentTraining.slice(0, 5)" :key="r.id" class="record-row">
            <view>{{ r.title }} · {{ r.total }} 道题</view>
            <text class="muted">{{ r.createdAt.slice(0, 10) }} · {{ r.seconds }} 秒</text>
          </view>
          <text v-if="!recentTraining.length" class="muted">
            目前还没有参与记录，可以邀请家人一起体验。
          </text>
        </view>
        <SectionTitle title="家属观察" action="新增观察" @action="go('observationAdd')" />
        <view v-for="o in db.observations" :key="o.id" class="card">
          <view class="row between">
            <text>{{ o.category }}</text>
            <button role="button" tabindex="0" class="text-action" @click="remove(o.id)">
              删除
            </button>
          </view>
          <text class="muted">{{ o.date }}</text>
          <view class="observation-text">{{ o.content }}</view>
        </view>
        <EmptyState
          v-if="!db.observations.length"
          title="用一句话记录真实日常"
          action="新增观察"
          @action="go('observationAdd')"
        />
        <SectionTitle title="最近的活动记录" />
        <view v-for="a in db.activity.slice(0, 15)" :key="a.id" class="card">
          <view>{{ a.label }}</view>
          <text class="muted">
            {{ a.date }} {{ a.time }} · {{ a.source === 'example' ? '示例记录' : '本地记录' }}
          </text>
          <view class="muted">{{ a.detail }}</view>
        </view>
      </template>
    </view>
    <EmptyState v-else title="正在准备日常记录…" />
  </AppLayout>
</template>
<style scoped>
.task-title {
  font-size: calc(21px * var(--font-scale, 1));
  font-weight: 600;
}
.stats-row {
  display: flex;
  gap: 12px;
}
.stat {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat strong {
  font-size: calc(30px * var(--font-scale, 1));
  font-weight: 600;
}
.stat text {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  border: 1px solid #dbe3d4;
  border-radius: 8px;
  padding: 10px 16px;
  min-height: 48px;
  font-size: calc(16px * var(--font-scale, 1));
}
.chip.active {
  background: var(--mm-brand);
  color: #fff;
}
.bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  min-height: 165px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e1e7da;
}
.bar-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.bar {
  width: 24px;
  max-width: 80%;
  background: #91a97c;
  border-radius: 6px 6px 0 0;
}
.bar-number,
.bar-label {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.chart-note {
  display: block;
  margin-top: 15px;
  font-size: calc(16px * var(--font-scale, 1));
}
.record-row {
  padding: 14px 0;
  border-bottom: 1px solid #e8ece2;
}
.observation-text {
  white-space: pre-wrap;
  line-height: 1.9;
  margin-top: 10px;
  overflow-wrap: anywhere;
}
</style>
