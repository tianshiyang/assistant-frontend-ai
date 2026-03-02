<template>
  <div class="history-content">
    <div class="history-content-placeholder">
      {{ placeholderText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    placeholderText?: string
  }>(),
  {
    placeholderText: '请从左侧选择一条历史记录，或点击「新会话」开始新对话',
  }
)
</script>

<style scoped lang="scss">
.history-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;

  .history-content-placeholder {
    font-size: 14px;
    color: #999;
    text-align: center;
    padding: 24px;
  }
}
</style>
