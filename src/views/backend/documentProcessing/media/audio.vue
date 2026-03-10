<template>
  <div class="page">
    <div class="card">
      <div class="header">
        <div>
          <h2>Audio Transcript Demo</h2>
          <p class="desc">播放音频时，文本自动高亮并按需滚动</p>
        </div>
        <div class="header-actions">
          <button class="btn" @click="playPrevSegment">上一句</button>
          <button class="btn" @click="playNextSegment">下一句</button>
          <button class="btn btn-primary" @click="backToCurrent">回到当前播放位置</button>
        </div>
      </div>

      <div class="audio-panel">
        <div class="cover">
          <img :src="currentCover" alt="cover" />
        </div>

        <div class="audio-main">
          <audio
            ref="audioRef"
            class="audio"
            controls
            preload="metadata"
            :src="popUrl"
            @play="handlePlay"
            @pause="handlePause"
            @seeking="handleSeeking"
            @seeked="handleSeeked"
            @loadedmetadata="handleLoadedMetadata"
          />

          <div class="audio-info">
            <span>当前时间：{{ formatTime(currentTime) }}</span>
            <span>当前段落：{{ activeIndex >= 0 ? activeIndex + 1 : '-' }}</span>
          </div>
        </div>
      </div>

      <div
        ref="transcriptContainerRef"
        class="transcript-container"
        @scroll="handleTranscriptScroll"
      >
        <div
          v-for="(item, index) in transcript"
          :key="item.id"
          :ref="el => setSegmentRef(el, index)"
          class="segment"
          :class="{ active: index === activeIndex }"
          :style="getSegmentStyle(item, index === activeIndex)"
          @click="jumpToSegment(item, index)"
        >
          <div class="segment-top">
            <div class="speaker-wrap">
              <img class="avatar" :src="item.defaultPic" alt="avatar" />
              <div class="speaker-info">
                <div class="speaker-name">
                  {{ item.spkName || `发言人${item.spk ?? ''}` }}
                </div>
                <div class="segment-time">
                  {{ item.beginTimeStr || formatTime(item.begin) }}
                  -
                  {{ item.endTimeStr || formatTime(item.end) }}
                </div>
              </div>
            </div>

            <div v-if="index === activeIndex" class="playing-tag">播放中</div>
          </div>

          <div class="segment-text">
            {{ item.onebest }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import popUrl from '@/assets/media/pop.mp3'
import { audioList } from '../data/audioList'

/**
 * 你的音频地址
 * 这里先放一个示例，接项目时替换成接口返回的音频 URL
 */

/**
 * 后端返回的数据结构示例
 * 实际项目里你用接口数据替换 transcript.value 即可
 */
const transcript = ref(audioList)

/**
 * DOM refs
 */
const audioRef = ref(null)
const transcriptContainerRef = ref(null)
const segmentRefs = shallowRef([])

/**
 * 状态
 */
const currentTime = ref(0)
const activeIndex = ref(-1)
const userScrolling = ref(false)
const isSeeking = ref(false)

/**
 * 游标优化
 */
const cursorIndex = ref(0)

/**
 * requestAnimationFrame
 */
let rafId = null
let userScrollTimer = null

/**
 * 当前封面
 */
const currentCover = computed(() => {
  if (activeIndex.value >= 0 && transcript.value[activeIndex.value]?.defaultPic) {
    return transcript.value[activeIndex.value].defaultPic
  }
  return transcript.value[0]?.defaultPic || ''
})

/**
 * transcript 变化时，重置 refs，避免旧索引残留
 */
watch(
  () => transcript.value.length,
  () => {
    segmentRefs.value = []
    cursorIndex.value = 0
    activeIndex.value = -1
  }
)

/**
 * 工具函数
 */
function formatTime(sec) {
  if (sec == null || Number.isNaN(sec)) return '00:00:00'
  const total = Math.floor(sec)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':')
}

function setSegmentRef(el, index) {
  if (el) {
    segmentRefs.value[index] = el
  }
}

