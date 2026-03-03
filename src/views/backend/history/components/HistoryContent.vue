<template>
  <div class="history-content">
    <div class="history-chat">
      <div ref="messagesBoxRef" class="messages-box">
        <template v-if="conversationId === null && !displayRounds.length">
          <div class="history-content-placeholder">
            你可以向我询问数据相关的问题，比如：系统中可用的商品有哪些
          </div>
        </template>
        <template v-else>
          <template v-if="loading">
            <div class="loading-wrap">
              <a-spin size="large" />
            </div>
          </template>
          <template v-else>
            <div
              v-for="(round, roundIndex) in displayRounds"
              :key="roundIndex"
              class="message-item"
            >
              <div class="user-question">{{ round.question }}</div>
              <div class="ai-answer">
                <template v-for="(item, idx) in round.messages" :key="idx">
                  <div
                    v-if="
                      item.type === ManageResponseType.PING && idx === round.messages.length - 1
                    "
                    class="loading-wrap-inline"
                  >
                    <img
                      class="loading-ai-output"
                      src="@/assets/images/loading-agent.gif"
                      alt="加载中"
                    />
                  </div>
                  <div v-else-if="item.type === ManageResponseType.GENERATE" class="generate-block">
                    <template v-if="isTableContent(item.content)">
                      <a-table
                        :columns="getTableColumns(item.content)"
                        :data-source="getTableDataSource(item.content)"
                        :pagination="false"
                      ></a-table>
                    </template>
                    <template v-else-if="isEchartsContent(item.content)">
                      <div
                        :ref="el => initEcharts(el, item.content)"
                        class="echarts-container"
                      ></div>
                    </template>
                    <template v-else>
                      <MdPreview :model-value="String(item.content)" />
                    </template>
                  </div>
                  <div
                    v-else-if="item.type === ManageResponseType.REWRITE_QUESTION_START"
                    class="tool-node"
                  >
                    正在重写问题...
                  </div>
                  <div
                    v-else-if="item.type === ManageResponseType.REWRITE_QUESTION_END"
                    class="tool-node"
                  >
                    重写问题完成：{{ item.content }}
                  </div>

                  <div
                    v-else-if="item.type === ManageResponseType.TOOL_CALL || item.type === 'tool'"
                    class="tool-node"
                  >
                    AI准备调用工具：{{ item.tool_call || item.content }}
                  </div>
                  <div v-else-if="item.type === ManageResponseType.TOOL_PARAMS" class="tool-result">
                    <div class="message-info">工具参数：</div>
                    <div class="message-info-item">
                      <pre>{{ item.content }}</pre>
                    </div>
                  </div>
                  <div v-else-if="item.type === ManageResponseType.TOOL_RESULT" class="tool-result">
                    <div
                      v-show="!getExpanded(item)"
                      class="expand-icon"
                      @click="setExpanded(item, true)"
                    >
                      <DownOutlined />
                    </div>
                    <div
                      v-show="getExpanded(item)"
                      class="expand-icon"
                      @click="setExpanded(item, false)"
                    >
                      <UpOutlined />
                    </div>
                    <div class="message-info">工具执行结果：</div>
                    <div v-if="getExpanded(item)" class="message-info-item">
                      <pre>{{ item.content }}</pre>
                    </div>
                  </div>
                  <div
                    v-else-if="item.type === ManageResponseType.SAVE_TOKEN"
                    class="message-info-block"
                  >
                    <div class="message-info">本次对话token消耗情况如下</div>
                    <div v-if="tokenContent(item)" class="message-info-items">
                      <div class="message-info-item">
                        input_tokens: {{ tokenContent(item)?.input_tokens }}
                      </div>
                      <div class="message-info-item">
                        output_tokens: {{ tokenContent(item)?.output_tokens }}
                      </div>
                      <div class="message-info-item">
                        total_tokens: {{ tokenContent(item)?.total_tokens }}
                      </div>
                    </div>
                  </div>
                  <div v-else-if="item.type === ManageResponseType.ERROR" class="error-block">
                    {{ item.content }}
                  </div>
                  <span
                    v-else-if="
                      [
                        ManageResponseType.DONE,
                        ManageResponseType.CREATE_CONVERSATION,
                        ManageResponseType.REWRITE_QUESTION_START,
                        ManageResponseType.REWRITE_QUESTION_END,
                      ].includes(item.type as ManageResponseType)
                    "
                    class="hide"
                  ></span>
                  <div v-else class="message-info-block">
                    {{ item.content }}
                  </div>
                </template>
              </div>
            </div>
          </template>
        </template>
      </div>
      <div class="input-box">
        <HistorySendMessage
          :is-conversation-loading="isConversationLoading"
          :input-placeholder="inputPlaceholder"
          @send="handleSend"
          @stop="handleStop"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import {
  ManageResponseType,
  type ConversationHistory,
  type ManageConversationMessage,
} from '@/api/types/ai'
import type { StreamResponse } from '@/api/types'
import { getConversationHistoryAPI, manageChatAPI, stopManageChatAPI } from '@/api/module/ai'
import { ChatResponseType } from '@/api/types/public'
import HistorySendMessage from './HistorySendMessage.vue'

