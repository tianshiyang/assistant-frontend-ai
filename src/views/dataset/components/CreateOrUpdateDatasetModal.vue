<template>
  <a-modal
    :open="modelValue"
    :title="props.datasetId ? '编辑知识库' : '新建知识库'"
    :confirm-loading="loading"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-form :model="form" layout="vertical">
      <a-form-item label="知识库名称" name="name">
        <a-input
          v-model:value="form.name"
          placeholder="请输入知识库名称"
          @press-enter="handleConfirm"
        />
      </a-form-item>
      <a-form-item label="知识库图标" name="icon">
        <div class="icon-upload">
          <a-upload
            v-model:file-list="fileList"
            :before-upload="beforeUpload"
            :custom-request="handleUpload"
            :show-upload-list="false"
            accept="image/*"
          >
            <div class="icon-upload-area">
              <img v-if="form.icon" :src="form.icon" alt="icon" class="icon-preview" />
              <div v-else class="icon-placeholder">
                <plus-outlined />
                <span>上传图标</span>
              </div>
              <div v-if="uploading" class="upload-mask">
                <a-spin />
              </div>
            </div>
          </a-upload>
          <div v-if="form.icon" class="icon-actions">
            <a-button type="link" size="small" @click="handleRemoveIcon">移除</a-button>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="知识库描述" name="description">
        <a-textarea
          v-model:value="form.description"
          placeholder="请输入知识库描述（选填）"
          :rows="3"
          :maxlength="200"
          show-count
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { createDatasetAPI, getDatasetDetailAPI, updateDatasetAPI } from '@/api/module/dataset'
import { uploadToCOS } from '@/utils/cos'

const DEFAULT_ICON_URL =
  'https://assistant-ai-1309470436.cos.ap-beijing.myqcloud.com/default_icon/zhishiku.png'

interface Props {
  datasetId: string
}

const modelValue = defineModel<boolean>('modelValue', { required: true })

interface Emits {
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const uploading = ref(false)
const fileList = ref([])
const form = reactive({
  name: '',
  icon: '',
  description: '',
})

// 上传前验证
const beforeUpload: UploadProps['beforeUpload'] = file => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件！')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

// 自定义上传到腾讯云 COS
const handleUpload: UploadProps['customRequest'] = async options => {
  const { file, onError } = options
  const fileObj = file as File

  if (!fileObj) {
    message.error('请选择文件')
    onError?.(new Error('请选择文件'))
    return
  }

  uploading.value = true

  try {
    const result = await uploadToCOS({
      file: fileObj,
      prefix: 'dataset-icons/',
    })

    form.icon = result.url
    message.success('图标上传成功！')
  } catch (error) {
    message.error('图标上传失败，请重试')
    onError?.(error as Error)
  } finally {
    uploading.value = false
  }
}

// 移除图标
const handleRemoveIcon = () => {
  form.icon = ''
  fileList.value = []
}

// 创建知识库
const createDataset = async () => {
  if (!form.name.trim()) {
    message.warning('请输入知识库名称')
    return
  }

  loading.value = true
  try {
    const params = {
      name: form.name.trim(),
      icon: form.icon || DEFAULT_ICON_URL,
      description: form.description.trim() || '暂无描述',
    }

    await createDatasetAPI(params)
    message.success('创建成功')
    emit('success')
    handleCancel()
  } finally {
    loading.value = false
  }
}

// 编辑知识库
const updateDataset = async () => {
  if (!form.name.trim()) {
    message.warning('请输入知识库名称')
    return
  }
  loading.value = true
  try {
    const params = {
      dataset_id: props.datasetId,
      name: form.name.trim(),
      icon: form.icon || DEFAULT_ICON_URL,
      description: form.description.trim() || '暂无描述',
    }

    await updateDatasetAPI(params)
    message.success('创建成编辑成功功')
    emit('success')
    handleCancel()
  } finally {
    loading.value = false
  }
}

const handleConfirm = async () => {
  if (props.datasetId) {
    await updateDataset()
  } else {
    await createDataset()
  }
}

const handleCancel = () => {
  modelValue.value = false
}

const getDatasetDetail = async () => {
  if (!props.datasetId) return
  const res = await getDatasetDetailAPI({
    dataset_id: props.datasetId,
  })
  form.name = res.name
  form.icon = res.icon
  form.description = res.description
}

getDatasetDetail()
</script>

<style scoped lang="scss">
.icon-upload {
  .icon-upload-area {
    position: relative;
    width: 100px;
    height: 100px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    overflow: hidden;

    &:hover {
      border-color: #1890ff;
    }

    .icon-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .icon-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #fafafa;
      gap: 8px;
      color: #999;
      font-size: 14px;
    }

    .upload-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
  }

  .icon-actions {
    margin-top: 8px;
  }
}
</style>
