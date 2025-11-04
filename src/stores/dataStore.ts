import { defineStore } from 'pinia'
import type { 
  StudentGradeRecord, 
  ProcessedStudentData, 
  BasicInfo, 
  GradeSystemInfo, 
  ValidationResult 
} from '@/types'
import { validateData, errorHandler } from '@/utils/errorHandler'

export const useDataStore = defineStore('data', {
  state: () => ({
    rawData: [] as StudentGradeRecord[],
    processedData: [] as ProcessedStudentData[],
    basicInfo: null as BasicInfo | null,
    gradeSystemInfo: null as GradeSystemInfo | null,
    validationResult: null as ValidationResult | null,
    isLoading: false,
    isDataLoaded: false,
    fileName: '',
    fileSize: 0,
    importTime: ''
  }),

  getters: {
    // 获取总学生数
    totalStudents: (state) => state.processedData.length,
    
    // 获取总课程数
    totalCourses: (state) => {
      const courses = new Set<string>()
      state.rawData.forEach(record => courses.add(record.courseName))
      return courses.size
    },
    
    // 获取总教师数
    totalTeachers: (state) => {
      const teachers = new Set<string>()
      state.rawData.forEach(record => teachers.add(record.teacher))
      return teachers.size
    },
    
    // 获取课程列表
    courses: (state) => {
      const courses = new Set<string>()
      state.rawData.forEach(record => courses.add(record.courseName))
      return Array.from(courses)
    },
    
    // 获取教师列表
    teachers: (state) => {
      const teachers = new Set<string>()
      state.rawData.forEach(record => teachers.add(record.teacher))
      return Array.from(teachers)
    },
    
    // 获取专业列表
    majors: (state) => {
      const majors = new Set<string>()
      state.processedData.forEach(student => majors.add(student.major))
      return Array.from(majors)
    },
    
    // 获取班级列表
    classes: (state) => {
      const classes = new Set<string>()
      state.processedData.forEach(student => classes.add(student.className))
      return Array.from(classes)
    },
    
    // 获取学期列表
    semesters: (state) => {
      const semesters = new Set<string>()
      state.rawData.forEach(record => semesters.add(record.semester))
      return Array.from(semesters)
    },
    
    // 获取平均GPA
    averageGPA: (state) => {
      if (state.processedData.length === 0) return 0
      const totalGPA = state.processedData.reduce((sum, student) => sum + student.gpa, 0)
      return Number((totalGPA / state.processedData.length).toFixed(2))
    },
    
    // 获取及格率
    passRate: (state) => {
      if (state.processedData.length === 0) return 0
      const passedStudents = state.processedData.filter(student => 
        student.courses.every(course => course.isPassed)
      ).length
      return Number((passedStudents / state.processedData.length * 100).toFixed(2))
    },
    
    // 数据统计信息
    dataStats: (state) => ({
      totalRecords: state.rawData.length,
      totalStudents: state.processedData.length,
      totalCourses: state.rawData.length > 0 ? new Set(state.rawData.map(r => r.courseName)).size : 0,
      totalTeachers: state.rawData.length > 0 ? new Set(state.rawData.map(r => r.teacher)).size : 0,
      fileName: state.fileName,
      fileSize: state.fileSize,
      importTime: state.importTime,
      isValid: state.validationResult?.isValid || false,
      hasWarnings: (state.validationResult?.warnings.length || 0) > 0
    })
  },

  actions: {
    // 设置原始数据
    setRawData(data: StudentGradeRecord[]) {
      return errorHandler.safeExecute(() => {
        // 验证数据格式
        if (!validateData.isValidArray(data)) {
          throw new Error('数据格式无效：必须是数组')
        }
        
        // 验证每条记录
        const invalidRecords = data.filter((record, index) => {
          if (!validateData.isValidObject(record)) {
            console.warn(`记录 ${index} 不是有效对象`)
            return true
          }
          return false
        })
        
        if (invalidRecords.length > 0) {
          console.warn(`发现 ${invalidRecords.length} 条无效记录`)
        }
        
        this.rawData = data
        this.saveToLocalStorage()
      })
    },
    
    // 设置处理后的数据
    setProcessedData(data: ProcessedStudentData[]) {
      return errorHandler.safeExecute(() => {
        // 验证数据格式
        if (!validateData.isValidArray(data)) {
          throw new Error('处理后数据格式无效：必须是数组')
        }
        
        // 验证学生数据
        const invalidStudents = data.filter((student, index) => {
          if (!validateData.isValidStudentData(student)) {
            console.warn(`学生数据 ${index} 无效`)
            return true
          }
          return false
        })
        
        if (invalidStudents.length > 0) {
          console.warn(`发现 ${invalidStudents.length} 条无效学生数据`)
        }
        
        this.processedData = data
        this.saveToLocalStorage()
      })
    },
    
    // 设置基本信息
    setBasicInfo(info: BasicInfo) {
      this.basicInfo = info
      this.saveToLocalStorage()
    },
    
    // 设置成绩制度信息
    setGradeSystemInfo(info: GradeSystemInfo) {
      this.gradeSystemInfo = info
      this.saveToLocalStorage()
    },
    
    // 设置验证结果
    setValidationResult(result: ValidationResult) {
      this.validationResult = result
      this.saveToLocalStorage()
    },
    
    // 设置文件信息
    setFileInfo(fileName: string, fileSize: number) {
      this.fileName = fileName
      this.fileSize = fileSize
      this.importTime = new Date().toLocaleString('zh-CN')
      this.saveToLocalStorage()
    },
    
    // 设置加载状态
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    
    // 设置数据加载完成状态
    setDataLoaded(loaded: boolean) {
      this.isDataLoaded = loaded
      this.saveToLocalStorage()
    },
    
    // 清空所有数据
    clearData() {
      this.rawData = []
      this.processedData = []
      this.basicInfo = null
      this.gradeSystemInfo = null
      this.validationResult = null
      this.isDataLoaded = false
      this.isLoading = false
      this.fileName = ''
      this.fileSize = 0
      this.importTime = ''
      this.clearLocalStorage()
    },
    
    // 根据条件筛选学生数据
    filterStudents(filters: {
      major?: string
      className?: string
      semester?: string
      minGPA?: number
      maxGPA?: number
    }) {
      return this.processedData.filter(student => {
        if (filters.major && student.major !== filters.major) return false
        if (filters.className && student.className !== filters.className) return false
        if (filters.semester && student.semester !== filters.semester) return false
        if (filters.minGPA !== undefined && student.gpa < filters.minGPA) return false
        if (filters.maxGPA !== undefined && student.gpa > filters.maxGPA) return false
        return true
      })
    },
    
    // 根据学号获取学生信息
    getStudentById(studentId: string): ProcessedStudentData | undefined {
      return this.processedData.find(student => student.studentId === studentId)
    },
    
    // 根据课程名称获取课程数据
    getCourseData(courseName: string) {
      const courseData = this.rawData.filter(record => record.courseName === courseName)
      return courseData
    },
    
    // 检查存储大小
    getStorageSize(data: any): number {
      return new Blob([JSON.stringify(data)]).size
    },
    
    // 压缩数据 - 移除不必要的字段
    compressDataForStorage() {
      // 只保存必要的数据，减少存储大小
      return {
        // 只保存基本统计信息，不保存完整的原始数据
        basicInfo: this.basicInfo,
        gradeSystemInfo: this.gradeSystemInfo,
        validationResult: this.validationResult ? {
          isValid: this.validationResult.isValid,
          errors: this.validationResult.errors.slice(0, 10), // 只保存前10个错误
          warnings: this.validationResult.warnings.slice(0, 10) // 只保存前10个警告
        } : null,
        isDataLoaded: this.isDataLoaded,
        fileName: this.fileName,
        fileSize: this.fileSize,
        importTime: this.importTime,
        // 保存数据摘要而不是完整数据
        dataSummary: {
          totalRecords: this.rawData.length,
          totalStudents: this.processedData.length,
          totalCourses: this.totalCourses,
          totalTeachers: this.totalTeachers,
          averageGPA: this.averageGPA,
          passRate: this.passRate
        }
      }
    },
    
    // 智能保存到本地存储
    saveToLocalStorage() {
      try {
        const compressedData = this.compressDataForStorage()
        const dataSize = this.getStorageSize(compressedData)
        
        // 检查数据大小，如果超过4MB则不保存到localStorage
        const maxSize = 4 * 1024 * 1024 // 4MB
        if (dataSize > maxSize) {
          console.warn(`数据大小 (${(dataSize / 1024 / 1024).toFixed(2)}MB) 超过存储限制，跳过本地存储`)
          return false
        }
        
        localStorage.setItem('webExcel_data', JSON.stringify(compressedData))
        console.log(`数据已保存到本地存储，大小: ${(dataSize / 1024).toFixed(2)}KB`)
        return true
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('本地存储空间不足，尝试清理旧数据')
          this.clearLocalStorage()
          // 尝试只保存最基本的信息
          try {
            const minimalData = {
              fileName: this.fileName,
              fileSize: this.fileSize,
              importTime: this.importTime,
              isDataLoaded: this.isDataLoaded
            }
            localStorage.setItem('webExcel_data', JSON.stringify(minimalData))
            console.log('已保存最小数据集到本地存储')
            return true
          } catch (retryError) {
            console.error('无法保存数据到本地存储:', retryError)
            return false
          }
        } else {
          console.error('保存数据到本地存储失败:', error)
          return false
        }
      }
    },
    
    // 从本地存储加载
    loadFromLocalStorage() {
      try {
        const savedData = localStorage.getItem('webExcel_data')
        if (savedData) {
          const data = JSON.parse(savedData)
          
          // 检查是否是压缩格式的数据
          if (data.dataSummary) {
            // 加载压缩数据
            this.basicInfo = data.basicInfo || null
            this.gradeSystemInfo = data.gradeSystemInfo || null
            this.validationResult = data.validationResult || null
            this.isDataLoaded = data.isDataLoaded || false
            this.fileName = data.fileName || ''
            this.fileSize = data.fileSize || 0
            this.importTime = data.importTime || ''
            console.log('已从本地存储加载压缩数据')
          } else {
            // 兼容旧格式数据
            this.rawData = data.rawData || []
            this.processedData = data.processedData || []
            this.basicInfo = data.basicInfo || null
            this.gradeSystemInfo = data.gradeSystemInfo || null
            this.validationResult = data.validationResult || null
            this.isDataLoaded = data.isDataLoaded || false
            this.fileName = data.fileName || ''
            this.fileSize = data.fileSize || 0
            this.importTime = data.importTime || ''
            console.log('已从本地存储加载完整数据')
          }
          return true
        }
      } catch (error) {
        console.warn('从本地存储加载数据失败:', error)
        // 如果加载失败，清理损坏的数据
        this.clearLocalStorage()
      }
      return false
    },
    
    // 清空本地存储
    clearLocalStorage() {
      try {
        localStorage.removeItem('webExcel_data')
        console.log('已清空本地存储')
      } catch (error) {
        console.warn('清空本地存储失败:', error)
      }
    }
  }
})