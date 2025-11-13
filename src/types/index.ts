// 35字段完整学生成绩记录（英文字段名）- 根据用户Excel表字段更新
export interface StudentGradeRecord {
  // 学生基本信息
  className: string;                    // 班级
  studentId: string;                    // 学号
  studentName: string;                  // 姓名
  courseName: string;                   // 课程名称
  score: string | number;               // 成绩
  academicYear: string;                 // 学年
  semester: string;                     // 学期
  studentType: string;                  // 学生类别
  college: string;                      // 学院
  major: string;                        // 专业
  grade: string;                        // 年级
  studentMark: string;                  // 学生标记
  
  // 课程信息
  teachingCollege: string;              // 开课学院
  courseCode: string;                   // 课程代码
  teachingClass: string;                // 教学班
  teacher: string;                      // 任课教师
  credit: number;                       // 学分
  scoreRemark: string;                  // 成绩备注
  examNature: string;                   // 考试性质
  gradePoint: number;                   // 绩点
  courseMark: string;                   // 课程标记
  courseCategory: string;               // 课程类别
  courseBelonging: string;              // 课程归属
  courseNature: string;                 // 课程性质
  assessmentMethod: string;             // 考核方式
  isScoreVoid: boolean;                 // 是否成绩作废
  submitter: string;                    // 提交人
  submitTime: string;                   // 提交时间
  isDegreeRequired: boolean;            // 是否学位课程
  gender: string;                       // 性别
  majorDirection: string;               // 专业方向
  courseNameEn: string;                 // 课程英文名称
  remarks: string;                      // 备注信息
  creditGradePoint: number;             // 学分绩点
  courseType: string;                   // 开课类型
}

// 处理后的学生数据结构
export interface ProcessedStudentData {
  studentId: string         // 学号
  studentName: string       // 姓名
  className: string         // 班级
  gender: string            // 性别
  studentType: string       // 学生类别
  college: string           // 学院
  major: string             // 专业
  grade: string             // 年级
  semester: string          // 学期
  courses: CourseGrade[]    // 课程成绩列表
  gpa: number              // 平均绩点
  totalCredits: number     // 总学分
  passedCredits: number    // 已获得学分
  failedCount: number      // 挂科数目
  courseCount: number      // 课程数量
}

export interface CourseGrade {
  courseName: string        // 课程名称
  courseCode: string        // 课程代码
  teacher: string           // 任课教师
  credit: number            // 学分
  score: number             // 成绩
  normalizedScore: number   // 标准化成绩
  gpa: number              // 绩点
  isPassed: boolean         // 是否及格
  courseType: string        // 课程类型（基础课/专业课等）
  semester: string          // 学期
  status: string           // 状态（及格/不及格/优秀等）
  isVoid: boolean          // 是否作废
  examNature?: string       // 考试性质（补考/重修/重考等）
}

// Excel文件解析和验证相关
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
  invalidRecords: number[];
}

export interface BasicInfo {
  semester: string;
  grade: string;
  totalStudents: number;
  majors: string[];
  courses: string[];
  teachers: string[];
  colleges: string[];
}

export interface GradeSystemInfo {
  hasPercentageGrades: boolean;         // 是否包含百分制成绩
  hasLevelGrades: boolean;              // 是否包含等级制成绩
  levelGradeTypes: string[];            // 等级制类型列表
  mixedSystem: boolean;                 // 是否混合制度
}

// 统计分析数据结构
export interface StudentInfoStatistics {
  totalStudents: number;
  byMajor: { [major: string]: number };
  byGrade: { [grade: string]: number };
  byGender: { [gender: string]: number };
  byStudentType: { [type: string]: number };
}

export interface SemesterSummaryByMajor {
  major: string;
  totalStudents: number;
  uniqueStudentCount: number; // 人数（去重）
  totalExamCount: number;     // 人次（参加考试次数）
  excellentStudentCount: number; // 优秀人数（去重）
  excellentExamCount: number;    // 优秀人次（考试次数）
  failedStudentCount: number;    // 不及格人数（去重）
  failedExamCount: number;       // 不及格人次（考试次数）
  averageGPA: number;
  passRate: number;
  excellentRate: number;
  failureRate: number;
  totalCredits: number;
}

export interface FinalExamStatistics {
  major: string;
  courses: CourseStatistics[];
  overallPerformance: {
    averageScore: number;
    passRate: number;
    excellentRate: number;
  };
}

export interface GradeMajorAnalysis {
  grade: string;
  major: string;
  studentCount: number;
  averageScore: number;
  passRate: number;
  excellentRate: number;
  failureRate: number;
  topCourses: string[];                 // 表现最好的课程
  weakCourses: string[];                // 表现较差的课程
  averageGPA: number;                   // 平均GPA（新增）
}

export interface TeachingPerformanceAnalysis {
  teacher: string;
  courses: string[];
  totalStudents: number;
  averageScore: number;
  passRate: number;
  excellentRate: number;
  courseComparison: {
    courseName: string;
    averageScore: number;
    passRate: number;
    studentCount: number;
  }[];
}

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
  excellentRate: number     // 优秀率（>=90分，仅正常考试）
  failCount: number         // 挂科人数
  scoreDistribution: ScoreDistribution  // 分数分布
}

export interface ScoreDistribution {
  excellent: number         // 优秀(>=90)
  good: number             // 良好(80-89)
  medium: number           // 中等(70-79)
  pass: number             // 及格(60-69)
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

// 数据导入和处理状态
export interface ImportStatus {
  status: 'idle' | 'uploading' | 'parsing' | 'validating' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  data?: ProcessedStudentData[];
  validationResult?: ValidationResult;
  basicInfo?: BasicInfo;
  gradeSystemInfo?: GradeSystemInfo;
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
  data?: StudentGradeRecord[]
}