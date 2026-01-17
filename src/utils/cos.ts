/**
 * 腾讯云 COS 文件上传工具
 * 需要安装: npm install cos-js-sdk-v5
 */

import COS from 'cos-js-sdk-v5'

// COS 配置接口
export interface COSConfig {
  SecretId: string
  SecretKey: string
  Bucket: string
  Region: string
  Domain?: string // 自定义域名，如果有的话
  Prefix?: string // 文件路径前缀，如 'uploads/' 或 'images/'
}

// 上传选项接口
export interface UploadOptions {
  file: File
  prefix: string // 文件路径前缀，必填，如 'uploads/' 或 'images/'
  fileName?: string // 自定义文件名，不传则使用原文件名
  path?: string // 自定义路径，会覆盖 Prefix
  onProgress?: (progress: number) => void // 上传进度回调
}

// 上传结果接口
export interface UploadResult {
  url: string // 文件的完整访问地址
  key: string // 文件在 COS 中的 key
  etag: string // 文件的 ETag
}

// 默认配置（优先使用环境变量，否则使用默认值）
const getDefaultConfig = (): COSConfig => {
  return {
    SecretId: import.meta.env.VITE_COS_SECRET_ID,
    SecretKey: import.meta.env.VITE_COS_SECRET_KEY,
    Bucket: import.meta.env.VITE_COS_BUCKET,
    Region: import.meta.env.VITE_COS_REGION,
    Domain: import.meta.env.VITE_COS_DOMAIN,
  }
}

/**
 * 创建 COS 实例
 * @param config COS 配置，不传则使用环境变量
 * @returns COS 实例
 */
export const createCOSInstance = (config?: Partial<COSConfig>) => {
  const finalConfig = { ...getDefaultConfig(), ...config }
  console.log(finalConfig)

  if (
    !finalConfig.SecretId ||
    !finalConfig.SecretKey ||
    !finalConfig.Bucket ||
    !finalConfig.Region
  ) {
    throw new Error('COS 配置不完整，请检查环境变量或传入的配置')
  }

  return new COS({
    SecretId: finalConfig.SecretId,
    SecretKey: finalConfig.SecretKey,
  })
}

/**
 * 生成文件路径
 * @param file 文件对象
 * @param fileName 自定义文件名
 * @param path 自定义路径
 * @param prefix 路径前缀
 * @returns 完整的文件路径
 */
const generateFilePath = (
  file: File,
  fileName?: string,
  path?: string,
  prefix?: string
): string => {
  if (path) {
    return path.endsWith('/')
      ? `${path}${fileName || file.name}`
      : `${path}/${fileName || file.name}`
  }

  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const ext = file.name.split('.').pop() || ''
  const name = fileName || file.name.replace(/\.[^/.]+$/, '')
  const finalFileName = `${name}_${timestamp}_${randomStr}.${ext}`
  const finalPrefix = prefix || 'uploads/'

  return `${finalPrefix}${finalFileName}`
}

/**
 * 上传文件到腾讯云 COS
 * @param options 上传选项（prefix 为必填参数）
 * @param config COS 配置，不传则使用默认配置
 * @returns Promise<UploadResult> 上传结果，包含文件的完整访问地址
 */
export const uploadToCOS = async (
  options: UploadOptions,
  config?: Partial<COSConfig>
): Promise<UploadResult> => {
  const finalConfig = { ...getDefaultConfig(), ...config }
  const cos = createCOSInstance(finalConfig)

  const { file, fileName, path, prefix, onProgress } = options

  // 验证 prefix 是否传入
  if (!prefix || prefix.trim() === '') {
    throw new Error('prefix 参数为必填项，请传入文件路径前缀，如 "uploads/" 或 "images/"')
  }

  // 确保 prefix 以 / 结尾
  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`

  // 生成文件路径
  const key = generateFilePath(file, fileName, path, normalizedPrefix)

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: finalConfig.Bucket,
        Region: finalConfig.Region,
        Key: key,
        Body: file,
        onProgress: progressData => {
          if (onProgress) {
            const percent = Math.round((progressData.loaded / progressData.total) * 100)
            onProgress(percent)
          }
        },
      },
      (err, data) => {
        if (err) {
          reject(err)
          return
        }

        // 构建文件的访问地址
        let url = ''
        if (finalConfig.Domain) {
          // 使用自定义域名
          url = `${finalConfig.Domain}/${key}`
        } else {
          // 使用默认域名
          url = `https://${finalConfig.Bucket}.cos.${finalConfig.Region}.myqcloud.com/${key}`
        }

        resolve({
          url,
          key,
          etag: data.ETag || '',
        })
      }
    )
  })
}

/**
 * 批量上传文件
 * @param files 文件数组
 * @param prefix 文件路径前缀，必填
 * @param config COS 配置
 * @param onProgress 总进度回调
 * @returns Promise<UploadResult[]>
 */
export const uploadMultipleToCOS = async (
  files: File[],
  prefix: string,
  config?: Partial<COSConfig>,
  onProgress?: (current: number, total: number) => void
): Promise<UploadResult[]> => {
  // 验证 prefix 是否传入
  if (!prefix || prefix.trim() === '') {
    throw new Error('prefix 参数为必填项，请传入文件路径前缀，如 "uploads/" 或 "images/"')
  }

  const results: UploadResult[] = []
  const total = files.length

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadToCOS({ file: files[i]!, prefix }, config)
      results.push(result)
      if (onProgress) {
        onProgress(i + 1, total)
      }
    } catch (error) {
      console.error(`文件 ${files[i]!.name} 上传失败:`, error)
      throw error
    }
  }

  return results
}

/**
 * 删除 COS 中的文件
 * @param key 文件在 COS 中的 key
 * @param config COS 配置
 * @returns Promise<void>
 */
export const deleteFromCOS = async (key: string, config?: Partial<COSConfig>): Promise<void> => {
  const finalConfig = { ...getDefaultConfig(), ...config }
  const cos = createCOSInstance(finalConfig)

  return new Promise((resolve, reject) => {
    cos.deleteObject(
      {
        Bucket: finalConfig.Bucket,
        Region: finalConfig.Region,
        Key: key,
      },
      err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}
