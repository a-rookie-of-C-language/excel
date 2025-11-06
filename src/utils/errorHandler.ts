import { ElMessage } from 'element-plus'
import type {ProcessedStudentData, StudentGradeRecord} from "@/types";

// 全局错误处理器
export class ErrorHandler {
  private static instance: ErrorHandler
  
  private constructor() {
    this.setupGlobalErrorHandlers()
  }
  
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }
  
  private setupGlobalErrorHandlers() {
    // 捕获未处理的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      this.handleError(event.reason)
      event.preventDefault()
    })
    
    // 捕获全局JavaScript错误
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      this.handleError(event.error)
    })
  }
  
  public handleError(error: any) {
    let message = '发生了未知错误'
    
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    
    // 根据错误类型显示不同的消息
    if (message.includes('QuotaExceededError')) {
      ElMessage.error('存储空间不足，请清理数据后重试')
    } else if (message.includes('toFixed')) {
      ElMessage.error('数据格式错误，请检查数据完整性')
    } else if (message.includes('vnode')) {
      ElMessage.error('页面组件错误，正在重新加载...')
      // 延迟重新加载，避免无限循环
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else {

    }
  }
  
  // 安全执行函数，捕获错误
  public safeExecute<T>(fn: () => T, fallback?: T): T | undefined {
    try {
      return fn()
    } catch (error) {
      this.handleError(error)
      return fallback
    }
  }
  
  // 安全的异步执行
  public async safeExecuteAsync<T>(fn: () => Promise<T>, fallback?: T): Promise<T | undefined> {
    try {
      return await fn()
    } catch (error) {
      this.handleError(error)
      return fallback
    }
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance()

// 数据验证工具
export const validateData = {
  // 验证数字
  isValidNumber: (value: any): value is number => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value)
  },
  
  // 验证对象
  isValidObject: (value: any): value is object => {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  },
  
  // 验证数组
  isValidArray: (value: any): value is any[] => {
    return Array.isArray(value)
  },
  
  // 验证字符串
  isValidString: (value: any): value is string => {
    return typeof value === 'string' && value.length > 0
  },
  
  // 验证学生数据
  isValidStudentData: (data: ProcessedStudentData): boolean => {
    return validateData.isValidObject(data) &&
           validateData.isValidString(data.studentId) &&
           validateData.isValidString(data.studentName)
  },
  
  // 验证成绩数据
  isValidScoreData: (data: StudentGradeRecord): boolean => {
    return validateData.isValidObject(data) &&
           validateData.isValidNumber(data.score) &&
           data.score >= 0 && data.score <= 100
  }
}