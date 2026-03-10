<!--
  音频转写演示页（Audio Transcript Demo）
  ==========================================
  功能概述：
  - 播放音频时，转写文本按时间轴自动高亮当前段落
  - 当前段落自动滚动到可视区域（可被用户手动滚动打断）
  - 点击任意段落可跳转到对应时间点播放
  - 支持「上一句 / 下一句」逐句播放、「回到当前播放位置」滚动回当前句
  数据：transcript 为带 begin/end 的段落列表，可替换为接口返回的转写数据
-->
<template>
  <div class="page">
    <div class="card">
      <!-- 顶部标题与操作区 -->
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

      <!-- 音频区域：封面 + 播放器 + 当前时间/段落信息 -->
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

      <!-- 转写列表容器：可滚动，监听 scroll 以区分用户手动滚动 -->
      <div
        ref="transcriptContainerRef"
        class="transcript-container"
        @scroll="handleTranscriptScroll"
      >
        <!-- 每个段落：发言人、时间范围、文本；当前播放项高亮并可点击跳转 -->
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

// ========== 数据源 ==========
/** 音频文件地址。接入项目时替换为接口返回的音频 URL */
// （popUrl 由 import 得到，此处使用示例资源）

/**
 * 转写段落列表（后端数据结构）
 * 每项需包含：id, begin, end, onebest（文本）, spk/spkName, defaultPic 等
 * 实际项目中将 transcript.value 赋值为接口返回的转写数据即可
 */
const transcript = ref(audioList)

// ========== DOM 引用 ==========
/** <audio> 元素引用，用于读取 currentTime、控制播放与跳转 */
const audioRef = ref(null)
/** 转写列表的滚动容器，用于计算滚动位置与执行 scrollTo */
const transcriptContainerRef = ref(null)
/** 各段落 DOM 元素数组，用于 scrollToSegment 时获取元素位置；shallowRef 避免大列表深响应 */
const segmentRefs = shallowRef([])

// ========== 播放与高亮状态 ==========
/** 当前播放时间（秒），用于显示与计算当前段落 */
const currentTime = ref(0)
/** 当前高亮段落索引，-1 表示无 */
const activeIndex = ref(-1)
/** 用户是否正在手动滚动转写列表；为 true 时暂停自动滚动跟随 */
const userScrolling = ref(false)
/** 用户是否正在拖动进度条（seeking），用于在 seeked 时用二分查找而非游标定位 */
const isSeeking = ref(false)

/**
 * 游标索引（播放同步优化）
 * 正常顺序播放时，当前段落通常等于上一帧的段落或下一段，用游标可减少二分查找次数
 */
const cursorIndex = ref(0)

// ========== 定时器 / 动画帧 ==========
/** requestAnimationFrame 句柄，播放时用于 syncLoop，暂停时取消 */
let rafId = null
/** 用户滚动结束后的重置定时器：一段时间无滚动后将 userScrolling 置为 false */
let userScrollTimer = null

/**
 * 当前展示的封面图
 * 优先使用当前高亮段落的 defaultPic，否则使用第一段的封面
 */
const currentCover = computed(() => {
  if (activeIndex.value >= 0 && transcript.value[activeIndex.value]?.defaultPic) {
    return transcript.value[activeIndex.value].defaultPic
  }
  return transcript.value[0]?.defaultPic || ''
})

/**
 * 监听 transcript 长度变化（如切换音频/重新拉取转写）
 * 重置段落 refs、游标和当前高亮，避免旧索引指向错误或越界
 */
watch(
  () => transcript.value.length,
  () => {
    segmentRefs.value = []
    cursorIndex.value = 0
    activeIndex.value = -1
  }
)

// ========== 工具函数 ==========

/**
 * 将秒数格式化为 HH:MM:SS 字符串
 * @param {number | null | undefined} sec - 秒数（可为 null/undefined/NaN）
 * @returns {string} 如 "01:23:45"
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

/**
 * v-for 中用于收集每个段落 DOM 的 ref 回调
 * @param {HTMLElement | null} el - 段落元素（卸载时为 null）
 * @param {number} index - 段落索引
 */
function setSegmentRef(el, index) {
  if (el) {
    segmentRefs.value[index] = el
  }
}

/**
 * 根据段落数据与是否当前播放返回段落样式（背景、文字色、边框）
 * @param {Object} item - 段落数据，可含 backgroundColor / fontColor / borderColor
 * @param {boolean} isActive - 是否为当前播放段落
 * @returns {Object} 用于 :style 的对象
 */
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
 * 二分查找：根据播放时间 time 定位所在段落索引
 * 用于用户 seek（拖进度条）或初始加载时，快速定位到正确段落
 * @param {Array<{ begin: number, end: number }>} segments - 按时间有序的段落列表
 * @param {number} time - 当前时间（秒）
 * @returns {number} 段落索引，未找到返回 -1；若 time 在某段之前则返回最后一个 begin <= time 的索引（right）
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
 * 根据当前播放时间，用游标方式计算当前段落索引（用于正常顺序播放）
 * 游标从上一帧的 cursorIndex 开始向前/向后微调，避免每次都用二分查找，提高性能
 * @param {number} time - 当前播放时间（秒）
 * @returns {number} 段落索引
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

/**
 * 根据播放时间计算当前应高亮的段落索引
 * seeking 为 true 时（拖进度条、初始加载）用二分查找；否则用游标方式
 * @param {number} time - 当前播放时间（秒）
 * @param {boolean} [seeking=false] - 是否处于 seek 场景
 * @returns {number} 段落索引
 */
