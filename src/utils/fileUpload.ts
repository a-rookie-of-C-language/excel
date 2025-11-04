/**
 * 文件上传相关工具函数
 */

// 文件大小限制 (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv' // .csv
]

// 支持的文件扩展名
export const SUPPORTED_EXTENSIONS = ['xlsx', 'xls', 'csv']

/**
 * 验证文件类型
 * @param file 文件对象
 * @returns 是否为支持的文件类型
 */
export const validateFileType = (file: File): boolean => {
  // 检查MIME类型
  if (SUPPORTED_FILE_TYPES.includes(file.type)) {
    return true
  }
  
  // 检查文件扩展名（作为备用验证）
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension ? SUPPORTED_EXTENSIONS.includes(extension) : false
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @returns 是否在大小限制内
 */
export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 验证文件（综合验证）
 * @param file 文件对象
 * @returns 验证结果对象
 */
export const validateFile = (file: File): {
  isValid: boolean
  error?: string
} => {
  // 检查文件类型
  if (!validateFileType(file)) {
    return {
      isValid: false,
      error: '不支持的文件格式，请选择 .xlsx、.xls 或 .csv 文件'
    }
  }
  
  // 检查文件大小
  if (!validateFileSize(file)) {
    return {
      isValid: false,
      error: `文件大小超过限制，请选择小于 ${formatFileSize(MAX_FILE_SIZE)} 的文件`
    }
  }
  
  return { isValid: true }
}

/**
 * 创建文件上传进度模拟器
 * @param duration 持续时间（毫秒）
 * @param onProgress 进度回调函数
 * @returns Promise<void>
 */
export const simulateUploadProgress = (
  duration: number = 2000,
  onProgress: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let progress = 0
    const interval = 100 // 每100ms更新一次
    const increment = (interval / duration) * 100
    
    const timer = setInterval(() => {
      progress += increment
      
      if (progress >= 90) {
        clearInterval(timer)
        onProgress(90)
        
        // 最后10%稍微慢一点
        setTimeout(() => {
          onProgress(100)
          resolve()
        }, 500)
      } else {
        onProgress(Math.min(progress, 90))
      }
    }, interval)
  })
}