/**
 * 安全的数字格式化工具函数
 */

/**
 * 安全的toFixed方法，处理undefined/null值
 * @param value 要格式化的数值
 * @param digits 小数位数
 * @param defaultValue 默认值
 * @returns 格式化后的字符串
 */
export function safeToFixed(value: number | undefined | null, digits: number = 2, defaultValue: string = '0'): string {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue.includes('.') ? defaultValue : defaultValue + '.'.padEnd(digits + 1, '0')
  }
  return Number(value).toFixed(digits)
}

/**
 * 安全的百分比格式化
 * @param value 要格式化的数值
 * @param digits 小数位数
 * @returns 格式化后的百分比字符串
 */
export function safePercentage(value: number | undefined | null, digits: number = 1): string {
  return safeToFixed(value, digits, '0') + '%'
}

/**
 * 安全的数值获取，确保返回有效数字
 * @param value 输入值
 * @param defaultValue 默认值
 * @returns 安全的数值
 */
export function safeNumber(value: number | undefined | null, defaultValue: number = 0): number {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue
  }
  return Number(value)
}

/**
 * 检查值是否为有效数字
 * @param value 要检查的值
 * @returns 是否为有效数字
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}