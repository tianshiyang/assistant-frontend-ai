<template>
  <div class="send-message-box">
    <div class="input-wrap">
      <a-textarea
        v-model:value="selectConfig.question"
        placeholder="向AI助手提问"
        :auto-size="{ minRows, maxRows }"
        :bordered="false"
        class="input-area"
      />
    </div>
    <div class="action-bar">
      <div class="action-left">
        <a-button
          v-for="item in skillList"
          :key="item.value"
          class="skill-btn"
          :type="selectConfig.skills.includes(item.value) ? 'primary' : 'default'"
          @click="selectSkill(item)"
        >
          <span class="skill-label">{{ item.label }}</span>
        </a-button>
      </div>
      <div class="action-right">
        <a-button
          type="primary"
          class="send-btn"
          :disabled="!selectConfig.question?.trim()"
          @click="handleSend"
        >
          <ArrowUpOutlined />
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpOutlined } from '@ant-design/icons-vue'
import { getSkillsDictAPI } from '@/api/module/public'
import type { Skill, SkillItem } from '@/api/types/public'

defineProps({
  minRows: {
    type: Number,
    default: 3,
  },
  maxRows: {
    type: Number,
    default: 3,
  },
})

const emit = defineEmits<{
  send: [payload: { question: string; skills?: Skill[] }]
}>()

// 选择的配置信息
const selectConfig = reactive({
  question: '',
  skills: [] as Skill[],
})

const skillList = ref<SkillItem[]>([])

// 选择技能
const selectSkill = (item: SkillItem) => {
  if (selectConfig.skills.includes(item.value)) {
    selectConfig.skills = selectConfig.skills.filter(s => s !== item.value)
  } else {
    selectConfig.skills.push(item.value)
  }
}

const handleSend = () => {
  emit('send', { question: selectConfig.question, skills: selectConfig.skills })
}

// 获取技能列表
const getSkillsDict = async () => {
  const res = await getSkillsDictAPI()
  skillList.value = res
}

// 初始化
getSkillsDict()
</script>

<style scoped lang="scss">
.send-message-box {
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
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 12px 16px;
  border-top: 1px solid #f3f4f6;
}

.action-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-btn {
  height: 32px;
  padding: 0 12px;

  .skill-label {
    margin-right: 2px;
  }

  .skill-arrow {
    font-size: 10px;
    margin-left: 2px;
  }
}

.action-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-wrap,
.attach-wrap {
  overflow: auto;
  display: inline-flex;
  align-items: center;
  color: #9ca3af;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    color: #6b7280;
  }
}

.attach-wrap {
  gap: 4px;
  font-size: 14px;

  .attach-count {
    font-size: 12px;
    color: #9ca3af;
  }
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
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #4f46e5;
  }

  .anticon {
    font-size: 16px;
  }
}
</style>
