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
      <div class="page-item">
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
import { pdfImageList } from '@/views/backend/documentProcessing/data/pdfImageList'

const list = pdfImageList
// 单页高度预估值（图片高度 + 上下间距），用于虚拟列表 item-size
const itemSize = 920
// 上下各缓冲 10 个元素，对应像素缓冲区
const buffer = itemSize * 10

// 当前视窗中主要渲染的文件索引 & 详情
const currentFile = ref()

const scrollerRef = ref()

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

  setCurrentFileByIndex(bestIndex)
}

defineExpose({
  setCurrentFileByIndex,
})
</script>

<style scoped lang="scss">
.preview-content {
  height: calc(100vh - 80px);
}

.preview-scroller {
  height: 100%;
  overflow-y: auto;
}

.page-item {
  padding: 16px 0;
  display: flex;
  justify-content: center;
}

.page-img {
  max-width: 100%;
  height: auto;
  display: block;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
