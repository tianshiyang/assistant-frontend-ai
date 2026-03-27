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
            @seeked="handleSeeked"
            @loadedmetadata="handleLoadedMetadata"
          />

          <div class="audio-info">
            <span>当前时间：{{ formatTime(currentTime) }}</span>
            <span>当前段落：{{ activeIndex >= 0 ? activeIndex + 1 : '-' }}</span>
            <span>浏览模式：{{ followPlayback ? '跟随播放' : '自由浏览' }}</span>
          </div>
        </div>
      </div>

      <!-- 转写列表容器：可滚动，监听 scroll 以区分用户手动滚动 -->
      <DynamicScroller
        ref="transcriptScrollerRef"
        class="transcript-container"
        :items="transcript"
        key-field="id"
        :min-item-size="segmentMinSize"
        :buffer="segmentBuffer"
        @wheel.passive="disableFollow"
        @touchmove.passive="disableFollow"
        @mousedown="disableFollow"
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[item.onebest, item.beginTimeStr, item.endTimeStr, item.spkName]"
          >
            <!-- 每个段落：发言人、时间范围、文本；当前播放项高亮并可点击跳转 -->
            <div
              :ref="el => setSegmentRef(el, index)"
              :data-segment-index="index"
              class="segment"
              :class="{ active: index === activeIndex }"
              :style="getSegmentStyle(item, index === activeIndex)"
              @click="jumpToSegment(index)"
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

                <div class="playing-tag" :class="{ visible: index === activeIndex }">播放中</div>
              </div>

              <div class="segment-text">
                {{ item.onebest }}
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import popUrl from '@/assets/media/pop.mp3'
import { audioList } from '../data/audioList'

const transcript = ref(audioList)

const audioRef = ref(null)
const transcriptScrollerRef = ref(null)
const segmentRefs = shallowRef([])
const segmentMinSize = 120
const segmentBuffer = 600

const currentTime = ref(0)
const activeIndex = ref(-1)
const followPlayback = ref(true)
let rafId = null
let autoScrollUntil = 0
const scrollPaddingTop = 50
const scrollPaddingBottom = 80

const currentCover = computed(() => {
  return transcript.value[activeIndex.value]?.defaultPic || transcript.value[0]?.defaultPic || ''
})

watch(
  () => transcript.value.length,
  () => {
    segmentRefs.value = []
    activeIndex.value = -1
    followPlayback.value = true
  }
)

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
  segmentRefs.value[index] = el || undefined
}

function getSegmentStyle(item, isActive) {
  return {
    background: isActive ? item.backgroundColor || '#F5F7FF' : '#fff',
    color: item.fontColor || '#333',
    border: isActive ? item.borderColor || '1px solid #d9d9d9' : '1px solid #ececec',
  }
}

/**
 * 二分查找：根据播放时间 time 定位所在段落索引
 * 用于用户 seek（拖进度条）或初始加载时，快速定位到正确段落
 * @param {Array<{ begin: number, end: number }>} segments - 按时间有序的段落列表
 * @param {number} time - 当前时间（秒）
 * @returns {number} 段落索引，未找到返回 -1；若 time 在某段之前则返回最后一个 begin <= time 的索引（right）
 */
function findSegmentIndex(time) {
  const segments = transcript.value
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

  return right >= 0 ? right : -1
}

function markAutoScrolling(smooth) {
  autoScrollUntil = performance.now() + (smooth ? 900 : 240)
}

function isAutoScrolling() {
  return performance.now() < autoScrollUntil
}

function disableFollow() {
  if (!isAutoScrolling()) {
    followPlayback.value = false
  }
}

/**
 * 判断某个段落元素是否已处于可视区
 * @param {HTMLElement} el - 段落元素
 * @param {HTMLElement} container - 滚动容器
 * @returns {boolean}
 */
function isSegmentInView(el, container) {
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const elTopInContainer = elRect.top - containerRect.top
  const elBottomInContainer = elRect.bottom - containerRect.top

  return (
    elTopInContainer >= scrollPaddingTop &&
    elBottomInContainer <= container.clientHeight - scrollPaddingBottom
  )
}

/**
 * 将显示时间同步为整秒，减少播放中高频重渲染
 * @param {number} time - 当前播放时间（秒）
 */
function syncDisplayedTime(time) {
  const displayTime = Math.floor(time || 0)
  if (displayTime !== currentTime.value) {
    currentTime.value = displayTime
  }
}

/**
 * 获取当前已渲染的目标段落元素。
 * 虚拟列表复用节点时，优先校验 ref 是否仍属于当前索引；否则回退到 DOM 查询。
 * @param {HTMLElement} container - 滚动容器
 * @param {number} index - 段落索引
 * @returns {HTMLElement | null}
 */
function getRenderedSegmentElement(container, index) {
  const refEl = segmentRefs.value[index]
  if (refEl && container.contains(refEl) && Number(refEl.dataset.segmentIndex) === index) {
    return refEl
  }

  return container.querySelector(`[data-segment-index="${index}"]`)
}

