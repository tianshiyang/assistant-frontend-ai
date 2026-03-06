<template>
  <div class="preview-page">
    <div class="preview-left">
      <PreviewThumbnail />
    </div>
    <div class="preview-right">
      <PreviewContent ref="previewContentRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PreviewImageEvent } from '../type'
import PreviewThumbnail from './previewThumbnail.vue'
import PreviewContent from './previewContent.vue'
import emitter from '@/utils/eventBus'

const previewContentRef = ref()

emitter.on('preview-image', (item: PreviewImageEvent) => {
  console.log(item)
  previewContentRef.value.setCurrentFileByIndex(item.index)
})
</script>

<style scoped lang="scss">
.preview-page {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  align-items: stretch;
}

.preview-left {
  position: relative;
  width: 142px;
  flex-shrink: 0;
  align-self: stretch;
  min-height: calc(100vh - 80px);
}

.preview-right {
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: var(--preview-content-bg, #f5f5f5);
}
</style>
