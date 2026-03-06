<template>
  <div class="preview-page">
    <div class="preview-left">
      <PreviewThumbnail />
    </div>
    <div class="preview-right">
      <!-- PDF 预览区域 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import PreviewThumbnail from './previewThumbnail.vue'
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
