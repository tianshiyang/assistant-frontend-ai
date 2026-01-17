/**
 * 腾讯云 COS 上传工具使用示例
 */

import { uploadToCOS, uploadMultipleToCOS, type UploadResult } from './cos'
import { message } from 'ant-design-vue'

// 示例 1: 单个文件上传
export const exampleUploadSingle = async (file: File) => {
  try {
    const result: UploadResult = await uploadToCOS({
      file,
      prefix: 'images/', // 必填：文件路径前缀
      onProgress: progress => {
        console.log(`上传进度: ${progress}%`)
      },
    })

    console.log('上传成功！')
    console.log('文件地址:', result.url)
    console.log('文件 Key:', result.key)
    message.success('文件上传成功！')

    return result.url
  } catch (error) {
    console.error('上传失败:', error)
    message.error('文件上传失败，请重试')
    throw error
  }
}

// 示例 2: 自定义文件名上传
export const exampleUploadWithCustomName = async (file: File) => {
  try {
    const result = await uploadToCOS({
      file,
      prefix: 'documents/', // 必填
      fileName: 'my-custom-file.pdf', // 自定义文件名
    })

    return result.url
  } catch (error) {
    console.error('上传失败:', error)
    throw error
  }
}

// 示例 3: 批量上传
export const exampleUploadMultiple = async (files: File[]) => {
  try {
    const results = await uploadMultipleToCOS(
      files,
      'uploads/', // 必填：文件路径前缀
      undefined, // 使用默认配置
      (current, total) => {
        console.log(`总进度: ${current}/${total}`)
      }
    )

    console.log('所有文件上传成功！')
    return results.map(r => r.url)
  } catch (error) {
    console.error('批量上传失败:', error)
    throw error
  }
}

// 示例 4: 在 Vue 组件中使用
export const exampleInVueComponent = () => {
  const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    try {
      const result = await uploadToCOS({
        file,
        prefix: 'avatars/', // 必填
        onProgress: progress => {
          // 更新进度条
          console.log(progress)
        },
      })

      // 使用返回的 URL
      console.log('文件地址:', result.url)
    } catch (error) {
      console.error('上传失败:', error)
    }
  }

  return { handleFileChange }
}