function getActiveIndex(time, seeking = false) {
  if (seeking) {
    const idx = binarySearchSegment(transcript.value, time)
    cursorIndex.value = Math.max(idx, 0)
    return idx
  }
  return getActiveIndexByCursor(time)
}

/**
 * 将指定段落滚动到可视区域内（仅在当前不在可视区时滚动）
 * 目标位置：段落靠近容器垂直方向中部，并留出上下 padding
 * @param {number} index - 段落索引
 * @param {boolean} [smooth=true] - 是否平滑滚动
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

/**
 * 更新当前高亮段落并可选地滚动到该段落
 * 若用户正在手动滚动（userScrolling），则不自动滚动，避免打断阅读
 * @param {number} nextIndex - 新的高亮段落索引
 * @param {Object} [options] - fromSeek: 是否来自 seek，为 true 时使用非平滑滚动
 */
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
 * 播放状态同步循环（每帧执行）
 * 读取 audio.currentTime，更新 currentTime、计算当前段落并更新高亮与滚动
 * 仅在播放时通过 startSyncLoop 启动，暂停时 stopSyncLoop 取消
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

/** 开始同步循环（播放时调用），若已在运行则不再重复启动 */
function startSyncLoop() {
  if (rafId != null) return
  rafId = requestAnimationFrame(syncLoop)
}

/** 停止同步循环并清理 rafId（暂停或组件卸载时调用） */
function stopSyncLoop() {
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

/**
 * 点击某段转写文本：跳转到该段开始时间并播放
 * @param {Object} item - 段落数据，需含 begin
 * @param {number} index - 段落索引
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
 * 按段落索引播放：将播放位置设为该段 begin，更新游标与高亮，并开始播放
 * 同时清除 userScrolling，使自动滚动重新生效
 * @param {number} index - 目标段落索引（会被 clamp 到有效范围）
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

/** 播放上一句：当前为第一句时仍停留在第一句 */
function playPrevSegment() {
  const current = activeIndex.value
  const target = current <= 0 ? 0 : current - 1
  playSegmentByIndex(target)
}

/** 播放下一句：当前为最后一句时不再前进 */
function playNextSegment() {
  const segments = transcript.value
  if (!segments.length) return

  const current = activeIndex.value
  const target = current < 0 ? 0 : Math.min(current + 1, segments.length - 1)
  playSegmentByIndex(target)
}

/**
 * 转写列表滚动事件：标记为用户手动滚动
 * 通过短延时重置 userScrolling，避免滚动惯性期间仍被当作“用户在滚动”
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

/** 「回到当前播放位置」：取消手动滚动标记，并平滑滚动到当前高亮段落 */
function backToCurrent() {
  userScrolling.value = false
  if (activeIndex.value >= 0) {
    scrollToSegment(activeIndex.value, true)
  }
}

// ========== Audio 元素事件 ==========

/** 播放开始：启动 requestAnimationFrame 同步循环 */
function handlePlay() {
  startSyncLoop()
}

/** 播放暂停：停止同步循环，节省资源 */
function handlePause() {
  stopSyncLoop()
}

/** 用户开始拖动进度条：标记 seeking，seeked 时用二分查找定位段落 */
function handleSeeking() {
  isSeeking.value = true
}

/**
 * 用户拖动进度条结束：根据当前时间用二分查找更新高亮段落与滚动位置
 * 并清除 userScrolling，使后续播放时恢复自动跟随
 */
function handleSeeked() {
  const audio = audioRef.value
  if (!audio) return

  const time = audio.currentTime || 0
  currentTime.value = time

  userScrolling.value = false

  const idx = getActiveIndex(time, true)
  updateActiveIndex(idx, { fromSeek: true })

  isSeeking.value = false
}

/**
 * 音频元数据加载完成（如 duration 可用）
 * 根据当前 currentTime 初始化高亮段落（例如初始为 0 时高亮第一段）
 */
function handleLoadedMetadata() {
  const audio = audioRef.value
  if (!audio) return

  const time = audio.currentTime || 0
  currentTime.value = time

  const idx = getActiveIndex(time, true)
  updateActiveIndex(idx, { fromSeek: true })
}

// ========== 生命周期 ==========

/** 挂载时根据初始时间（通常为 0）设置一次高亮与滚动位置 */
onMounted(() => {
  const idx = getActiveIndex(0, true)
  updateActiveIndex(idx, { fromSeek: true })
})

/** 卸载前取消同步循环与滚动重置定时器，防止内存泄漏 */
onBeforeUnmount(() => {
  stopSyncLoop()
  if (userScrollTimer) {
    clearTimeout(userScrollTimer)
    userScrollTimer = null
  }
})
</script>

<style scoped>
/* ---------- 全局与布局 ---------- */
* {
  box-sizing: border-box;
}

/* 页面外层：背景与内边距 */
.page {
  padding: 24px;
  background: #f6f8fc;
  height: 100%;
}

/* 主卡片：居中、最大宽度、flex 纵向布局，保证转写区域可伸缩 */
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

/* 顶部：标题 + 操作按钮 */
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

/* ---------- 音频区域 ---------- */
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

/* ---------- 转写列表 ---------- */
.transcript-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

/* 单条转写段落：可点击、当前播放项通过 .active 高亮 */
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

/* ---------- 响应式：小屏时标题与音频区改为纵向排列 ---------- */
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