const props = withDefaults(
  defineProps<{
    /** null = 仅占位；'' = 新会话可发消息；string = 已选会话 id */
    conversationId: string | null
    /** 底部输入框占位文案 */
    inputPlaceholder?: string
  }>(),
  {
    inputPlaceholder: '请输入你的问题',
  }
)

const emit = defineEmits<{
  'conversation-created': [conversationId: string]
  'get-history-list': []
}>()

const messagesBoxRef = ref<HTMLDivElement>()
const loading = ref(false)
const isConversationLoading = ref(false)

interface DisplayMessage {
  type: string
  content: string | Record<string, unknown>
  tool_call?: string
  _is_expanded?: boolean
}

interface DisplayRound {
  question: string
  messages: DisplayMessage[]
}

const displayRounds = ref<DisplayRound[]>([])

const router = useRouter()

interface StructuredContent {
  type?: string
  columns?: unknown[]
  dataSource?: unknown[]
  echarts_option?: unknown
}

function safeParseContent(content: DisplayMessage['content']): StructuredContent | null {
  if (typeof content !== 'string') return null
  try {
    return JSON.parse(content) as StructuredContent
  } catch {
    return null
  }
}

function isTableContent(content: DisplayMessage['content']): boolean {
  const parsed = safeParseContent(content)
  return (
    parsed?.type === 'table' && Array.isArray(parsed.columns) && Array.isArray(parsed.dataSource)
  )
}

function getTableColumns(content: DisplayMessage['content']): unknown[] {
  const parsed = safeParseContent(content)
  return (parsed?.columns as unknown[]) || []
}

function getTableDataSource(content: DisplayMessage['content']): unknown[] {
  const parsed = safeParseContent(content)
  return (parsed?.dataSource as unknown[]) || []
}

function isEchartsContent(content: DisplayMessage['content']): boolean {
  const parsed = safeParseContent(content)
  return parsed?.type === 'echarts' && !!parsed.echarts_option
}

function getEchartsOption(content: DisplayMessage['content']): EChartsOption | null {
  const parsed = safeParseContent(content)
  if (parsed?.type === 'echarts' && parsed.echarts_option) {
    return parsed.echarts_option as EChartsOption
  }
  return null
}

function initEcharts(el: unknown, content: DisplayMessage['content']) {
  if (!el || !(el instanceof HTMLElement)) return
  const option = getEchartsOption(content)
  if (!option) return

  const tryInit = (retry = 0) => {
    // 容器宽高为 0 时，ECharts 会报错，这里延迟到有实际尺寸再初始化
    if (el.clientWidth === 0 || el.clientHeight === 0) {
      if (retry >= 10) return
      window.requestAnimationFrame(() => tryInit(retry + 1))
      return
    }
    const chart = echarts.init(el)
    chart.setOption(option)
  }

  tryInit()
}

function tokenContent(item: DisplayMessage): Record<string, number> | null {
  const c = item.content
  if (typeof c === 'object' && c != null && 'input_tokens' in c) {
    return c as Record<string, number>
  }
  return null
}

function getExpanded(item: DisplayMessage): boolean {
  return !!item._is_expanded
}

