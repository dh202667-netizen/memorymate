<script setup lang="ts">
import { releaseVersion } from '@/config/release'
import FamilyAvatar from '@/components/FamilyAvatar.vue'
import { reactive, ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/FormField.vue'
import ToggleRow from '@/components/ToggleRow.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import EmptyState from '@/components/EmptyState.vue'
import { usePageData } from '@/composables/usePageData'
import { getRoute } from '@/config/routes'
import { go, back } from '@/utils/navigation'
import { perform, confirmAction } from '@/utils/actions'
import { useSessionStore } from '@/stores/session'
import type { Preferences } from '@/types'
const props = defineProps<{ routeId: string }>()
const { family, db, isFamily } = usePageData()
const session = useSessionStore()
const route = computed(() => getRoute(props.routeId))
const busy = ref(false)
const invite = ref('')
const accepted = ref(false)
const form = reactive({ name: '', nickname: '', age: '', familyName: '' })
onLoad(async () => {
  await family.load()
  if (db.value && props.routeId !== 'register') {
    const p = isFamily.value ? db.value.familyUser : db.value.elder
    form.name = p.name
    form.nickname = db.value.elder.nickname
    form.age = String(db.value.elder.age)
    form.familyName = db.value.familyName
  }
})
async function save() {
  if (busy.value) return
  busy.value = true
  const ok = await perform(
    () =>
      props.routeId === 'register'
        ? family.register(form.name, form.familyName)
        : family.saveProfile({ ...form, age: Number(form.age) }),
    props.routeId === 'register' ? '本地演示家庭已创建' : '个人资料已保存',
  )
  busy.value = false
  if (ok) {
    if (props.routeId === 'register') go('role')
    else back()
  }
}
async function preference(key: keyof Preferences, value: boolean) {
  await perform(() => family.setPreference(key, value), '偏好已保存在这台设备上')
}
async function bind() {
  if (!db.value) return
  if (invite.value.trim() !== db.value.inviteCode) {
    await perform(async () => {
      throw new Error('演示邀请码不匹配，请向长辈确认这6位数字')
    })
    return
  }
  if (!accepted.value) {
    await perform(async () => {
      throw new Error('请先确认本地演示绑定说明')
    })
    return
  }
  await preference('familyBound', true)
}
async function unbind() {
  if (
    await confirmAction(
      '暂停家庭绑定？',
      '家属入口将暂停查看与编辑。家里的回忆仍保留，之后可用演示邀请恢复绑定。',
    )
  )
    await preference('familyBound', false)
}
async function reset() {
  if (
    busy.value ||
    !(await confirmAction(
      '恢复初始示例家庭？',
      '您在这台设备上新增的人物、故事、附件、活动和聊天将被清除，恢复示例资料。原始相册文件不会删除。',
    ))
  )
    return
  busy.value = true
  await perform(() => family.reset(), '已恢复初始示例家庭')
  busy.value = false
}
function logout() {
  session.logout()
  go('login')
}
function copyInvite() {
  if (!db.value) return
  uni.setClipboardData({
    data: db.value.inviteCode,
    success: () => {},
    fail: () =>
      perform(async () => {
        throw new Error('暂时没能复制，请手动记下邀请码')
      }),
  })
}
</script>
<template>
  <AppLayout :title="route.title">
    <view v-if="db" class="stack">
      <template v-if="routeId === 'profile' || routeId === 'register'">
        <view>
          <view class="page-title">
            {{ routeId === 'register' ? '注册您的体验家庭' : '关于您，多了解一点' }}
          </view>
          <text class="muted">
            {{
              routeId === 'register'
                ? '填写长辈称呼和家庭名称，下一步选择使用身份。资料只保存在当前设备。'
                : '资料保存在本地，随时可以修改。'
            }}
          </text>
        </view>
        <FormField
          :label="routeId === 'register' ? '长辈姓名' : '姓名'"
          v-model="form.name"
          placeholder="您希望怎样称呼？"
          :maxlength="30"
        />
        <template v-if="!isFamily && routeId !== 'register'">
          <FormField
            label="亲切的称呼"
            v-model="form.nickname"
            placeholder="例如：张阿姨"
            :maxlength="30"
          />
          <FormField label="年龄" v-model="form.age" type="number" :maxlength="3" />
        </template>
        <FormField
          label="家庭名称"
          v-model="form.familyName"
          placeholder="例如：我们的小家"
          :maxlength="40"
        />
        <AppButton :disabled="busy" @click="save">
          {{
            busy ? '正在保存…' : routeId === 'register' ? '创建本地家庭，选择身份' : '保存个人资料'
          }}
        </AppButton>
        <AppButton variant="ghost" @click="back">返回</AppButton>
        <text v-if="routeId === 'register'" class="prototype-note">
          将沿用示例人物与回忆帮助体验，不创建真实账号。
        </text>
      </template>
      <template v-else-if="routeId === 'binding'">
        <view class="page-title">一个家，彼此相伴</view>
        <view class="card">
          <view>{{ db.familyName }}</view>
          <text class="muted">
            {{ db.preferences.familyBound ? '演示家庭已绑定' : '演示家庭绑定已暂停' }}
          </text>
          <view class="family-row" v-for="p in db.people" :key="p.id">
            <FamilyAvatar :src="p.avatar" :size="64" />
            <view>{{ p.relation }} {{ p.name }}</view>
          </view>
        </view>
        <view v-if="!isFamily" class="card stack">
          <view>给家属的演示邀请码</view>
          <text class="invite-code">{{ db.inviteCode }}</text>
          <text class="muted">这6位数字只在同一设备中演示邀请流程，不能连接另一台手机。</text>
          <AppButton variant="secondary" @click="copyInvite">复制演示邀请码</AppButton>
          <AppButton
            variant="ghost"
            @click="perform(() => family.createInvite(), '新的演示邀请码已生成')"
          >
            生成新的邀请码
          </AppButton>
        </view>
        <view v-else class="card stack">
          <FormField
            label="长辈提供的演示邀请码"
            v-model="invite"
            placeholder="填写6位数字"
            :maxlength="6"
          />
          <ToggleRow
            label="我了解这是同一设备的演示绑定"
            description="真实家庭邀请与身份认证将在后续实现。"
            v-model="accepted"
          />
          <AppButton @click="bind">确认演示绑定</AppButton>
        </view>
        <AppButton v-if="db.preferences.familyBound" variant="ghost" @click="unbind">
          暂停这个演示家庭的绑定
        </AppButton>
        <AppButton
          v-else-if="!isFamily"
          variant="secondary"
          @click="preference('familyBound', true)"
        >
          恢复演示家庭绑定
        </AppButton>
      </template>
      <template v-else-if="routeId === 'notifications'">
        <view class="page-title">按习惯接收牵挂</view>
        <view class="card">
          <ToggleRow
            label="家庭新消息提示"
            description="控制首页的新消息提示；消息本身仍可查看。"
            :model-value="db.preferences.familyMessages"
            @update:model-value="preference('familyMessages', $event)"
          />
          <ToggleRow
            label="今日任务提示"
            description="控制首页任务提醒文字，任务页始终保留。"
            :model-value="db.preferences.taskReminders"
            @update:model-value="preference('taskReminders', $event)"
          />
          <ToggleRow
            label="重要日期提醒"
            description="控制家庭首页与互动页的近期日期卡。"
            :model-value="db.preferences.importantDateReminders"
            @update:model-value="preference('importantDateReminders', $event)"
          />
        </view>
        <view class="card muted">当前只保存应用内提示偏好，没有申请系统推送或闹钟权限。</view>
      </template>
      <template v-else-if="routeId === 'privacy'">
        <view class="row">
          <view class="icon-tile green"><AppIcon name="shield" :size="28" /></view>
          <view class="page-title">陪伴，也尊重边界</view>
        </view>
        <view class="card">
          <SectionTitle title="由长辈决定的分享" />
          <ToggleRow
            label="向家属分享日常活动"
            description="关闭后，家属首页与健康观察不展示活动详情。"
            :disabled="session.state.mode !== 'elder'"
            :model-value="db.preferences.shareActivity"
            @update:model-value="preference('shareActivity', $event)"
          />
          <ToggleRow
            label="允许家属编辑家庭记忆"
            description="关闭后，家属不能新增、修改或删除人物、故事和附件。"
            :disabled="session.state.mode !== 'elder'"
            :model-value="db.preferences.allowFamilyEdit"
            @update:model-value="preference('allowFamilyEdit', $event)"
          />
          <text v-if="isFamily" class="muted">这两项由长辈模式确认，家属在这里查看当前设置。</text>
        </view>
        <view class="card">
          <SectionTitle title="资料保存在这里" />
          <text class="muted">
            家庭资料、活动记录、聊天与选择的媒体保存在当前设备。不连接真实账号、数据库或大模型，不会上传家庭文件。语音输入使用模拟状态，不访问麦克风。
          </text>
        </view>
        <view class="card">
          <SectionTitle title="管理和清理" />
          <AppButton variant="secondary" @click="go('binding')">查看家庭绑定</AppButton>
          <button role="button" tabindex="0" class="text-action" @click="reset">
            恢复初始示例家庭
          </button>
          <text class="muted">
            演示授权仅影响这台设备中的界面与本地操作，不构成真实账号的权限认证。
          </text>
        </view>
        <view class="card">
          <SectionTitle title="健康支持的边界" />
          <text class="muted">
            忆伴用于日常认知活动与家庭陪伴，不保证预防、治疗或逆转阿尔茨海默病，不生成疾病诊断或未经验证的医疗风险分。
          </text>
        </view>
      </template>
      <template v-else-if="routeId === 'settings'">
        <view class="page-title">忆伴 MemoryMate</view>
        <view class="card">
          <view>版本 {{ releaseVersion }} · 演示版</view>
          <text class="muted">所有主要页面使用统一的本地数据，可离线体验。没有接入云端服务。</text>
        </view>
        <AppButton variant="secondary" @click="go('accessibility')">调整字体与语音</AppButton>
        <AppButton variant="secondary" @click="go('role')">切换使用模式</AppButton>
        <AppButton variant="ghost" :disabled="busy" @click="reset">恢复初始示例家庭</AppButton>
        <AppButton variant="ghost" @click="logout">退出演示，返回登录</AppButton>
        <text class="prototype-note">退出会清除所选身份，家庭资料与阅读偏好继续保存在设备上。</text>
      </template>
    </view>
    <EmptyState v-else title="正在准备您的设置…" />
  </AppLayout>
</template>
<style scoped>
.family-row {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-top: 18px;
  font-size: calc(18px * var(--font-scale, 1));
}
.family-row image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.invite-code {
  font-size: calc(30px * var(--font-scale, 1));
  letter-spacing: 3px;
  font-weight: 600;
  color: var(--mm-brand);
  text-align: center;
}
</style>
