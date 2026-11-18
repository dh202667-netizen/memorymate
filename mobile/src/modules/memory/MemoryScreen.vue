<script setup lang="ts">
import FamilyAvatar from '@/components/FamilyAvatar.vue'
import { storyPhoto, isDemoPhoto } from '@/utils/presentation'
import { computed, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AppButton from '@/components/AppButton.vue'
import AppIcon from '@/components/AppIcon.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import MemberCard from '@/components/MemberCard.vue'
import StoryCard from '@/components/StoryCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import MediaPlayer from '@/components/MediaPlayer.vue'
import FormField from '@/components/FormField.vue'
import { usePageData } from '@/composables/usePageData'
import { go } from '@/utils/navigation'
import { getRoute } from '@/config/routes'
import { perform, confirmAction } from '@/utils/actions'
const props = defineProps<{ routeId: string }>()
const { family, db, params, isFamily } = usePageData()
const query = ref('')
const filter = ref('all')
const route = computed(() => getRoute(props.routeId))
const person = computed(() => db.value?.people.find((p) => p.id === params.value.id))
const story = computed(() => db.value?.stories.find((s) => s.id === params.value.id))
const people = computed(
  () => db.value?.people.filter((p) => (p.name + p.relation).includes(query.value.trim())) ?? [],
)
const stories = computed(
  () =>
    db.value?.stories.filter(
      (s) =>
        (!params.value.personId || s.personIds.includes(params.value.personId)) &&
        (s.title + (s.content ?? '')).includes(query.value.trim()),
    ) ?? [],
)
const media = computed(
  () =>
    db.value?.media.filter(
      (m) =>
        (filter.value === 'all' || m.type === filter.value) &&
        (!params.value.personId || m.personIds.includes(params.value.personId)) &&
        (!params.value.storyId || m.storyId === params.value.storyId),
    ) ?? [],
)
const relatedStories = computed(
  () => db.value?.stories.filter((s) => s.personIds.includes(person.value?.id ?? '')) ?? [],
)
const relatedMedia = computed(
  () =>
    db.value?.media.filter((m) =>
      props.routeId === 'person'
        ? m.personIds.includes(person.value?.id ?? '')
        : m.storyId === story.value?.id,
    ) ?? [],
)
const timeline = computed(() =>
  [...(db.value?.stories ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
)
const links = ['people', 'stories', 'album', 'relations', 'timeline'].map(getRoute)
async function remove(kind: 'person' | 'story' | 'media', id: string) {
  if (
    !(await confirmAction(
      '确认删除？',
      kind === 'person'
        ? '将移除人物及其故事关联，故事和照片仍保留。'
        : '只移除这条本地记录，可以通过重新添加恢复内容。',
    ))
  )
    return
  const ok = await perform(
    () =>
      kind === 'person'
        ? family.deletePerson(id)
        : kind === 'story'
          ? family.deleteStory(id)
          : family.deleteMedia(id),
    '已删除',
  )
  if (ok && kind !== 'media') go(kind === 'person' ? 'people' : 'stories')
}
</script>
<template>
  <AppLayout :title="route.title" :tab="route.tab ? route.id : undefined">
    <view v-if="db" class="stack">
      <EmptyState
        v-if="isFamily && !db.preferences.familyBound"
        title="家庭绑定已暂停"
        description="请向长辈确认演示邀请后恢复查看。"
        action="查看家庭绑定"
        @action="go('binding')"
      />
      <template v-else>
        <template v-if="routeId === 'memory'">
          <view>
            <text class="eyebrow">看看家人，重温回忆</text>
            <view class="page-title">点开照片，看看我的家人</view>
            <text class="muted">{{ db.familyName }} · 把美好留在身边</text>
          </view>
          <view>
            <SectionTitle title="我最亲近的人" action="全部家人" @action="go('people')" />
            <view class="members">
              <MemberCard v-for="p in db.people.slice(0, 4)" :key="p.id" :person="p" />
            </view>
            <EmptyState
              v-if="!db.people.length"
              title="家人的故事从这里开始"
              description="请家属为您添加一位熟悉的家人。"
            />
          </view>
          <view>
            <SectionTitle title="今天，重温一个故事" action="全部故事" @action="go('stories')" />
            <StoryCard v-if="db.stories[0]" :story="db.stories[0]" />
            <EmptyState v-else title="还没有家庭故事" />
          </view>
          <view class="shortcut-grid">
            <button
              v-for="link in links.slice(2)"
              :key="link.id"
              role="button"
              tabindex="0"
              class="card shortcut"
              @click="go(link.id)"
            >
              <AppIcon :name="link.icon!" />
              <text>{{ link.title }}</text>
            </button>
          </view>
        </template>
        <template v-else-if="routeId === 'people'">
          <SectionTitle
            title="我的家人"
            :caption="`共 ${db.people.length} 位熟悉的家人`"
            :action="isFamily ? '添加家人' : undefined"
            @action="go('personEdit')"
          />
          <FormField label="找一位家人" v-model="query" placeholder="输入姓名或亲属关系" />
          <view class="members"><MemberCard v-for="p in people" :key="p.id" :person="p" /></view>
          <EmptyState
            v-if="!people.length"
            title="没有找到这位家人"
            description="换个名字试试，或请家属补充人物资料。"
          />
        </template>
        <template v-else-if="routeId === 'person'">
          <template v-if="person">
            <view class="card person-overview">
              <button
                role="button"
                tabindex="0"
                aria-label="查看这位家人的相册"
                @click="go('album', { personId: person.id })"
              >
                <FamilyAvatar :src="person.avatar" :size="100" class="portrait" />
              </button>
              <view class="page-title">{{ person.name }}</view>
              <view class="relation-label">我的{{ person.relation }}</view>
              <text>{{ person.intro || '关于这位家人的故事，等着我们一起补充。' }}</text>
            </view>
            <view v-if="isFamily" class="row">
              <AppButton variant="secondary" @click="go('personEdit', { id: person.id })">
                编辑人物资料
              </AppButton>
              <button
                role="button"
                tabindex="0"
                class="text-action"
                @click="remove('person', person.id)"
              >
                删除
              </button>
            </view>
            <view>
              <SectionTitle
                title="和家人的回忆"
                action="查看照片"
                @action="go('album', { personId: person.id })"
              />
              <view class="stack">
                <StoryCard v-for="s in relatedStories" :key="s.id" :story="s" />
                <EmptyState
                  v-if="!relatedStories.length"
                  title="一起留下新的回忆"
                  description="暂时没有关联故事，家属可以在写故事时选择这位家人。"
                />
              </view>
            </view>
            <view
              v-for="m in relatedMedia.filter((m) => m.type !== 'photo')"
              :key="m.id"
              class="card"
            >
              <MediaPlayer :media="m" />
            </view>
          </template>
          <EmptyState
            v-else
            title="没有找到这位家人"
            description="人物可能已经移除，请回到家人列表查看。"
            action="查看家人"
            @action="go('people')"
          />
        </template>
        <template v-else-if="routeId === 'stories'">
          <SectionTitle
            title="我们一起走过的日子"
            :action="isFamily ? '写故事' : undefined"
            @action="go('storyEdit')"
          />
          <FormField v-model="query" label="找一个故事" placeholder="输入故事标题或关键词" />
          <StoryCard v-for="s in stories" :key="s.id" :story="s" />
          <EmptyState
            v-if="!stories.length"
            title="暂时没有这个故事"
            description="试试其他关键词，或写下一个新的家庭回忆。"
          />
        </template>
        <template v-else-if="routeId === 'story'">
          <template v-if="story">
            <image
              v-if="story.cover"
              :src="storyPhoto(story.cover, story.id)"
              mode="aspectFill"
              class="story-cover"
            />
            <view v-else class="card row">
              <AppIcon name="photo" />
              <text>这个故事的照片还没有添加。</text>
            </view>
            <text v-if="isDemoPhoto(story.cover)" class="photo-caption">AI 示例照片</text>
            <view>
              <text class="eyebrow">读一读家庭故事</text>
              <view class="page-title">{{ story.title }}</view>
              <text class="muted">{{ story.date }}</text>
            </view>
            <view class="card story-content">{{ story.content || story.description }}</view>
            <view>
              <SectionTitle title="故事里的家人" />
              <view class="members">
                <MemberCard
                  v-for="p in db.people.filter((p) => story!.personIds.includes(p.id))"
                  :key="p.id"
                  :person="p"
                />
              </view>
              <text v-if="!story.personIds.length" class="muted">这段回忆暂时还没有关联人物。</text>
            </view>
            <view v-for="m in relatedMedia" :key="m.id" class="card">
              <MediaPlayer :media="m" />
            </view>
            <AppButton
              variant="secondary"
              @click="go('companion', { storyId: story.id })"
              v-if="!isFamily"
            >
              和忆伴聊聊这个故事
            </AppButton>
            <view v-if="isFamily" class="row">
              <AppButton variant="secondary" @click="go('storyEdit', { id: story.id })">
                编辑故事
              </AppButton>
              <button
                role="button"
                tabindex="0"
                class="text-action"
                @click="remove('story', story.id)"
              >
                删除
              </button>
            </view>
          </template>
          <EmptyState
            v-else
            title="故事暂时没有找到"
            action="回到故事列表"
            @action="go('stories')"
          />
        </template>
        <template v-else-if="routeId === 'album'">
          <SectionTitle
            title="家庭相册与声音"
            :action="isFamily ? '添加回忆' : undefined"
            @action="go('mediaAdd')"
          />
          <view class="chips">
            <button
              v-for="item in [
                { id: 'all', label: '全部' },
                { id: 'photo', label: '照片' },
                { id: 'audio', label: '语音' },
                { id: 'video', label: '视频' },
              ]"
              :key="item.id"
              role="button"
              tabindex="0"
              :class="['chip', { active: filter === item.id }]"
              @click="filter = item.id"
            >
              {{ item.label }}
            </button>
          </view>
          <view v-for="m in media" :key="m.id" class="card stack">
            <MediaPlayer :media="m" />
            <view class="row between">
              <view>
                <view>{{ m.title }}</view>
                <text class="muted">
                  {{ m.date }} · {{ m.local ? '设备上的回忆' : '示例回忆' }}
                </text>
              </view>
              <button
                v-if="isFamily"
                role="button"
                tabindex="0"
                class="text-action"
                @click="remove('media', m.id)"
              >
                移除
              </button>
            </view>
          </view>
          <EmptyState
            v-if="!media.length"
            title="这里还没有回忆"
            description="家属添加照片、语音或视频后，会出现在这里。"
          />
        </template>
        <template v-else-if="routeId === 'relations'">
          <view>
            <view class="page-title">我们是一家人</view>
            <text class="muted">以{{ db.elder.name }}为中心，看看熟悉的家人。</text>
          </view>
          <view class="card relation-center">
            <FamilyAvatar :src="db.elder.avatar" :size="100" class="portrait" />
            <view>{{ db.elder.name }}</view>
            <text class="muted">我们的家</text>
          </view>
          <button
            v-for="p in db.people"
            :key="p.id"
            role="button"
            tabindex="0"
            class="card relation-row row"
            @click="go('person', { id: p.id })"
          >
            <FamilyAvatar :src="p.avatar" :size="58" class="small-avatar" />
            <view class="grow">
              <text class="muted">{{ db.elder.name }}的{{ p.relation }}</text>
              <view>{{ p.name }}</view>
            </view>
            <AppIcon name="chevron" />
          </button>
          <EmptyState v-if="!db.people.length" title="请家属添加家庭人物" />
          <AppButton v-if="isFamily" variant="secondary" @click="go('people')">
            管理人物与亲属关系
          </AppButton>
        </template>
        <template v-else-if="routeId === 'timeline'">
          <view>
            <view class="page-title">日子，在回忆里发光</view>
            <text class="muted">按故事发生时间排列，点击可以重温。</text>
          </view>
          <button
            v-for="s in timeline"
            :key="s.id"
            role="button"
            tabindex="0"
            class="card timeline-card"
            @click="go('story', { id: s.id })"
          >
            <text class="eyebrow">{{ s.date }}</text>
            <view class="timeline-title">{{ s.title }}</view>
            <text class="muted">{{ s.description }}</text>
          </button>
          <EmptyState v-if="!timeline.length" title="时间轴等待第一个故事" />
          <AppButton v-if="isFamily" variant="secondary" @click="go('storyEdit')">
            留下一段新回忆
          </AppButton>
        </template>
        <template v-else-if="routeId === 'manageMemory'">
          <view>
            <view class="page-title">为家人，留住熟悉</view>
            <text class="muted">
              {{ db.people.length }} 位家人 · {{ db.stories.length }} 个故事 ·
              {{ db.media.length }} 份回忆
            </text>
          </view>
          <view v-if="!db.preferences.allowFamilyEdit || !db.preferences.familyBound" class="card">
            家属编辑已暂停。您仍可查看已有回忆；恢复绑定与授权后可继续添加。
          </view>
          <view class="shortcut-grid">
            <button
              v-for="link in ['personEdit', 'storyEdit', 'mediaAdd'].map(getRoute)"
              :key="link.id"
              role="button"
              tabindex="0"
              class="card shortcut"
              @click="go(link.id)"
            >
              <AppIcon :name="link.icon!" />
              <text>{{ link.title }}</text>
            </button>
          </view>
          <view class="card">
            <button
              v-for="link in links"
              :key="link.id"
              role="button"
              tabindex="0"
              class="list-button"
              @click="go(link.id)"
            >
              <AppIcon :name="link.icon!" />
              <text class="list-label">{{ link.title }}</text>
              <AppIcon name="chevron" :size="18" />
            </button>
          </view>
          <SectionTitle title="最近的家庭故事" />
          <StoryCard v-for="s in db.stories.slice(0, 3)" :key="s.id" :story="s" />
          <EmptyState
            v-if="!db.stories.length"
            title="一起写下第一个故事"
            action="写家庭故事"
            @action="go('storyEdit')"
          />
        </template>
      </template>
    </view>
    <EmptyState
      v-else
      :title="family.state.error || '正在准备家庭回忆…'"
      :action="family.state.error ? '重新加载' : undefined"
      @action="family.load(true)"
    />
  </AppLayout>
</template>
<style scoped>
.members {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.shortcut {
  display: flex;
  flex-direction: column;
  gap: 13px;
  text-align: left;
  min-height: 120px;
  font-size: calc(18px * var(--font-scale, 1));
  width: 100%;
}
.portrait {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 16px;
}
.person-overview,
.relation-center {
  text-align: center;
}
.relation-label {
  display: inline-block;
  background: var(--mm-green);
  border-radius: 20px;
  padding: 5px 18px;
  margin: 8px 0 18px;
  color: var(--mm-brand);
}
.person-overview > text {
  display: block;
  text-align: left;
  line-height: 1.9;
}
.story-cover {
  width: 100%;
  height: 210px;
  border-radius: 24px;
}
.story-content {
  white-space: pre-wrap;
  line-height: 2;
  font-size: calc(19px * var(--font-scale, 1));
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}
.chip {
  border: 1px solid #dbe3d3;
  border-radius: 8px;
  padding: 10px 17px;
  min-height: 48px;
  font-size: calc(16px * var(--font-scale, 1));
}
.chip.active {
  background: var(--mm-brand);
  color: #fff;
  border-color: var(--mm-brand);
}
.small-avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
}
.grow {
  flex: 1;
  min-width: 0;
}
.relation-row {
  width: 100%;
  text-align: left;
}
.timeline-card {
  text-align: left;
  border-left: 4px solid #9db58b;
  width: 100%;
}
.timeline-title {
  font-size: calc(21px * var(--font-scale, 1));
  font-weight: 600;
  margin: 10px 0;
}
</style>
