<template>
  <div class="page">
    <div class="layout">
      <div class="player-panel">
        <h2>音视频播放器</h2>

        <video
          ref="mediaRef"
          class="media"
          controls
          preload="metadata"
          @play="handlePlay"
          @pause="handlePause"
          @seeking="handleSeeking"
          @seeked="handleSeeked"
          @loadedmetadata="handleLoadedMetadata"
        >
          <!-- 这里换成你的真实音视频地址 -->
          <source
            src="http://alpha-dev.oss-cn-beijing.aliyuncs.com/alpha_sales/evidence-app/criminal/evidence-split2.mp4"
            type="video/mp4"
          />
          当前浏览器不支持 video 标签
        </video>

        <div class="player-info">
          <div>当前播放时间：{{ formatTime(currentTime) }}</div>
          <div>当前高亮段落：{{ activeIndex >= 0 ? activeIndex + 1 : '-' }}</div>
          <div>自动跟随：{{ autoFollow ? '开启' : '关闭' }}</div>
        </div>

        <div class="actions">
          <button @click="toggleAutoFollow">
            {{ autoFollow ? '关闭自动跟随' : '开启自动跟随' }}
          </button>

          <button @click="backToCurrent">回到当前播放位置</button>
        </div>
      </div>

      <div class="transcript-panel">
        <div class="transcript-header">
          <h2>解析文本</h2>
          <div class="tip">点击段落可跳转播放；手动滚动后会暂停自动跟随</div>
        </div>

        <div
          ref="transcriptContainerRef"
          class="transcript-container"
          @scroll="handleTranscriptScroll"
        >
          <div
            v-for="(segment, index) in transcript"
            :key="segment.id"
            :ref="el => setSegmentRef(el, index)"
            class="segment"
            :class="{ active: index === activeIndex }"
            @click="jumpToSegment(segment, index)"
          >
            <div class="segment-time">
              {{ formatTime(segment.start) }} - {{ formatTime(segment.end) }}
            </div>
            <div class="segment-text">
              {{ segment.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount, nextTick } from 'vue'

/**
 * =========================
 * 模拟后端返回的 ASR 结果
 * 实际项目里你替换成接口返回即可
 * =========================
 */
const transcript = ref([
  {
    id: 1,
    start: 0.2,
    end: 3.1,
    text: '大家好，今天我们来演示一个音视频和转写文本联动的完整案例。',
  },
  {
    id: 2,
    start: 3.2,
    end: 6.6,
    text: '前端把音视频地址传给后端，后端调用第三方 ASR 服务进行解析。',
  },
  {
    id: 3,
    start: 6.7,
    end: 10.2,
    text: '解析完成以后，后端返回每一段对应的开始时间、结束时间和文本内容。',
  },
  {
    id: 4,
    start: 10.3,
    end: 14.5,
    text: '前端展示播放器和 transcript 列表，在播放过程中同步高亮当前段落。',
  },
  {
    id: 5,
    start: 14.6,
    end: 18.8,
    text: '如果当前高亮段落不在可视区域内，界面会自动滚动到合适的位置。',
  },
  {
    id: 6,
    start: 18.9,
    end: 23.3,
    text: '为了避免性能问题，我们不会在每一次时间变化时都去做大量 DOM 更新。',
  },
  {
    id: 7,
    start: 23.4,
    end: 27.7,
    text: '只有当播放时间真正跨越到新的段落时，才会更新高亮状态和自动滚动。',
  },
  {
    id: 8,
    start: 27.8,
    end: 32.4,
    text: '在正常播放时，我们主要依赖游标前进；在用户拖动进度条时，使用二分查找重新定位。',
  },
  {
    id: 9,
    start: 32.5,
    end: 36.8,
    text: '这样既能保证同步准确，也能减少不必要的遍历和组件重渲染。',
  },
  {
    id: 10,
    start: 36.9,
    end: 42.0,
    text: '如果 transcript 特别长，比如上千上万段，则建议再结合虚拟列表来进一步优化渲染性能。',
  },
])

/**
 * =========================
 * DOM refs
 * =========================
 */
const mediaRef = ref(null)
const transcriptContainerRef = ref(null)
const segmentRefs = shallowRef([])

/**
 * =========================
 * 播放状态
 * =========================
 */
const currentTime = ref(0)
const activeIndex = ref(-1)
const autoFollow = ref(true)

/**
 * 标记是否是用户主动滚动，避免自动滚动和用户滚动冲突
 */
const userScrolling = ref(false)
let userScrollTimer = null

/**
 * RAF 循环 ID
 */
let rafId = null

/**
 * 游标优化
 * 正常播放时，优先从当前位置附近找，而不是每次全量扫描
 */
const cursorIndex = ref(0)

/**
 * seeking 状态
 * 用户拖动进度条时，用二分查找重新定位
 */
const isSeeking = ref(false)

/**
 * 预计算开始时间数组，便于二分
 */

/**
 * =========================
 * 工具函数
 * =========================
 */
function formatTime(sec) {
  if (sec == null || Number.isNaN(sec)) return '00:00'
  const total = Math.floor(sec)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function setSegmentRef(el, index) {
  if (el) {
    segmentRefs.value[index] = el
  }
}

/**
 * 二分查找
 * 用于 seek 后快速定位
 */
function binarySearchSegment(segments, time) {
  let left = 0
  let right = segments.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const seg = segments[mid]

    if (time < seg.start) {
      right = mid - 1
    } else if (time > seg.end) {
      left = mid + 1
    } else {
      return mid
    }
  }

  // 没命中时，返回最接近的左侧段落
  if (right >= 0) return right
  return -1
}

/**
 * 正常播放时的轻量定位逻辑
 * 优先用游标前进/后退
 * 只有找不到时，再兜底二分
 */
function getActiveIndexByCursor(time) {
  const segments = transcript.value
  if (!segments.length) return -1

  let i = cursorIndex.value

  if (i < 0) i = 0
  if (i >= segments.length) i = segments.length - 1

  const cur = segments[i]

  if (cur && time >= cur.start && time <= cur.end) {
    return i
  }

  // 向后推进
  while (i + 1 < segments.length && time > segments[i].end) {
    i++
    const seg = segments[i]
    if (time >= seg.start && time <= seg.end) {
      cursorIndex.value = i
      return i
    }
  }

  // 向前回退（例如轻微回拖）
  while (i - 1 >= 0 && time < segments[i].start) {
    i--
    const seg = segments[i]
    if (time >= seg.start && time <= seg.end) {
      cursorIndex.value = i
      return i
    }
  }

  // 兜底：二分
  const idx = binarySearchSegment(segments, time)
  cursorIndex.value = Math.max(idx, 0)
  return idx
}

/**
 * 根据当前时间获取段落索引
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
 * 自动滚动
 * 只在元素不在可视区域内时才滚动
 */
function scrollToSegment(index, smooth = true) {
  const container = transcriptContainerRef.value
  const el = segmentRefs.value[index]

  if (!container || !el || index < 0) return

  const elTop = el.offsetTop
  const elBottom = elTop + el.offsetHeight
  const viewTop = container.scrollTop
  const viewBottom = viewTop + container.clientHeight

  const paddingTop = 60
  const paddingBottom = 100

  const inView = elTop >= viewTop + paddingTop && elBottom <= viewBottom - paddingBottom

  if (inView) return

  const targetTop = Math.max(0, elTop - container.clientHeight / 3)

  container.scrollTo({
    top: targetTop,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

/**
 * 更新高亮
 * 只有变化时才更新，避免重复渲染
 */
function updateActiveIndex(nextIndex, options = {}) {
  const { fromSeek = false } = options

  if (nextIndex === activeIndex.value) return

  activeIndex.value = nextIndex

  nextTick(() => {
    if (autoFollow.value && !userScrolling.value) {
      scrollToSegment(nextIndex, !fromSeek)
    }
  })
}

/**
 * 主同步循环
 * 使用 requestAnimationFrame 做轻量轮询
 */
function syncLoop() {
  const media = mediaRef.value
  if (!media) {
    rafId = requestAnimationFrame(syncLoop)
    return
  }

  const time = media.currentTime || 0
  currentTime.value = time

  const nextIndex = getActiveIndex(time, false)
  updateActiveIndex(nextIndex)

  rafId = requestAnimationFrame(syncLoop)
}

/**
 * 启动同步循环
 */
function startSyncLoop() {
  if (rafId != null) return
  rafId = requestAnimationFrame(syncLoop)
}

/**
 * 停止同步循环
 */
function stopSyncLoop() {
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

/**
 * 点击段落跳转播放
 */
function jumpToSegment(segment, index) {
  const media = mediaRef.value
  if (!media) return

  media.currentTime = segment.start
  currentTime.value = segment.start

  cursorIndex.value = index
  updateActiveIndex(index, { fromSeek: true })

  media.play()
}

/**
 * 用户手动滚动 transcript
 * 暂停自动跟随
 */
function handleTranscriptScroll() {
  userScrolling.value = true
  autoFollow.value = false

  if (userScrollTimer) {
    clearTimeout(userScrollTimer)
  }

  userScrollTimer = setTimeout(() => {
    userScrolling.value = false
  }, 150)
}

function toggleAutoFollow() {
  autoFollow.value = !autoFollow.value
  if (autoFollow.value && activeIndex.value >= 0) {
    nextTick(() => {
      scrollToSegment(activeIndex.value, true)
    })
  }
}

function backToCurrent() {
  autoFollow.value = true
  userScrolling.value = false
  if (activeIndex.value >= 0) {
    scrollToSegment(activeIndex.value, true)
  }
}

/**
 * =========================
 * 播放器事件
 * =========================
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
  const media = mediaRef.value
  if (!media) return

  const time = media.currentTime || 0
  currentTime.value = time

  const idx = getActiveIndex(time, true)
  updateActiveIndex(idx, { fromSeek: true })

  isSeeking.value = false
}

function handleLoadedMetadata() {
  const media = mediaRef.value
  if (!media) return

  const time = media.currentTime || 0
  currentTime.value = time

  const idx = getActiveIndex(time, true)
  updateActiveIndex(idx, { fromSeek: true })
}

/**
 * =========================
 * 生命周期
 * =========================
 */
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
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fb;
  color: #222;
}

.layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 20px;
  align-items: start;
}

.player-panel,
.transcript-panel {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}

.player-panel h2,
.transcript-panel h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

.media {
  width: 100%;
  max-height: 420px;
  border-radius: 12px;
  background: #000;
}

.player-info {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #555;
}

.actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

button {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  background: #1677ff;
  color: #fff;
  font-size: 14px;
}

button:hover {
  opacity: 0.92;
}

.transcript-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.tip {
  color: #666;
  font-size: 13px;
}

.transcript-container {
  height: 520px;
  overflow-y: auto;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 12px;
  background: #fafcff;
}

.segment {
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin-bottom: 10px;
  background: #fff;
}

.segment:hover {
  background: #f0f6ff;
  border-color: #d6e4ff;
}

.segment.active {
  background: #e6f4ff;
  border-color: #91caff;
  box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.08);
}

.segment-time {
  font-size: 12px;
  color: #1677ff;
  margin-bottom: 6px;
  font-weight: 600;
}

.segment-text {
  line-height: 1.7;
  color: #222;
  font-size: 14px;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .transcript-container {
    height: 420px;
  }
}
</style>
