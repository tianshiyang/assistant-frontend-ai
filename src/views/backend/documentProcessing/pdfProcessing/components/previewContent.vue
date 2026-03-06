<template>
  <div class="preview-content">
    <RecycleScroller
      v-slot="{ item }"
      ref="scrollerRef"
      class="preview-scroller"
      :items="list"
      :item-size="itemSize"
      key-field="id"
      :buffer="buffer"
      @scroll.passive="handleScroll"
    >
      <div
        class="page-item"
        :style="{
          transform: `rotate(${rotate}deg) scale(${zoom})`,
        }"
        @mousedown="handleMouseDown($event, item.id)"
        @mousemove="handleMouseMove($event, item.id)"
        @mouseup="handleMouseUp($event)"
      >
        <!-- 新增标记：当前拖拽中的矩形高亮 -->
        <div
          v-if="selectionRect && selectionRect.pageId === item.id"
          class="selection-marker"
          :style="{
            top: `${selectionRect.positionTop}%`,
            left: `${selectionRect.positionLeft}%`,
            width: `${selectionRect.positionWidth}%`,
            height: `${selectionRect.positionHeight}%`,
          }"
        ></div>

        <PreviewMarker :annotation-list="getCurrentFileAnnotation(item.id)" />
        <img
          :key="item.id"
          :src="item.ossUrl"
          :alt="`第 ${item.pageNo} 页`"
          class="page-img"
          loading="lazy"
          decoding="async"
        />
      </div>
    </RecycleScroller>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import {
  pdfImageList,
  pdfImageListWithAnnotations,
} from '@/views/backend/documentProcessing/data/pdfImageList'
import PreviewMarker from './previewMarker.vue'
import emitter from '@/utils/eventBus'

const rotate = ref(0)

const zoom = ref(1)

emitter.on('rotate', () => {
  rotate.value = rotate.value + 90
})

emitter.on('zoom-in', () => {
  zoom.value = zoom.value + 0.1
})

emitter.on('zoom-out', () => {
  zoom.value = zoom.value - 0.1
})

const list = pdfImageList
// 单页高度预估值（图片高度 + 上下间距），用于虚拟列表 item-size
const itemSize = 920
// 上下各缓冲 10 个元素，对应像素缓冲区
const buffer = itemSize * 3

// 当前视窗中主要渲染的文件索引 & 详情
const currentFile = ref(list[0])

const scrollerRef = ref()

const getCurrentFileAnnotation = computed(() => (id: string) => {
  return (
    pdfImageListWithAnnotations.find(item => item.evidenceAnnotationList?.[0]?.filePageId === id)
      ?.evidenceAnnotationList || []
  )
})

const setCurrentFileByIndex = (index: number) => {
  currentFile.value = list[index]
  scrollerRef.value.scrollToItem(index)
}

function handleScroll(event: Event) {
  const el = event.target as HTMLElement | null
  if (!el) return

  const scrollTop = el.scrollTop
  const viewportHeight = el.clientHeight
  if (!viewportHeight || !itemSize) return

  const viewportTop = scrollTop
  const viewportBottom = scrollTop + viewportHeight

  // 以视窗中点对应的索引为中心，向上下各扩展 10 个元素做精确计算
  const roughIndex = Math.floor((viewportTop + viewportHeight / 2) / itemSize)
  const start = Math.max(0, roughIndex - 10)
  const end = Math.min(list.length - 1, roughIndex + 10)

  let bestIndex = start
  let bestRatio = 0

  for (let i = start; i <= end; i++) {
    const top = i * itemSize
    const bottom = top + itemSize
    const intersection = Math.min(bottom, viewportBottom) - Math.max(top, viewportTop)
    const ratio = intersection / itemSize

    if (ratio > bestRatio) {
      bestRatio = ratio
      bestIndex = i
    }
  }

  // 只更新当前文件，不要调用 scrollToItem，否则会覆盖用户滚动
  currentFile.value = list[bestIndex]
}

interface DragState {
  pageId: string
  startX: number
  startY: number
  rect: DOMRect
}

interface SelectionRect {
  pageId: string
  positionTop: number
  positionLeft: number
  positionWidth: number
  positionHeight: number
}

const dragState = ref<DragState | null>(null)
const selectionRect = ref<SelectionRect | null>(null)

const handleMouseDown = (e: MouseEvent, id: string) => {
  const target = e.currentTarget as HTMLElement | null
  if (!target) return

  const rect = target.getBoundingClientRect()
  dragState.value = {
    pageId: id,
    rect,
    startX: e.clientX - rect.left,
    startY: e.clientY - rect.top,
  }
  // 开始拖拽时先清空上一段选区
  selectionRect.value = null
}

const handleMouseMove = (e: MouseEvent, id: string) => {
  const state = dragState.value
  if (!state || state.pageId !== id) return

  const { rect, startX, startY } = state
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top

  const left = Math.min(startX, currentX)
  const top = Math.min(startY, currentY)
  const width = Math.abs(currentX - startX)
  const height = Math.abs(currentY - startY)

  // 忽略几乎没有拖动的情况（单击）
  if (width < 2 || height < 2) {
    selectionRect.value = null
    return
  }

  const positionLeft = (left / rect.width) * 100
  const positionTop = (top / rect.height) * 100
  const positionWidth = (width / rect.width) * 100
  const positionHeight = (height / rect.height) * 100

  selectionRect.value = {
    pageId: id,
    positionTop,
    positionLeft,
    positionWidth,
    positionHeight,
  }
}

const handleMouseUp = (e: MouseEvent) => {
  const state = dragState.value
  dragState.value = null

  if (!state) return

  const { rect, startX, startY, pageId } = state
  const endX = e.clientX - rect.left
  const endY = e.clientY - rect.top

  const left = Math.min(startX, endX)
  const top = Math.min(startY, endY)
  const width = Math.abs(endX - startX)
  const height = Math.abs(endY - startY)

  // 忽略几乎没有拖动的情况（单击）
  if (width < 2 || height < 2) {
    selectionRect.value = null
    return
  }

  const positionLeft = (left / rect.width) * 100
  const positionTop = (top / rect.height) * 100
  const positionWidth = (width / rect.width) * 100
  const positionHeight = (height / rect.height) * 100

  // 最终选中区域的百分比位置（相对当前页容器）
  selectionRect.value = {
    pageId,
    positionTop,
    positionLeft,
    positionWidth,
    positionHeight,
  }

  // 你可以在这里把 selectionRect.value 推送到标注列表 / 发送给后端
  console.log('final selection rect percent', selectionRect.value)
}

defineExpose({
  setCurrentFileByIndex,
})
</script>

<style scoped lang="scss">
.preview-content {
  height: calc(100vh - 80px);
  overflow-y: auto;
}

.preview-scroller {
  height: 100%;
  overflow-y: auto;
}

.page-item {
  padding: 16px 0;
  display: flex;
  justify-content: center;
  position: relative;
}

.page-img {
  max-width: 100%;
  height: auto;
  display: block;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.selection-marker {
  position: absolute;
  box-sizing: border-box;
  border: 2px solid #ff4d4f;
  background-color: rgba(255, 77, 79, 0.15);
  pointer-events: none;
}
</style>