function setExpanded(item: DisplayMessage, v: boolean) {
  item._is_expanded = v
}

/** 将聊天页用的会话历史（按轮次）转为展示数据，合并每轮内的 generate */
function conversationHistoryToRounds(list: ConversationHistory[]): DisplayRound[] {
  return list.map(item => {
    const merged: DisplayMessage[] = []
    let lastGen: DisplayMessage | null = null
    for (const m of item.messages || []) {
      const type = String((m as { type?: string }).type ?? '')
      if (type === ManageResponseType.PING) continue
      const content = (m as { content?: string | Record<string, unknown> }).content
      if (type === ManageResponseType.GENERATE) {
        const str = typeof content === 'string' ? content : String(content ?? '')
        if (lastGen) {
          lastGen.content = String(lastGen.content || '') + str
        } else {
          lastGen = { type: ManageResponseType.GENERATE, content: str }
          merged.push(lastGen)
        }
      } else {
        lastGen = null
        const msg: DisplayMessage = {
          type,
          content: content ?? '',
          tool_call: (m as { tool_call?: string }).tool_call,
          _is_expanded: (m as { _is_expanded?: boolean })._is_expanded,
        }
        if (type === ManageResponseType.CREATE_CONVERSATION) {
          router.push({
            name: 'manageHistoryList',
            params: {
              conversation_id: msg.content as string,
            },
          })
          emit('get-history-list')
        } else if (type === ManageResponseType.TOOL_RESULT && typeof msg.content === 'string') {
          try {
            msg.content = JSON.parse(msg.content) as Record<string, unknown>
          } catch {
            /* keep string */
          }
        }
        merged.push(msg)
      }
    }
    return { question: item.question || '', messages: merged }
  })
}

/** 将扁平消息流转为按轮次展示：按 create_conversation 分组，合并 generate */
function flatToRounds(list: ManageConversationMessage[]): DisplayRound[] {
  const rounds: DisplayRound[] = []
  let current: DisplayMessage[] = []
  let currentQuestion = ''

  function flush() {
    if (current.length > 0 || currentQuestion) {
      const merged: DisplayMessage[] = []
      let lastGen: DisplayMessage | null = null
      for (const m of current) {
        if (m.type === ManageResponseType.GENERATE) {
          const content = typeof m.content === 'string' ? m.content : String(m.content ?? '')
          if (lastGen) {
            lastGen.content = String(lastGen.content || '') + content
          } else {
            lastGen = { type: ManageResponseType.GENERATE, content, _is_expanded: m._is_expanded }
            merged.push(lastGen)
          }
        } else {
          lastGen = null
          if (m.type === ManageResponseType.TOOL_RESULT && typeof m.content === 'string') {
            try {
              merged.push({ ...m, content: JSON.parse(m.content) as Record<string, unknown> })
            } catch {
              merged.push({ ...m })
            }
          } else {
            merged.push({ ...m })
          }
        }
      }
      rounds.push({ question: currentQuestion, messages: merged })
    }
    current = []
    currentQuestion = ''
  }

  for (const m of list) {
    const type = String(m.type as unknown as string)
    if (type === ManageResponseType.PING) {
      continue
    }
    if (type === ManageResponseType.CREATE_CONVERSATION) {
      flush()
      continue
    }
    if (type === ManageResponseType.REWRITE_QUESTION_END) {
      currentQuestion = typeof m.content === 'string' ? m.content : String(m.content ?? '')
      continue
    }
    if (type === ManageResponseType.REWRITE_QUESTION_START) continue
    current.push({
      type,
      content: m.content,
      tool_call: m.tool_call,
      _is_expanded: m._is_expanded,
    })
  }
  flush()
  return rounds
}

async function loadMessages() {
  if (!props.conversationId || props.conversationId === '') return
  loading.value = true
  try {
    const res = await getConversationHistoryAPI({ conversation_id: props.conversationId })
    const list = Array.isArray(res) ? res : []
    // 后端与聊天页共用接口，返回 ConversationHistory[]（每轮 question + messages）
    const isConversationHistory =
      list.length > 0 &&
      typeof (list[0] as ConversationHistory).question === 'string' &&
      Array.isArray((list[0] as ConversationHistory).messages)
    displayRounds.value = isConversationHistory
      ? conversationHistoryToRounds(list as ConversationHistory[])
      : flatToRounds(list as unknown as ManageConversationMessage[])
    scrollToBottom()
  } finally {
    loading.value = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    const el = messagesBoxRef.value
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  })
}

