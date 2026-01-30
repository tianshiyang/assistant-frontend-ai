<template>
  <div class="chat-view">
    <div class="messages-box">
      <div v-for="message in messages" :key="message.id" class="message-item">
        <div class="user-question">
          {{ message.question }}
        </div>
        <div class="ai-answer">
          <div v-for="(item, index) in message.messages" :key="index">
            <div v-if="item.type === ChatResponseType.GENERATE">
              {{ item.content }}
            </div>
            <div v-else-if="item.type === ChatResponseType.TOOL">
              AI准备调用工具：{{ item.tool_call }}
            </div>
            <div v-else-if="item.type === ChatResponseType.TOOL_RESULT">
              <div class="message-info">工具返回结果：</div>
              <div class="message-info-item">
                {{ item.content }}
              </div>
            </div>
            <div v-else-if="item.type === ChatResponseType.SAVE_TOKEN">
              <div class="message-info">本次对话token消耗情况如下</div>
              <div class="message-info-item">input_tokens: {{ item.content.input_tokens }}</div>
              <div class="message-info-item">output_tokens: {{ item.content.output_tokens }}</div>
              <div class="message-info-item">total_tokens: {{ item.content.total_tokens }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="input-box">
      <SendMessage :min-rows="2" :max-rows="2" @send="handleSend" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConversationHistory } from '@/api/types/ai'
import { ChatResponseType, type Skill } from '@/api/types/public'
import SendMessage from './sendMessage.vue'

defineProps({
  messages: {
    type: Array as PropType<ConversationHistory[]>,
    required: true,
  },
})

const handleSend = (payload: { question: string; skills?: Skill[] }) => {
  console.log(payload)
}
</script>

<style scoped lang="scss">
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  .messages-box {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    .message-item {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding-bottom: 46px;

      .user-question {
        align-self: flex-end;
        background: rgba(235, 245, 255, 1);
        max-width: 100%;
        width: fit-content;
        line-height: 26px;
        font-size: 16px;
        white-space: pre-wrap;
        word-wrap: break-word;
        border: 1px solid transparent;
        border-radius: 16px;
        padding: 10px 16px;
      }
      .ai-answer {
        margin-top: 20px;
        max-width: 100%;
        line-height: 26px;
        font-size: 16px;
        white-space: pre-wrap;
        word-wrap: break-word;
        padding: 10px 16px;
        .message-info {
          width: fit-content;
          background-color: rgba(6, 10, 38, 0.06);
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 14px;
          color: #999;
        }
        .message-info-item {
          margin-left: 20px;
          font-size: 14px;
          color: #999;
        }
      }
    }
  }
  .input-box {
    :deep(.send-message-box) {
      .input-wrap {
        max-height: 80px;
      }
      width: 100%;
    }
  }
}
</style>