function getSegmentStyle(item, isActive) {
  const backgroundColor = isActive ? item.backgroundColor || '#F5F7FF' : '#fff'
  const color = item.fontColor || '#333'
  const border = isActive ? item.borderColor || '1px solid #d9d9d9' : '1px solid #ececec'

  return {
    background: backgroundColor,
    color,
    border,
  }
}

/**
 * 二分查找：用于 seek 后快速定位
 * 按 begin / end 定位
 */
function binarySearchSegment(segments, time) {
  let left = 0
  let right = segments.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const seg = segments[mid]

    if (time < seg.begin) {
      right = mid - 1
    } else if (time > seg.end) {
      left = mid + 1
    } else {
      return mid
    }
  }

  if (right >= 0) return right
  return -1
}

/**
 * 正常播放时：优先使用游标前进
 */
function getActiveIndexByCursor(time) {
  const segments = transcript.value
  if (!segments.length) return -1

  let i = cursorIndex.value

  if (i < 0) i = 0
  if (i >= segments.length) i = segments.length - 1

  const current = segments[i]
  if (current && time >= current.begin && time <= current.end) {
    return i
  }

  while (i + 1 < segments.length && time > segments[i].end) {
    i++
    const seg = segments[i]
    if (time >= seg.begin && time <= seg.end) {
      cursorIndex.value = i
      return i
    }
  }

  while (i - 1 >= 0 && time < segments[i].begin) {
    i--
    const seg = segments[i]
    if (time >= seg.begin && time <= seg.end) {
      cursorIndex.value = i
      return i
    }
  }

  const idx = binarySearchSegment(segments, time)
  cursorIndex.value = Math.max(idx, 0)
  return idx
}

function getActiveIndex(time, seeking = false) {
  if (seeking) {
    const idx = binarySearchSegment(transcript.value, time)
    cursorIndex.value = Math.max(idx, 0)
    return idx
  }
  return getActiveIndexByCursor(time)
}

/**
 * 只在必要时滚动
 */
