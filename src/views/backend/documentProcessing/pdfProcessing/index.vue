<template>
  <div class="container">
    <div class="operation">
      <!-- 操作栏 -->
      <Operation />
      <!-- 预览区域 -->
      <div class="preview">
        <Preview />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Operation from './components/operation.vue'
import Preview from './components/preview.vue'
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow: hidden;
}
.operation {
  flex-shrink: 0;
}
.preview {
  flex: 1;
  min-height: 0;
  display: flex;
}
</style>
