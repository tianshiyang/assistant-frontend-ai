<template>
  <div class="interaction-block">
    <div
      v-for="(interaction, interactionIndex) in interactions"
      :key="interactionIndex"
      class="interaction-item"
    >
      <a-textarea
        :value="getInteractionText(interactionIndex, interaction)"
        :auto-size="{ minRows: 3, maxRows: 10 }"
        :readonly="!isInteractionEditing(interactionIndex)"
        :disabled="interactionType !== 'default'"
        @update:value="(val: string) => updateInteractionText(interactionIndex, val, interaction)"
      />
      <div v-if="interactionType === 'default'" class="interaction-actions">
        <a-button type="primary" size="small" @click="handleAgree(interactionIndex, interaction)">
          同意
        </a-button>
        <a-button
          danger
          size="small"
          class="interaction-btn"
          @click="handleReject(interactionIndex, interaction)"
        >
          拒绝
        </a-button>
        <a-button
          size="small"
          class="interaction-btn"
          @click="toggleInteractionEdit(interactionIndex, interaction)"
        >
          {{ isInteractionEditing(interactionIndex) ? '完成编辑' : '编辑' }}
        </a-button>
      </div>
      <div class="interaction-actions">
        <a-tag :color="interactionType === 'reject' ? 'red' : 'green'" size="small">
          {{ interactionType === 'approve' ? '已同意' : '已拒绝' }}
        </a-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits(['manage-interaction-action'])

const props = defineProps<{
  conversationId: string | null
  roundIndex: number
  messageIndex: number
  content: unknown
  message_id: string
  interactionType: 'default' | 'approve' | 'reject'
}>()

interface InteractionEditState {
  editing: boolean
  text: string
}

const editState = ref<Record<number, InteractionEditState>>({})

const interactions = computed(() => {
  if (Array.isArray(props.content)) return props.content
  return []
})

function buildDisplayText(interaction: unknown): string {
  const i = interaction as { args?: unknown }
  const args = i?.args ?? interaction
  if (typeof args === 'string') return args
  if (args && typeof args === 'object' && 'query' in (args as Record<string, unknown>)) {
    const q = (args as { query?: unknown }).query
    if (typeof q === 'string') return q
  }
  try {
    return JSON.stringify(args, null, 2)
  } catch {
    return String(args ?? '')
  }
}

function getInteractionText(index: number, interaction: unknown): string {
  const state = editState.value[index]
  if (state) return state.text
  return buildDisplayText(interaction)
}

function isInteractionEditing(index: number): boolean {
  return !!editState.value[index]?.editing
}

function updateInteractionText(index: number, value: string, interaction: unknown) {
  const state = editState.value[index]
  if (state) {
    state.text = value
  } else {
    editState.value[index] = {
      editing: true,
      text: value || buildDisplayText(interaction),
    }
  }
}

type InteractionAction = 'approve' | 'reject'

function emitInteractionAction(
  action: InteractionAction,
  interactionIndex: number,
  interaction: unknown
) {
  const text = getInteractionText(interactionIndex, interaction)
  emit('manage-interaction-action', {
    action,
    conversationId: props.conversationId,
    message_id: props.message_id,
    roundIndex: props.roundIndex,
    messageIndex: props.messageIndex,
    interactionIndex,
    rawInteraction: interaction,
    text,
  })
}

function handleAgree(index: number, interaction: unknown) {
  emitInteractionAction('approve', index, interaction)
}

function handleReject(index: number, interaction: unknown) {
  emitInteractionAction('reject', index, interaction)
}

function toggleInteractionEdit(index: number, interaction: unknown) {
  const state = editState.value[index]
  if (state) {
    state.editing = !state.editing
  } else {
    editState.value[index] = {
      editing: true,
      text: buildDisplayText(interaction),
    }
  }
}
</script>

<style scoped lang="scss">
.interaction-block {
  margin-top: 10px;
}
.interaction-item {
  margin-bottom: 12px;
}
.interaction-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.interaction-btn {
  margin-left: 0;
}
</style>
