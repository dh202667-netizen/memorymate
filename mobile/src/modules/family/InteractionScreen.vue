<script setup lang="ts">
import FamilyAvatar from '@/components/FamilyAvatar.vue'
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/FormField.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import MediaPlayer from '@/components/MediaPlayer.vue'
import ToggleRow from '@/components/ToggleRow.vue'
import EmptyState from '@/components/EmptyState.vue'
import { usePageData } from '@/composables/usePageData'
import { getRoute } from '@/config/routes'
import { go, back } from '@/utils/navigation'
import { perform, confirmAction } from '@/utils/actions'
import { todayKey } from '@/utils/date'
import { nextDate, remainingDays } from '@/utils/reminders'
import type { ImportantDate } from '@/types'
const props = defineProps<{ routeId: string }>()
const { family, db, params, isFamily } = usePageData()
const route = computed(() => getRoute(props.routeId))
const content = ref('')
const attachment = ref('')
const busy = ref(false)
const dateOpen = ref(false)
const dateForm = reactive<ImportantDate>({
  id: '',
  title: '',
  date: todayKey(),
  repeat: true,
  note: '',
})
const dates = computed(() =>
  [...(db.value?.dates ?? [])].sort((a, b) => nextDate(a).localeCompare(nextDate(b))),
)
const selectedMedia = computed(() => db.value?.media.find((m) => m.id === attachment.value))
const availableMedia = computed(
  () =>
    db.value?.media.filter((m) => (params.value.kind === 'photo' ? m.type === 'photo' : true)) ??
    [],
)
onShow(async () => {
  await family.load()
  if (props.routeId === 'messages' && !isFamily.value && db.value?.messages.some((m) => !m.read))
    await perform(() => family.markMessagesRead())
})
async function send() {
  if (busy.value) return
  busy.value = true
  const ok = await perform(
    () => family.sendMessage(content.value, attachment.value || undefined),
    '问候已保存在家庭留言中',
  )
  busy.value = false
  if (ok) back()
}
function editDate(item?: ImportantDate) {
  Object.assign(dateForm, item ?? { id: '', title: '', date: todayKey(), repeat: true, note: '' })
  dateOpen.value = true
}
async function saveDate() {
  if (busy.value) return
  busy.value = true
  const ok = await perform(() => family.saveDate({ ...dateForm }), '这个日子已经记下来了')
  busy.value = false
  if (ok) dateOpen.value = false
}
async function removeDate(id: string) {
  if (await confirmAction('删除这个日子？', '本地的重要日期记录会被移除。'))
    await perform(() => family.deleteDate(id), '已删除')
}
</script>
<template>
  <AppLayout :title="route.title" :tab="route.tab ? route.id : undefined">
    <view v-if="db" class="stack">
      <EmptyState
        v-if="isFamily && !db.preferences.familyBound"
        title="家庭绑定已暂停"
        description="请使用长辈提供的演示邀请码重新绑定。"
        action="查看家庭绑定"
        @action="go('binding')"
      />
      <template v-else>
        <template v-if="routeId === 'messageAdd'">
          <view>
            <view class="page-title">一句问候，就是陪伴</view>
            <text class="muted">写给{{ db.elder.name }}，保存在这个家庭中。</text>
          </view>
          <FormField
            label="想对家人说的话"
            v-model="content"
            placeholder="说说周末的安排，或分享今天的小事…"
            multiline
            :maxlength="600"
          />
          <view class="card">
            <view>带上一份回忆（可选）</view>
            <view class="attachments">
              <button
                role="button"
                tabindex="0"
                :class="['attachment', { selected: !attachment }]"
                @click="attachment = ''"
              >
                只留文字
              </button>
              <button
                v-for="m in availableMedia"
                :key="m.id"
                role="button"
                tabindex="0"
                :class="['attachment', { selected: attachment === m.id }]"
                @click="attachment = m.id"
              >
                <AppIcon
                  :name="m.type === 'photo' ? 'photo' : m.type === 'audio' ? 'mic' : 'book'"
                  :size="20"
                />
                <text>{{ m.title }}</text>
              </button>
            </view>
            <text v-if="!availableMedia.length" class="muted">
              可以先在记忆管理中添加照片或声音。
            </text>
          </view>
          <view v-if="selectedMedia" class="card"><MediaPlayer :media="selectedMedia" /></view>
          <AppButton :disabled="busy" @click="send">
            {{ busy ? '正在保存…' : '留下这句问候' }}
          </AppButton>
          <AppButton variant="ghost" @click="back">取消，返回</AppButton>
          <text class="prototype-note">同一台设备中的家庭留言，不会发送短信或外部消息。</text>
        </template>
        <template v-else-if="routeId === 'dates'">
          <SectionTitle title="记得每个重要日子" action="添加日期" @action="editDate()" />
          <view v-if="dateOpen" class="card stack">
            <FormField
              label="日子名称"
              v-model="dateForm.title"
              placeholder="例如：奶奶的生日"
              :maxlength="60"
            />
            <FormField label="日期（YYYY-MM-DD）" v-model="dateForm.date" :maxlength="10" />
            <ToggleRow label="每年记得这一天" v-model="dateForm.repeat" />
            <FormField
              label="一句备注"
              v-model="dateForm.note"
              placeholder="想怎样一起度过这一天？"
              :maxlength="300"
            />
            <AppButton :disabled="busy" @click="saveDate">保存重要日期</AppButton>
            <AppButton variant="ghost" @click="dateOpen = false">取消编辑</AppButton>
          </view>
          <view v-for="item in dates" :key="item.id" class="card date-card">
            <view class="row between">
              <view class="date-title">{{ item.title }}</view>
              <AppIcon name="calendar" />
            </view>
            <text class="muted">
              {{ nextDate(item) }} · {{ item.repeat ? '每年重复' : '单次日期' }}
            </text>
            <view class="countdown">
              {{
                remainingDays(item) === 0
                  ? '就是今天'
                  : remainingDays(item) > 0
                    ? `还有 ${remainingDays(item)} 天`
                    : '已经过去'
              }}
            </view>
            <text>{{ item.note }}</text>
            <view class="row">
              <button role="button" tabindex="0" class="text-action" @click="editDate(item)">
                编辑
              </button>
              <button role="button" tabindex="0" class="text-action" @click="removeDate(item.id)">
                删除
              </button>
            </view>
          </view>
          <EmptyState
            v-if="!dates.length"
            title="把重要日子记在这里"
            description="生日、团聚、纪念日，都是一起期待的日子。"
            action="添加一个日期"
            @action="editDate()"
          />
          <text class="prototype-note">日期记录与提醒偏好保存在本地；原型尚未发送系统通知。</text>
        </template>
        <template v-else>
          <template v-if="routeId === 'interaction'">
            <view>
              <text class="eyebrow">看看家人的留言</text>
              <view class="page-title">把心意，留在家里</view>
              <text class="muted">一张照片，一句话，都让彼此更靠近。</text>
            </view>
            <view class="quick-grid">
              <AppButton variant="secondary" @click="go('messageAdd')">留一句问候</AppButton>
              <AppButton variant="secondary" @click="go('messageAdd', { kind: 'photo' })">
                分享一张照片
              </AppButton>
            </view>
            <view class="card">
              <button role="button" tabindex="0" class="list-button" @click="go('dates')">
                <AppIcon name="calendar" />
                <text class="list-label">生日与重要日期</text>
                <AppIcon name="chevron" :size="18" />
              </button>
              <button role="button" tabindex="0" class="list-button" @click="go('stories')">
                <AppIcon name="book" />
                <text class="list-label">一起看看家庭故事</text>
                <AppIcon name="chevron" :size="18" />
              </button>
            </view>
            <view v-if="db.preferences.importantDateReminders && dates[0]" class="card green">
              <text class="muted">下一个值得期待的日子</text>
              <view class="date-title">{{ dates[0].title }}</view>
              <text>{{ nextDate(dates[0]) }}</text>
            </view>
            <SectionTitle title="家里最近的问候" />
          </template>
          <template v-else>
            <view class="page-title">家人的话，慢慢听</view>
            <text class="muted">这里留着每一份熟悉的牵挂。</text>
          </template>
          <view v-for="message in db.messages" :key="message.id" class="card stack">
            <view class="row">
              <FamilyAvatar :src="message.avatar" :size="48" class="message-avatar" />
              <view class="grow">
                <view>{{ message.relation }} {{ message.name }}</view>
                <text class="muted">
                  {{
                    message.createdAt
                      ? new Date(message.createdAt).toLocaleString('zh-CN')
                      : message.time
                  }}
                </text>
              </view>
              <text class="read-label">{{ message.read ? '已读' : '新问候' }}</text>
            </view>
            <view class="message-content">{{ message.text }}</view>
            <MediaPlayer
              v-if="message.mediaId && db.media.some((m) => m.id === message.mediaId)"
              :media="db.media.find((m) => m.id === message.mediaId)!"
            />
          </view>
          <EmptyState
            v-if="!db.messages.length"
            title="家里还没有新留言"
            description="请家属留下一句问候，长辈打开就能看见。"
          />
          <AppButton
            v-if="routeId === 'messages' && !isFamily"
            variant="secondary"
            @click="go('health')"
          >
            记录今天与家人的交流
          </AppButton>
        </template>
      </template>
    </view>
    <EmptyState v-else title="正在准备家人的消息…" />
  </AppLayout>
</template>
<style scoped>
.quick-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.attachments {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}
.attachment {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  text-align: left;
  padding: 12px;
  border: 1px solid #dbe3d4;
  border-radius: 14px;
  font-size: calc(17px * var(--font-scale, 1));
}
.attachment.selected {
  background: var(--mm-green);
  border-color: #66845c;
}
.date-title {
  font-size: calc(22px * var(--font-scale, 1));
  font-weight: 600;
  margin: 8px 0;
}
.countdown {
  margin: 16px 0;
  color: var(--mm-brand);
  font-size: calc(23px * var(--font-scale, 1));
  font-weight: 600;
}
.date-card {
  line-height: 1.8;
}
.message-avatar {
  width: 49px;
  height: 49px;
  border-radius: 50%;
}
.grow {
  flex: 1;
  min-width: 0;
}
.grow .muted {
  font-size: calc(16px * var(--font-scale, 1));
}
.read-label {
  font-size: calc(16px * var(--font-scale, 1));
  color: var(--mm-muted);
}
.message-content {
  font-size: calc(19px * var(--font-scale, 1));
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