function handleSend(payload: { question: string }) {
  const cid = props.conversationId ?? ''
  displayRounds.value.push({
    question: payload.question,
    messages: [],
  })
  scrollToBottom()
  isConversationLoading.value = true

  manageChatAPI(
    {
      conversation_id: cid || undefined,
      query: payload.question,
    },
    {
      onmessage: (event: StreamResponse) => {
        const last = displayRounds.value[displayRounds.value.length - 1]
        if (!last) return

        if (event.type === ChatResponseType.DONE) {
          loadMessages()
        }

        // 心跳消息，管理端不展示
        if (event.type === ChatResponseType.PING) {
          return
        }

        if (event.type === ChatResponseType.CREATE_CONVERSATION) {
          const newId = typeof event.content === 'string' ? event.content : ''
          if (newId) emit('conversation-created', newId)
          return
        }

        const push = () => {
          last.messages.push({
            type: event.type,
            content: event.content,
            tool_call: event.tool_call,
            _is_expanded: event._is_expanded,
          })
        }

        if (event.type === ChatResponseType.GENERATE) {
          const prev = last.messages[last.messages.length - 1]
          if (prev?.type === 'generate') {
            prev.content = String(prev.content || '') + String(event.content || '')
          } else {
            push()
          }
        } else {
          push()
        }

        if (
          [ChatResponseType.DONE, ChatResponseType.STOP, ChatResponseType.ERROR].includes(
            event.type
          )
        ) {
          isConversationLoading.value = false
        }
        if (event.type === ChatResponseType.DONE) {
          loadMessages()
        }
        scrollToBottom()
      },
      onerror: () => {
        isConversationLoading.value = false
      },
      onclose: () => {
        isConversationLoading.value = false
      },
    }
  )
}

async function handleStop() {
  const cid = props.conversationId
  if (cid && cid !== '') {
    await stopManageChatAPI({ conversation_id: cid })
  }
  isConversationLoading.value = false
}

watch(
  () => props.conversationId,
  id => {
    if (id && id !== '') loadMessages()
    else displayRounds.value = []
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.history-content {
  min-height: 200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.history-content-placeholder {
  height: 100%;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  padding: 24px;
}

.history-chat {
  display: flex;
  flex-direction: column;
  min-height: 200px;
  flex: 1;
}

.messages-box {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.loading-wrap-inline {
  margin-top: 10px;
}
.loading-ai-output {
  width: 32px;
  height: 32px;
}

.message-item {
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
    border-radius: 16px;
    padding: 10px 16px;
    margin-left: auto;
  }
  .ai-answer {
    margin-top: 20px;
    max-width: 100%;
    line-height: 26px;
    font-size: 16px;
    white-space: pre-wrap;
    word-wrap: break-word;
    padding: 10px 16px;
  }
}

.tool-node {
  background-color: #f5f5f5;
  padding: 10px 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  width: fit-content;
}
.task-stop-node {
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 16px;
  margin-bottom: 12px;
  width: fit-content;
  color: #ff4d4f;
  font-size: 14px;
  border: 1px solid #ff4d4f;
}
.tool-result {
  position: relative;
  background-color: #f5f5f5;
  padding: 10px 16px;
  border-radius: 16px;
  margin-bottom: 12px;
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
  font-size: 14px;
  color: #333;
}
.message-info-item {
  margin-top: 10px;
  margin-left: 20px;
  font-size: 14px;
  color: #666;
  pre {
    margin: 0;
    white-space: pre-wrap;
  }
}
.message-info-block {
  margin-bottom: 12px;
}
.error-block {
  color: #ff4d4f;
  margin-bottom: 12px;
}
.generate-block {
  margin-top: 10px;
}
.echarts-container {
  width: 100%;
  height: 400px;
}
.hide {
  display: none;
}

.input-box {
  width: 100%;
  flex-shrink: 0;
  padding: 16px 0 0;
}

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
}
</style>
