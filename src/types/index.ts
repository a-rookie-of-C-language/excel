// 学生成绩数据结构
export interface StudentGrade {
  studentId: string          // 学号
  studentName: string        // 姓名
  className: string          // 班级
  major: string             // 专业
  grade: string             // 年级
  semester: string          // 学期
  courses: CourseGrade[]    // 课程成绩列表
}

export interface CourseGrade {
  courseName: string        // 课程名称
  courseCode: string        // 课程代码
  teacher: string           // 任课教师
  credit: number            // 学分
  score: number             // 成绩
  isPassed: boolean         // 是否及格
  courseType: string        // 课程类型（基础课/专业课等）
}

// 统计分析数据结构
export interface MajorStatistics {
  major: string             // 专业名称
  totalStudents: number     // 总人数
  courseStats: CourseStatistics[]  // 课程统计
}

export interface CourseStatistics {
  courseName: string        // 课程名称
  teacher: string           // 任课教师
  totalStudents: number     // 选课人数
  averageScore: number      // 平均分
  passRate: number          // 及格率
  excellentRate: number     // 优秀率（>=85分）
  failCount: number         // 挂科人数
  scoreDistribution: ScoreDistribution  // 分数分布
}

export interface ScoreDistribution {
  excellent: number         // 优秀(>=85)
  good: number             // 良好(75-84)
  medium: number           // 中等(65-74)
  pass: number             // 及格(60-64)
  fail: number             // 不及格(<60)
}

export interface TeacherStatistics {
  teacher: string
  courses: string[]
  totalStudents: number
  averageScore: number
  passRate: number
}

export interface FailureAnalysis {
  className: string
  courseName: string
  failureRate: number
  failedStudents: number
  totalStudents: number
}

// 报告生成配置
export interface ReportConfig {
  title: string             // 报告标题
  semester: string          // 学期信息
  grade: string             // 年级
  generateDate: string      // 生成日期
  includeCharts: boolean    // 是否包含图表
  chartTypes: ChartType[]   // 图表类型
  exportFormat: ExportFormat // 导出格式
}

export type ChartType = 'bar' | 'line' | 'pie' | 'radar'
export type ExportFormat = 'pdf' | 'docx' | 'xlsx'

// Excel文件解析相关
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface BasicInfo {
  semester: string
  grade: string
  totalStudents: number
  majors: string[]
  courses: string[]
}

// 学生信息接口
export interface StudentInfo {
  studentId: string          // 学号
  studentName: string        // 姓名
  className: string          // 班级
  major: string             // 专业
  grade: string             // 年级
  examCount: number         // 考试数目
  failCount: number         // 挂科数目
  failRate: number          // 挂科率 (0-100)
  gpa: number              // 平均绩点
  totalCredits: number     // 总学分
  passedCredits: number    // 已获得学分
}

// 学生信息列表
export interface StudentInfoList {
  students: StudentInfo[]
  total: number
  pageSize: number
  currentPage: number
}

// 学生信息查询参数
export interface StudentQueryParams {
  keyword?: string          // 搜索关键词
  className?: string        // 班级筛选
  major?: string           // 专业筛选
  grade?: string           // 年级筛选
  failRateRange?: [number, number]  // 挂科率范围
  page: number             // 页码
  pageSize: number         // 每页数量
}

// 上传文件状态
export interface UploadStatus {
  status: 'idle' | 'uploading' | 'parsing' | 'success' | 'error'
  progress: number
  message: string
  data?: StudentGrade[]
}