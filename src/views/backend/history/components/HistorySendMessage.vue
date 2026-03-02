<template>
  <div class="history-send-box">
    <div class="input-wrap">
      <a-textarea
        v-model:value="question"
        :placeholder="inputPlaceholder"
        :auto-size="{ minRows: 2, maxRows: 4 }"
        :bordered="false"
        class="input-area"
      />
    </div>
    <div class="action-bar">
      <a-button
        v-if="!isConversationLoading"
        type="primary"
        class="send-btn"
        :disabled="!question?.trim()"
        @click="handleSend"
      >
        <ArrowUpOutlined />
      </a-button>
      <a-button v-else type="primary" class="send-btn" @click="handleStop">
        <PauseOutlined />
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowUpOutlined, PauseOutlined } from '@ant-design/icons-vue'

withDefaults(
  defineProps<{
    isConversationLoading: boolean
    inputPlaceholder?: string
  }>(),
  {
    inputPlaceholder: '你可以向我询问数据相关的问题，比如：系统中可用的商品有哪些',
  }
)

const emit = defineEmits<{
  send: [payload: { question: string }]
  stop: []
}>()

const question = ref('')

const handleSend = () => {
  const q = question.value.trim()
  if (!q) return
  question.value = ''
  emit('send', { question: q })
}

const handleStop = () => {
  emit('stop')
}
</script>

<style scoped lang="scss">
.history-send-box {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 28px;
  background: #fff;
}

.input-wrap {
  padding: 12px;
}

.input-area {
  width: 100%;
  resize: none;
  font-size: 16px;

  &::placeholder {
    color: #9ca3af;
  }

  :deep(.ant-input) {
    padding: 0;
  }
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px 12px 16px;
  border-top: 1px solid #f3f4f6;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  background: #6366f1;
  color: #fff;

  &:hover:not(:disabled) {
    background: #4f46e5;
  }
  .anticon {
    font-size: 16px;
  }
}
</style>
