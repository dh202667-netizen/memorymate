<script setup lang="ts">
import FamilyAvatar from '@/components/FamilyAvatar.vue'
import { reactive, ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import FormField from '@/components/FormField.vue'
import EmptyState from '@/components/EmptyState.vue'
import MediaPlayer from '@/components/MediaPlayer.vue'
import { usePageData } from '@/composables/usePageData'
import { getRoute } from '@/config/routes'
import { perform } from '@/utils/actions'
import { back, go } from '@/utils/navigation'
import { chooseMedia } from '@/utils/media'
import { todayKey } from '@/utils/date'
import type { MemoryMedia } from '@/types'
const props = defineProps<{ routeId: string }>()
const { family, db, catalog, params } = usePageData()
const busy = ref(false)
const missing = ref(false)
const person = reactive({
  id: '',
  name: '',
  relation: '',
  intro: '',
  avatar: '/static/images/son.svg',
})
const story = reactive({
  id: '',
  title: '',
  date: todayKey(),
  description: '',
  content: '',
  personIds: [] as string[],
  cover: '',
})
const media = reactive<MemoryMedia>({
  id: '',
  title: '',
  type: 'photo',
  src: '',
  date: todayKey(),
  personIds: [],
  local: true,
})
const title = computed(() => getRoute(props.routeId).title)
onLoad(async () => {
  await family.load()
  const id = params.value.id
  if (id && props.routeId === 'personEdit') {
    const p = db.value?.people.find((p) => p.id === id)
    if (p) Object.assign(person, p)
    else missing.value = true
  }
  if (id && props.routeId === 'storyEdit') {
    const s = db.value?.stories.find((s) => s.id === id)
    if (s) Object.assign(story, JSON.parse(JSON.stringify(s)))
    else missing.value = true
  }
})
function toggle(list: string[], id: string) {
  const index = list.indexOf(id)
  if (index < 0) list.push(id)
  else list.splice(index, 1)
}
async function selectFile(type: 'photo' | 'video') {
  if (busy.value) return
  busy.value = true
  const src = await chooseMedia(type)
  busy.value = false
  if (src) {
    media.type = type
    media.src = src
    media.transcript = undefined
    media.title = type === 'photo' ? '新的家庭照片' : '新的家庭视频'
  }
}
function demoPhoto() {
  Object.assign(media, {
    type: 'photo',
    src: '/static/images/family-photo.png',
    title: '一起珍藏的家庭合影',
    transcript: undefined,
    local: false,
  })
}
function demoAudio(index: number) {
  const n = catalog.value?.narrations[index]
  if (n)
    Object.assign(media, {
      type: 'audio',
      src: n.src,
      title: n.title,
      transcript: n.text,
      local: false,
    })
}
async function save() {
  if (busy.value) return
  busy.value = true
  const ok = await perform(async () => {
    if (props.routeId === 'personEdit') await family.savePerson(person)
    else if (props.routeId === 'storyEdit') await family.saveStory(story)
    else {
      if (!media.src) throw new Error('请先选择一份照片、语音或视频')
      await family.saveMedia(media)
    }
  }, '已保存在这个家庭中')
  busy.value = false
  if (ok) back()
}
</script>
<template>
  <AppLayout :title="title">
    <view v-if="db && !missing && db.preferences.familyBound" class="stack">
      <view>
        <view class="page-title">
          {{
            routeId === 'personEdit'
              ? '让熟悉的面孔，更亲近'
              : routeId === 'storyEdit'
                ? '把我们的故事写下来'
                : '照片与声音，都是陪伴'
          }}
        </view>
        <text class="muted">保存在这台设备上，长辈与家属可以共同查看。</text>
      </view>
      <view v-if="!db.preferences.allowFamilyEdit || !db.preferences.familyBound" class="card">
        家属编辑当前已暂停，请由长辈在隐私与授权中恢复。
      </view>
      <template v-if="routeId === 'personEdit'">
        <view class="card">
          <text>选择人物头像</text>
          <view class="avatar-options">
            <button
              v-for="src in catalog?.avatars"
              :key="src"
              role="button"
              tabindex="0"
              :aria-label="
                '选择示例头像：' +
                ({
                  '/static/images/grandma.svg': '奶奶',
                  '/static/images/grandpa.svg': '爷爷',
                  '/static/images/son.svg': '儿子',
                  '/static/images/girl.svg': '孙女',
                }[src] ?? '家人')
              "
              :aria-pressed="person.avatar === src"
              :class="['avatar-option', { selected: person.avatar === src }]"
              @click="person.avatar = src"
            >
              <FamilyAvatar :src="src" :size="56" />
            </button>
          </view>
        </view>
        <FormField label="姓名" v-model="person.name" placeholder="例如：王建国" :maxlength="30" />
        <FormField
          label="与长辈的关系"
          v-model="person.relation"
          placeholder="例如：老伴、儿子、孙女"
          :maxlength="20"
        />
        <FormField
          label="人物介绍"
          v-model="person.intro"
          placeholder="写下爱好、习惯或熟悉的小事"
          multiline
          :maxlength="600"
        />
      </template>
      <template v-else-if="routeId === 'storyEdit'">
        <FormField
          label="故事标题"
          v-model="story.title"
          placeholder="给回忆起个名字"
          :maxlength="60"
        />
        <FormField
          label="故事日期（YYYY-MM-DD）"
          v-model="story.date"
          placeholder="2026-11-16"
          :maxlength="10"
        />
        <FormField
          label="一句话简介"
          v-model="story.description"
          placeholder="这段回忆最动人的一句话"
          :maxlength="180"
        />
        <FormField
          label="故事内容"
          v-model="story.content"
          placeholder="发生了什么，当时有哪些熟悉的人？"
          multiline
          :maxlength="4000"
        />
        <view class="card">
          <view>故事里的家人（可多选）</view>
          <view class="chips">
            <button
              v-for="p in db.people"
              :key="p.id"
              role="button"
              tabindex="0"
              :class="['chip', { selected: story.personIds.includes(p.id) }]"
              :aria-pressed="story.personIds.includes(p.id)"
              @click="toggle(story.personIds, p.id)"
            >
              {{ p.relation }} {{ p.name }}
            </button>
          </view>
          <text v-if="!db.people.length" class="muted">可以先保存故事，添加家人后再关联。</text>
        </view>
        <text class="muted">保存后可在“添加照片与声音”中关联图片，更新故事封面。</text>
      </template>
      <template v-else>
        <view class="picker-actions">
          <AppButton variant="secondary" @click="selectFile('photo')">选择本地照片</AppButton>
          <AppButton variant="secondary" @click="selectFile('video')">选择本地视频</AppButton>
        </view>
        <view class="card stack">
          <view>先体验一份家庭回忆</view>
          <AppButton variant="ghost" @click="demoPhoto">使用示例家庭照片</AppButton>
          <AppButton
            v-for="(n, index) in catalog?.narrations.slice(0, 2)"
            :key="n.id"
            variant="ghost"
            @click="demoAudio(index)"
          >
            使用示例语音：{{ n.title }}
          </AppButton>
          <text class="muted">
            示例语音为本地合成音，不是真实家人录音。照片和视频仅保存到设备，不上传。
          </text>
        </view>
        <view v-if="media.src" class="card"><MediaPlayer :media="media" /></view>
        <FormField
          label="回忆名称"
          v-model="media.title"
          placeholder="给照片或声音写个名字"
          :maxlength="60"
        />
        <view class="card">
          <view>关联家人（可多选）</view>
          <view class="chips">
            <button
              v-for="p in db.people"
              :key="p.id"
              role="button"
              tabindex="0"
              :class="['chip', { selected: media.personIds.includes(p.id) }]"
              @click="toggle(media.personIds, p.id)"
            >
              {{ p.name }}
            </button>
          </view>
        </view>
        <view class="card">
          <view>关联故事（可不选）</view>
          <view class="chips">
            <button
              role="button"
              tabindex="0"
              :class="['chip', { selected: !media.storyId }]"
              @click="media.storyId = undefined"
            >
              暂不关联
            </button>
            <button
              v-for="s in db.stories"
              :key="s.id"
              role="button"
              tabindex="0"
              :class="['chip', { selected: media.storyId === s.id }]"
              @click="media.storyId = s.id"
            >
              {{ s.title }}
            </button>
          </view>
        </view>
      </template>
      <AppButton
        :disabled="busy || !db.preferences.allowFamilyEdit || !db.preferences.familyBound"
        @click="save"
      >
        {{ busy ? '正在保存…' : '保存到家庭' }}
      </AppButton>
      <AppButton variant="ghost" :disabled="busy" @click="back">取消，返回上一页</AppButton>
    </view>
    <EmptyState
      v-else-if="db && !db.preferences.familyBound"
      title="家庭绑定已暂停"
      description="请先确认长辈的演示邀请。"
      action="查看家庭绑定"
      @action="go('binding')"
    />
    <EmptyState
      v-else-if="missing"
      title="这条资料已经不存在"
      description="请返回列表重新选择，不会创建重复记录。"
      action="返回"
      @action="back"
    />
    <EmptyState v-else title="正在准备编辑资料…" />
  </AppLayout>
</template>
<style scoped>
.avatar-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
}
.avatar-option {
  border: 2px solid transparent;
  padding: 3px;
  border-radius: 50%;
  min-width: 58px;
  min-height: 58px;
}
.avatar-option image {
  width: 56px;
  height: 56px;
}
.avatar-option.selected {
  border-color: var(--mm-brand);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 14px;
}
.chip {
  border: 1px solid #dce4d6;
  padding: 10px 14px;
  border-radius: 8px;
  min-height: 48px;
  text-align: left;
  font-size: calc(16px * var(--font-scale, 1));
}
.chip.selected {
  background: var(--mm-green);
  border-color: #6b875c;
  color: var(--mm-brand);
}
.picker-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
