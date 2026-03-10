<template>
  <div class="delimiting">
    <div class="delimiting-toolbar">
      <span class="toolbar-label">标记类型：</span>
      <a-button
        size="small"
        :type="currentLabel === 'evidence' ? 'primary' : 'default'"
        @click="currentLabel = 'evidence'"
      >
        证据
      </a-button>
      <a-button
        size="small"
        :type="currentLabel === 'question' ? 'primary' : 'default'"
        @click="currentLabel = 'question'"
      >
        问题
      </a-button>
      <a-button size="small" type="primary" @click="handleEvaluation"> 评分 </a-button>
    </div>

    <div
      ref="textContainerRef"
      class="text-container"
      :contenteditable="true"
      @mouseup="onTextSelect"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createEvaluation } from './createEvaluation'

type LabelType = 'evidence' | 'question'

interface Props {
  // 要标注的原始文本
  text: string
}

interface Annotation {
  startOffset: number
  endOffset: number
  type: LabelType
  text: string
}

const props = defineProps<Props>()

const textContainerRef = ref<HTMLDivElement>()
const currentLabel = ref<LabelType>('evidence')
const annotations = ref<Annotation[]>([])

const handleEvaluation = () => {
  createEvaluation({
    taskId: '123213',
    onCancel: () => {},
    onConfirm: () => {},
  })
}

const getHighlightColor = (type: LabelType) => {
  if (type === 'evidence') return 'rgba(250, 219, 120, 0.5)' // 黄色：证据
  if (type === 'question') return 'rgba(135, 189, 255, 0.5)' // 蓝色：问题
  return 'transparent'
}

const calculateTextOffset = (container: HTMLElement, node: Node, offset: number) => {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null)
  let currentNode: Node | null = walker.nextNode()
  let total = 0

  while (currentNode && currentNode !== node) {
    total += (currentNode.nodeValue || '').length
    currentNode = walker.nextNode()
  }

  return total + offset
}

const renderTextWithAnnotations = () => {
  const container = textContainerRef.value
  if (!container) return

  const text = container.innerText
  container.innerHTML = ''

  if (!text) return

  const charTypes: (LabelType | null)[] = Array(text.length).fill(null)

  annotations.value.forEach(annotation => {
    for (let i = annotation.startOffset; i < annotation.endOffset; i++) {
      if (i >= 0 && i < charTypes.length) {
        charTypes[i] = annotation.type
      }
    }
  })

  let currentSpan: HTMLSpanElement | null = null
  let lastType: LabelType | null = null
  let buffer = ''

  for (let i = 0; i < text.length; i++) {
    const type = charTypes[i]

    // 第一次或类型变化时，先把之前的 span 输出，再创建新的 span
    if (!currentSpan || type !== lastType) {
      if (currentSpan && buffer) {
        currentSpan.appendChild(document.createTextNode(buffer))
        container.appendChild(currentSpan)
        buffer = ''
      }

      currentSpan = document.createElement('span')
      currentSpan.style.whiteSpace = 'pre-wrap'
      if (type) {
        currentSpan.style.backgroundColor = getHighlightColor(type)
      }
      lastType = type as any
    }

    buffer += text[i]
  }

  if (currentSpan && buffer) {
    currentSpan.appendChild(document.createTextNode(buffer))
    container.appendChild(currentSpan)
  }
}

const onTextSelect = () => {
  const container = textContainerRef.value
  if (!container) return

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  if (!container.contains(range.commonAncestorContainer)) return

  const selectedText = selection.toString()
  if (!selectedText) return

  const startOffset = calculateTextOffset(container, range.startContainer, range.startOffset)
  const endOffset = startOffset + selectedText.length

  annotations.value.push({
    startOffset,
    endOffset,
    type: currentLabel.value,
    text: selectedText,
  })

  renderTextWithAnnotations()
}

onMounted(() => {
  if (textContainerRef.value) {
    textContainerRef.value.innerText = props.text || ''
    annotations.value.push({
      startOffset: 5,
      endOffset: 8,
      type: currentLabel.value,
      text: '',
    })
    renderTextWithAnnotations()
  }
})
</script>

<style scoped lang="scss">
.delimiting {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.delimiting-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.toolbar-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.text-container {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  background: #fff;
  line-height: 1.7;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-y: auto;
  user-select: text;
  outline: none;
}
</style>