/**
 * 将指定段落滚动到可视区域内（仅在当前不在可视区时滚动）
 * 目标位置：段落靠近容器垂直方向中部，并留出上下 padding
 * @param {number} index - 段落索引
 * @param {boolean} [smooth=true] - 是否平滑滚动
 */
function scrollToSegment(index, smooth = true, retries = 12) {
  const scroller = transcriptScrollerRef.value
  const container = scroller?.$el || null
  if (!container || index < 0) return

  const alignVisibleSegment = el => {
    if (!el) return

    if (isSegmentInView(el, container)) return

    const elRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const elTopInContainer = elRect.top - containerRect.top
    const centerOffset = (container.clientHeight - el.offsetHeight) / 2
    const targetTop =
      container.scrollTop + elTopInContainer - Math.max(centerOffset, scrollPaddingTop)

    markAutoScrolling(smooth)
    container.scrollTo({
      top: targetTop,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }

  const waitForRenderedSegment = (remainingFrames = retries) => {
    const el = getRenderedSegmentElement(container, index)
    if (el) {
      alignVisibleSegment(el)
      return
    }

    if (remainingFrames <= 0) return

    requestAnimationFrame(() => waitForRenderedSegment(remainingFrames - 1))
  }

  const currentEl = getRenderedSegmentElement(container, index)
  if (currentEl) {
    alignVisibleSegment(currentEl)
    return
  }

  markAutoScrolling(false)
  scroller?.scrollToItem?.(index)
  nextTick(() => requestAnimationFrame(() => waitForRenderedSegment()))
}

function setActiveSegment(index, options = {}) {
  const { scroll = followPlayback.value, smooth = true, forceScroll = false } = options
  const changed = index !== activeIndex.value

  if (changed) {
    activeIndex.value = index
  }

  if (!scroll || index < 0 || (!changed && !forceScroll)) return
  nextTick(() => scrollToSegment(index, smooth))
}

function followSegment(index, smooth = false) {
  followPlayback.value = true
  setActiveSegment(index, { scroll: true, smooth, forceScroll: true })
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
  syncDisplayedTime(time)

  setActiveSegment(findSegmentIndex(time))

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
 * @param {number} index - 段落索引
 */
function jumpToSegment(index) {
  playSegmentByIndex(index)
}

/**
 * 设置播放器时间并同步高亮段落
 * @param {number} time - 目标播放时间
 * @param {number} index - 目标段落索引
 * @param {boolean} [shouldPlay=true] - 是否继续播放
 */
function seekToSegment(index, shouldPlay = true) {
  const audio = audioRef.value
  const segment = transcript.value[index]
  if (!audio || !segment) return

  audio.currentTime = segment.begin
  syncDisplayedTime(segment.begin)
  followSegment(index)

  if (shouldPlay) {
    audio.play()
  }
}

/**
 * 按段落索引播放：将播放位置设为该段 begin，更新游标与高亮，并开始播放
 * @param {number} index - 目标段落索引（会被 clamp 到有效范围）
 */
function playSegmentByIndex(index) {
  if (!transcript.value.length) return
  const safeIndex = Math.min(Math.max(index, 0), transcript.value.length - 1)
  seekToSegment(safeIndex)
}

/** 播放上一句：当前为第一句时仍停留在第一句 */
function playPrevSegment() {
  playSegmentByIndex(activeIndex.value <= 0 ? 0 : activeIndex.value - 1)
}

/** 播放下一句：当前为最后一句时不再前进 */
function playNextSegment() {
  playSegmentByIndex(activeIndex.value < 0 ? 0 : activeIndex.value + 1)
}

/** 「回到当前播放位置」：恢复自动跟随，并平滑滚动到当前高亮段落 */
function backToCurrent() {
  const time = audioRef.value?.currentTime || 0
  const index = activeIndex.value >= 0 ? activeIndex.value : findSegmentIndex(time)
  followSegment(index, true)
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

/**
 * 用户拖动进度条结束：根据当前时间用二分查找更新高亮段落与滚动位置
 * 这是用户主动改播放位置的行为，因此会重新进入自动跟随模式
 */
function handleSeeked() {
  const time = audioRef.value?.currentTime || 0
  syncDisplayedTime(time)
  followSegment(findSegmentIndex(time))
}

/**
 * 音频元数据加载完成（如 duration 可用）
 * 根据当前 currentTime 初始化高亮段落（例如初始为 0 时高亮第一段）
 */
function handleLoadedMetadata() {
  const time = audioRef.value?.currentTime || 0
  syncDisplayedTime(time)
  followSegment(findSegmentIndex(time))
}

// ========== 生命周期 ==========

/** 挂载时根据初始时间（通常为 0）设置一次高亮与滚动位置 */
onMounted(() => {
  followSegment(findSegmentIndex(0))
})

/** 卸载前取消同步循环，防止内存泄漏 */
onBeforeUnmount(() => {
  stopSyncLoop()
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
    box-shadow 0.16s ease,
    background-color 0.16s ease,
    border-color 0.16s ease;
  margin-bottom: 14px;
}

.segment:hover {
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
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.16s ease;
}

.playing-tag.visible {
  visibility: visible;
  opacity: 1;
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
