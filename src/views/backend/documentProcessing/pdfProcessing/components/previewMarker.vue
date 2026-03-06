<template>
  <div class="preview-marker">
    <div
      v-for="item in annotationList"
      :key="item.id"
      :style="{
        top: item.positionTop + '%',
        left: item.positionLeft + '%',
        width: item.positionWidth + '%',
        height: item.positionHeight + '%',
      }"
      class="preview-marker-item"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  annotationList: Array<any>
}>()
</script>

<style scoped lang="scss">
.preview-marker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: cell;
}

.preview-marker-item {
  position: absolute;
  box-sizing: border-box;
  border: 1px solid #ff4d4f; // 矩形边框
  background-color: rgba(255, 77, 79, 0.15); // 半透明填充（不需要可去掉）
  pointer-events: none;
}
</style>
