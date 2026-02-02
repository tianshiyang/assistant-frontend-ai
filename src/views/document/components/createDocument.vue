<template>
  <a-modal
    :open="modelValue"
    title="上传知识库文档"
    :confirm-loading="loading"
    @ok="uploadDocument"
    @cancel="handleCancel"
  >
    <a-form :model="form" layout="vertical">
      <a-form-item name="oss_url">
        <div class="document-upload">
          <a-upload
            v-model:file-list="fileList"
            :before-upload="beforeUpload"
            :custom-request="handleUpload"
            :show-upload-list="false"
            accept=".doc,.docx,.pdf"
            :disabled="uploading"
          >
            <a-button :loading="uploading">
              <upload-outlined />
              点击上传
            </a-button>
          </a-upload>
          <div v-if="form.oss_url" class="file-info">
            <file-text-outlined class="file-icon" />
            <span class="file-name">{{ fileName }}</span>
            <a-button type="link" size="small" @click="handleRemoveIcon">移除</a-button>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import { uploadToCOS } from '@/utils/cos'
import { uploadDocumentAPI } from '@/api/module/document'

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
const fileName = ref('')
const form = reactive({
  oss_url: '',
})

// 上传前验证
const beforeUpload: UploadProps['beforeUpload'] = file => {
  // 允许的文件类型：Word (.doc, .docx) 和 PDF (.pdf)
  const allowedTypes = [
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/pdf', // .pdf
  ]
  const allowedExtensions = ['.doc', '.docx', '.pdf']

  // 检查文件类型
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)

  if (!isValidType) {
    message.error('只能上传 Word (.doc, .docx) 或 PDF (.pdf) 文件！')
    return false
  }

  // 文件大小限制：50MB
  const isLt50M = file.size / 1024 / 1024 / 1024 < 3
  if (!isLt50M) {
    message.error('文件大小不能超过 3k！')
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
      prefix: `dataset-documents/${props.datasetId}/`,
    })

    form.oss_url = result.url
    fileName.value = fileObj.name
  } catch (error) {
    message.error('文档上传失败，请重试')
    onError?.(error as Error)
  } finally {
    uploading.value = false
  }
}

// 移除文档
const handleRemoveIcon = () => {
  form.oss_url = ''
  fileName.value = ''
  fileList.value = []
}

const handleCancel = () => {
  modelValue.value = false
}

const uploadDocument = async () => {
  loading.value = true
  try {
    await uploadDocumentAPI({
      oss_url: form.oss_url,
      dataset_id: props.datasetId,
    })
    handleCancel()
    message.success('上传成功')
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.document-upload {
  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border-radius: 4px;

    .file-icon {
      font-size: 16px;
      color: #1890ff;
    }

    .file-name {
      flex: 1;
      font-size: 14px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