function scrollToSegment(index, smooth = true) {
  const container = transcriptContainerRef.value
  const el = segmentRefs.value[index]
  if (!container || !el || index < 0) return

  // 使用相对 transcriptContainer 的位置，而不是整个窗口
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  // 当前元素在容器可视区域内的相对 top/bottom
  const elTopInContainer = elRect.top - containerRect.top
  const elBottomInContainer = elRect.bottom - containerRect.top

  const paddingTop = 50
  const paddingBottom = 80

  const inView =
    elTopInContainer >= paddingTop && elBottomInContainer <= container.clientHeight - paddingBottom

  if (inView) return

  // 目标 scrollTop：让当前元素靠近容器中间
  const centerOffset = (container.clientHeight - el.offsetHeight) / 2
  const targetTop = container.scrollTop + elTopInContainer - Math.max(centerOffset, paddingTop)

  container.scrollTo({
    top: targetTop,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

function updateActiveIndex(nextIndex, options = {}) {
  const { fromSeek = false } = options

  if (nextIndex === activeIndex.value) return

  activeIndex.value = nextIndex

  nextTick(() => {
    if (!userScrolling.value) {
      scrollToSegment(nextIndex, !fromSeek)
    }
  })
}

/**
 * 播放同步循环
 * 只在播放中启用
 */
function syncLoop() {
  const audio = audioRef.value
  if (!audio) {
    rafId = requestAnimationFrame(syncLoop)
    return
  }

  const time = audio.currentTime || 0
  currentTime.value = time

  const nextIndex = getActiveIndex(time, false)
  updateActiveIndex(nextIndex)

  rafId = requestAnimationFrame(syncLoop)
}

function startSyncLoop() {
  if (rafId != null) return
  rafId = requestAnimationFrame(syncLoop)
}

function stopSyncLoop() {
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

/**
 * 点击文本跳转播放
 */
function jumpToSegment(item, index) {
  const audio = audioRef.value
  if (!audio) return

  audio.currentTime = item.begin
  currentTime.value = item.begin
  cursorIndex.value = index

  updateActiveIndex(index, { fromSeek: true })
  audio.play()
}

/**
 * 上一 / 下一句
 */
function playSegmentByIndex(index) {
  const segments = transcript.value
  const audio = audioRef.value
  if (!audio || !segments.length) return

  const safeIndex = Math.min(Math.max(index, 0), segments.length - 1)
  const seg = segments[safeIndex]

  audio.currentTime = seg.begin
  currentTime.value = seg.begin
  cursorIndex.value = safeIndex

  userScrolling.value = false

  updateActiveIndex(safeIndex, { fromSeek: true })
  audio.play()
}

function playPrevSegment() {
  const current = activeIndex.value
  const target = current <= 0 ? 0 : current - 1
  playSegmentByIndex(target)
}

function playNextSegment() {
  const segments = transcript.value
  if (!segments.length) return

  const current = activeIndex.value
  const target = current < 0 ? 0 : Math.min(current + 1, segments.length - 1)
  playSegmentByIndex(target)
}

/**
 * 用户手动滚动 transcript
 */
function handleTranscriptScroll() {
  userScrolling.value = true

  if (userScrollTimer) {
    clearTimeout(userScrollTimer)
  }

  userScrollTimer = setTimeout(() => {
    userScrolling.value = false
  }, 150)
}

function backToCurrent() {
  userScrolling.value = false
  if (activeIndex.value >= 0) {
    scrollToSegment(activeIndex.value, true)
  }
}

/**
 * audio 事件
 */
function handlePlay() {
  startSyncLoop()
}

function handlePause() {
  stopSyncLoop()
}

function handleSeeking() {
  isSeeking.value = true
}

function handleSeeked() {
  const audio = audioRef.value
  if (!audio) return

  const time = audio.currentTime || 0
  currentTime.value = time

  // 用户拖动进度条后，重新开启自动跟随并关闭“手动滚动”状态
  userScrolling.value = false

  const idx = getActiveIndex(time, true)
  updateActiveIndex(idx, { fromSeek: true })

  isSeeking.value = false
}

function handleLoadedMetadata() {
  const audio = audioRef.value
  if (!audio) return

  const time = audio.currentTime || 0
  currentTime.value = time

  const idx = getActiveIndex(time, true)
  updateActiveIndex(idx, { fromSeek: true })
}

onMounted(() => {
  const idx = getActiveIndex(0, true)
  updateActiveIndex(idx, { fromSeek: true })
})

onBeforeUnmount(() => {
  stopSyncLoop()
  if (userScrollTimer) {
    clearTimeout(userScrollTimer)
    userScrollTimer = null
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  padding: 24px;
  background: #f6f8fc;
  height: 100%;
}

.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 980px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.06);
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.desc {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  height: 38px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #333;
  border-radius: 10px;
  padding: 0 14px;
  cursor: pointer;
}

.btn-primary {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}

.audio-panel {
  display: flex;
  gap: 18px;
  padding: 18px;
  border-radius: 16px;
  background: #fafbff;
  margin-bottom: 20px;
  border: 1px solid #eef2ff;
}

.cover {
  width: 96px;
  height: 96px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f0f0;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.audio-main {
  flex: 1;
  min-width: 0;
}

.audio {
  width: 100%;
}

.audio-info {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #666;
  font-size: 14px;
}

.transcript-container {
  /* height: 560px; */
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.segment {
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
  margin-bottom: 14px;
}

.segment:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
}

.segment.active {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}

.segment-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.speaker-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  background: #eee;
}

.speaker-info {
  min-width: 0;
}

.speaker-name {
  font-size: 15px;
  font-weight: 600;
  color: #222;
}

.segment-time {
  margin-top: 4px;
  font-size: 12px;
  color: #777;
}

.playing-tag {
  flex-shrink: 0;
  font-size: 12px;
  line-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
  font-weight: 600;
}

.segment-text {
  line-height: 1.8;
  font-size: 15px;
  word-break: break-word;
}

@media (max-width: 768px) {
  .page {
    padding: 12px;
  }

  .card {
    padding: 16px;
    border-radius: 14px;
  }

  .header {
    flex-direction: column;
  }

  .audio-panel {
    flex-direction: column;
  }

  .cover {
    width: 72px;
    height: 72px;
  }
}
</style>
