<template>
  <div class="chat-view">
    <div ref="messagesBoxRef" class="messages-box">
      <div v-for="message in messages" :key="message.id" class="message-item">
        <div class="user-question">
          {{ message.question }}
        </div>
        <div class="ai-answer">
          <div v-for="(item, index) in message.messages" :key="index">
            <div
              v-if="item.type === ChatResponseType.PING && index === message.messages.length - 1"
            >
              <!-- 最后一条消息展示loading动画 -->
              <img class="loading-ai-output" src="@/assets/images/loading-agent.gif" alt="加载中" />
            </div>
            <div v-if="item.type === ChatResponseType.GENERATE" style="margin-top: 10px">
              <MdPreview :model-value="item.content" />
            </div>
            <div v-else-if="item.type === ChatResponseType.GET_TOOLS" class="tool-node">
              正在获取所有可用工具
            </div>
            <div v-else-if="item.type === ChatResponseType.TOOL" class="tool-node">
              AI准备调用工具：{{ item.tool_call }}
            </div>
            <div v-else-if="item.type === ChatResponseType.TOOL_RESULT" class="tool-result">
              <div v-if="!item._is_expanded" class="expand-icon" @click="item._is_expanded = true">
                <DownOutlined />
              </div>
              <div v-else class="expand-icon" @click="item._is_expanded = false">
                <UpOutlined />
              </div>
              <div class="message-info">工具执行结果：</div>

              <template v-if="item._is_expanded">
                <div class="message-inf“o-item">
                  <template v-if="item.content.tool_process_type === 'search'">
                    <div
                      v-for="(searchItem, searchIndex) in item.content.tool_process_content"
                      :key="searchIndex"
                    >
                      <div>{{ searchItem.content }}</div>
                      <div class="search-item-source">
                        <span>---- 参考来源：</span>
                        <a-button type="link" @click="handleOpenSearchItem(searchItem.url)">
                          {{ searchItem.title }}
                        </a-button>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
            </div>
            <div v-else-if="item.type === ChatResponseType.SAVE_TOKEN">
              <div class="message-info">本次对话token消耗情况如下</div>
              <div class="message-info-item">input_tokens: {{ item.content.input_tokens }}</div>
              <div class="message-info-item">output_tokens: {{ item.content.output_tokens }}</div>
              <div class="message-info-item">total_tokens: {{ item.content.total_tokens }}</div>
            </div>
            <div v-else-if="item.type === ChatResponseType.ERROR">
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="questions.length" class="questions-box">
        <div
          v-for="question in questions"
          :key="question"
          class="question-item"
          @click="handleSend({ question, skills: currentSkills })"
        >
          {{ question }}
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
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  messages: {
    type: Array as PropType<ConversationHistory[]>,
    required: true,
  },
  questions: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})

const emit = defineEmits<{
  send: [payload: { question: string; skills?: Skill[] }]
}>()

const handleOpenSearchItem = (url: string) => {
  window.open(url, '_blank')
}

const currentSkills = ref<Skill[]>([])

const handleSend = (payload: { question: string; skills?: Skill[] }) => {
  currentSkills.value = payload.skills || []
  emit('send', payload)
}

const messagesBoxRef = useTemplateRef<HTMLDivElement>('messagesBoxRef')

const scrollToBottom = () => {
  nextTick(() => {
    const el = messagesBoxRef.value
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  })
}

watch(
  () => props.messages,
  () => scrollToBottom(),
  { deep: true }
)

watch(
  () => props.questions,
  () => scrollToBottom(),
  { deep: true }
)
</script>

<style scoped lang="scss">
:deep(.md-editor-preview) {
  p,
  ul,
  ol {
    margin-top: 0;
    margin-bottom: 0;
  }
  li {
    margin: 0;
    line-height: initial;
  }
  p:first-child {
    margin-top: 0;
  }
  p:last-child {
    margin-bottom: 0;
  }
  li:first-child {
    margin-top: 0;
  }
  li:last-child {
    margin-bottom: 0;
  }
}
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
      padding-bottom: 20px;

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
        .loading-ai-output {
          width: 32px;
          height: 32px;
          margin-bottom: 10px;
        }
        .tool-node {
          background-color: #f5f5f5;
          padding: 10px 16px;
          border-radius: 16px;
          margin-bottom: 20px;
          width: fit-content;
        }
        .tool-result {
          position: relative;
          background-color: #f5f5f5;
          padding: 10px 16px;
          border-radius: 16px;
          margin-bottom: 20px;
          .expand-icon {
            position: absolute;
            right: 10px;
            top: 10px;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            cursor: pointer;
            &:hover {
              background-color: #e5e5e5;
              color: #1677ff;
            }
          }
        }
        .message-info {
          width: 100%;
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 14px;
          color: #333;
        }
        .message-info-item {
          margin-top: 10px;
          margin-left: 20px;
          font-size: 14px;
          color: #999;
          .search-item-source {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            .ant-btn {
              margin: 0;
              padding: 0;
            }
            text-align: right;
          }
        }
      }
    }
  }
  .questions-box {
    margin-left: 20px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    .question-item {
      cursor: pointer;
      width: fit-content;
      display: flex;
      align-items: center;
      border: 1px solid rgba(6, 10, 38, 0.06);
      background-color: #fff;
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 16px;
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
