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
          <template #icon>
            <i :class="['skill-icon', 'iconfont', item.icon]"></i>
          </template>
          <span class="skill-label">{{ item.label }}</span>
        </a-button>
      </div>
      <div class="action-right">
        <a-button
          v-if="!isConversationLoading"
          type="primary"
          class="send-btn"
          :disabled="!selectConfig.question?.trim()"
          @click="handleSend"
        >
          <ArrowUpOutlined />
        </a-button>
        <a-button v-else type="primary" class="send-btn" @click="handleStopConversation">
          <PauseOutlined />
        </a-button>
      </div>
    </div>
  </div>

  <!-- 选择知识库 -->
  <ChooseDataset v-model="skillModelData.chooseDatasetModel" @ok="handleChooseDataset" />
</template>

<script setup lang="ts">
import { ArrowUpOutlined, PauseOutlined } from '@ant-design/icons-vue'
import { Skill, SKILL_LABEL, type SkillItem } from '@/api/types/public'
import ChooseDataset from '@/components/skills/chooseDataset.vue'

defineProps({
  minRows: {
    type: Number,
    default: 3,
  },
  maxRows: {
    type: Number,
    default: 3,
  },
  isConversationLoading: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits<{
  send: [payload: { question: string; skills?: Skill[]; datasetIds?: string[] }]
  stop: []
}>()

// 选择的配置信息
const selectConfig = reactive({
  question: '',
  skills: [] as Skill[],
})

const skillList: SkillItem[] = [
  {
    label: SKILL_LABEL[Skill.DATASET_RETRIEVER],
    value: Skill.DATASET_RETRIEVER,
    icon: 'icon-aizhishiku',
  }, // 知识库检索
  {
    label: SKILL_LABEL[Skill.WEB_SEARCH],
    value: Skill.WEB_SEARCH,
    icon: 'icon-aihulianwang',
  }, // 联网搜索
]

const skillModelData = ref({
  chooseDatasetModel: false,
})

// 选择技能
const selectSkill = (item: SkillItem) => {
  if (item.value === Skill.DATASET_RETRIEVER) {
    // 选择知识库
    skillModelData.value.chooseDatasetModel = true
    return
  } else if (item.value === Skill.WEB_SEARCH) {
    // 选择联网搜索
    selectConfig.skills = selectConfig.skills.filter(item => item !== Skill.DATASET_RETRIEVER)
    selectConfig.skills.push(Skill.WEB_SEARCH)
    return
  }
}

// 选择知识库
const handleChooseDataset = (value: string[]) => {
  skillsParams.datasetIds = value
  if (value.length) {
    selectConfig.skills = selectConfig.skills.filter(item => item !== Skill.WEB_SEARCH)
    selectConfig.skills.push(Skill.DATASET_RETRIEVER)
  } else {
    selectConfig.skills = selectConfig.skills.filter(item => item !== Skill.DATASET_RETRIEVER)
  }
}

// 选择技能的参数
const skillsParams = reactive({
  datasetIds: [] as string[],
})

const handleSend = () => {
  const question = selectConfig.question.trim()
  const skills = selectConfig.skills
  selectConfig.question = ''
  emit('send', { question, skills, datasetIds: skillsParams.datasetIds })
}

const handleStopConversation = () => {
  emit('stop')
}
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
  .skill-icon {
    margin-right: 4px;
  }
}

.skill-btn {
  height: 32px;
  padding: 0 12px;
  line-height: 31px;

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
