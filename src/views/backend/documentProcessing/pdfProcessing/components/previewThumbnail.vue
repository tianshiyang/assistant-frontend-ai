<template>
  <div class="thumbnail-container">
    <RecycleScroller
      key="thumbnail-scroller"
      v-slot="{ item, index }"
      class="thumbnail-scroller"
      :items="list"
      :item-size="itemSize"
      key-field="id"
    >
      <div class="thumbnail-item">
        <img
          :key="item.id"
          :src="item.ossUrl"
          :alt="`第 ${item.pageNo} 页`"
          class="thumbnail-img"
          loading="lazy"
          decoding="async"
          @click="handleClick(item, index)"
        />
        <span class="thumbnail-page-no">{{ item.pageNo }}</span>
      </div>
    </RecycleScroller>
  </div>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import { pdfImageList } from '@/views/backend/documentProcessing/data/pdfImageList'
import emitter from '@/utils/eventBus'
import type { PreviewImageEvent } from '../type'

const list = pdfImageList
const itemSize = 112

const handleClick = (item: any, index: number) => {
  emitter.emit('preview-image', {
    pdfId: item.id,
    index,
  } as PreviewImageEvent)
}
</script>

<style scoped lang="scss">
.thumbnail-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 142px;
  // min-height: 400px;
  overflow: hidden;
  background: var(--thumbnail-bg, #fafafa);
}

/* RecycleScroller 根元素必须有固定高度 + overflow-y:auto 才能虚拟滚动，用 :deep 作用到子组件根 */
:deep(.thumbnail-scroller) {
  height: 100% !important;
  overflow-y: auto !important;
}

.thumbnail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 112px;
  cursor: pointer;
  padding: 4px 0;
  box-sizing: border-box;
}

.thumbnail-img {
  width: 76px;
  height: 104px;
  object-fit: contain;
  display: block;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  &:hover {
    box-shadow: 0 1px 2px #1890ff;
  }
}

.thumbnail-page-no {
  margin-top: 4px;
  font-size: 12px;
  color: var(--thumbnail-page-color, rgba(0, 0, 0, 0.45));
}
</style>
