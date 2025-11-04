<template>
  <div class="analysis-page p-6 bg-gray-50 min-h-screen">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">成绩分析报告</h1>
      <p class="text-gray-600">基于导入的成绩数据进行多维度分析</p>
    </div>

    <!-- 数据检查 -->
    <div v-if="!hasData" class="text-center py-12">
      <el-empty description="暂无数据">
        <template #image>
          <div class="text-6xl text-gray-300 mb-4">📊</div>
        </template>
        <template #description>
          <p class="text-gray-500 mb-4">请先导入Excel成绩数据</p>
        </template>
        <el-button type="primary" @click="goToImport">
          <el-icon><Upload /></el-icon>
          导入数据
        </el-button>
      </el-empty>
    </div>

    <!-- 分析内容 -->
    <div v-else>
      <!-- 基本信息卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-blue-100 text-blue-600">
              <el-icon><User /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ dataStore.totalStudents }}</div>
              <div class="text-sm text-gray-600">学生总数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-green-100 text-green-600">
              <el-icon><Document /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ safeToFixed(avgCourseCount, 1) }}</div>
              <div class="text-sm text-gray-600">平均课程数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-purple-100 text-purple-600">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ overallGPA }}</div>
              <div class="text-sm text-gray-600">平均GPA</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-red-100 text-red-600">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ safeToFixed(failureRate, 1) }}%</div>
              <div class="text-sm text-gray-600">不及格率</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="stat-icon bg-orange-100 text-orange-600">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-800">{{ warningCount }}</div>
              <div class="text-sm text-gray-600">学业预警</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分析选项卡 -->
      <el-tabs v-model="activeTab" class="analysis-tabs">
        <!-- 学期成绩汇总 -->
        <el-tab-pane label="学期成绩汇总" name="semester" lazy>
          <div class="bg-white rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">各专业学期成绩汇总</h3>
              <div class="flex gap-2">
                <el-select v-model="selectedSemester" placeholder="选择学期" style="width: 150px">
                  <el-option
                    v-for="semester in semesterOptions"
                    :key="semester"
                    :label="semester"
                    :value="semester"
                  />
                </el-select>
                <el-button type="primary" @click="exportSemesterData">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>
            
            <el-table :data="semesterSummary" border stripe>
              <el-table-column prop="major" label="专业" width="200" />
              <el-table-column prop="totalStudents" label="学生数" width="100" />
              <el-table-column prop="averageGPA" label="平均GPA" width="120">
                <template #default="{ row }">
                  <el-tag :type="getGPATagType(row.averageGPA)">
                    {{ safeToFixed(row.averageGPA, 2) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="passRate" label="及格率" width="120">
                <template #default="{ row }">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="bg-green-500 h-2 rounded-full" 
                        :style="{ width: row.passRate + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm">{{ safePercentage(row.passRate, 1) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="excellentRate" label="优秀率" width="120">
                <template #default="{ row }">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="bg-blue-500 h-2 rounded-full" 
                        :style="{ width: row.excellentRate + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm">{{ safePercentage(row.excellentRate, 1) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="failureRate" label="不及格率" width="120">
                <template #default="{ row }">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="bg-red-500 h-2 rounded-full" 
                        :style="{ width: row.failureRate + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm">{{ safePercentage(row.failureRate, 1) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="totalCredits" label="总学分" width="100" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 期末成绩分析 -->
        <el-tab-pane label="期末成绩分析" name="final" lazy>
          <div class="bg-white rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">各专业期末成绩分析</h3>
              <div class="flex gap-2">
                <el-select v-model="selectedMajor" placeholder="选择专业" style="width: 200px">
                  <el-option label="全部专业" value="" />
                  <el-option
                    v-for="major in majorOptions"
                    :key="major"
                    :label="major"
                    :value="major"
                  />
                </el-select>
                <el-button type="primary" @click="exportFinalData">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>

            <el-table :data="finalExamsAnalysis" border stripe>
              <el-table-column prop="courseName" label="课程名称" width="200" />
              <el-table-column prop="courseCode" label="课程代码" width="120" />
              <el-table-column prop="teacher" label="任课教师" width="120" />
              <el-table-column prop="major" label="专业" width="150" />
              <el-table-column prop="studentCount" label="学生数" width="100" />
              <el-table-column prop="avgScore" label="平均分" width="100">
                <template #default="{ row }">
                  <el-tag :type="getScoreTagType(row.avgScore)">
                    {{ safeToFixed(row.avgScore, 1) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="passRate" label="及格率" width="120">
                <template #default="{ row }">
                  {{ safePercentage(row.passRate, 1) }}
                </template>
              </el-table-column>
              <el-table-column prop="excellentRate" label="优秀率" width="120">
                <template #default="{ row }">
                  {{ safePercentage(row.excellentRate, 1) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="text" @click="viewCourseDetail(row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 年级专业分析 -->
        <el-tab-pane label="年级专业分析" name="grade" lazy>
          <div class="grid grid-cols-1 gap-6">
            <!-- 各年级各专业成绩分析表 -->
            <div class="bg-white rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">各年级各专业成绩分析</h3>
              <el-table :data="gradeAndMajorAnalysis" border stripe max-height="400">
                <el-table-column prop="grade" label="年级" width="100" />
                <el-table-column prop="major" label="专业" width="150" />
                <el-table-column prop="averageGPA" label="平均GPA" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getGPATagType(row.averageGPA)">
                      {{ safeToFixed(row.averageGPA, 2) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="averageScore" label="平均分" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getScoreTagType(row.averageScore)">
                      {{ safeToFixed(row.averageScore, 1) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="passRate" label="及格率" width="120">
                  <template #default="{ row }">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          class="bg-green-500 h-2 rounded-full" 
                          :style="{ width: row.passRate + '%' }"
                        ></div>
                      </div>
                      <span class="text-sm">{{ safePercentage(row.passRate, 1) }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="excellentRate" label="优秀率" width="120">
                  <template #default="{ row }">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          class="bg-blue-500 h-2 rounded-full" 
                          :style="{ width: row.excellentRate + '%' }"
                        ></div>
                      </div>
                      <span class="text-sm">{{ safePercentage(row.excellentRate, 1) }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="failureRate" label="不及格率" width="120">
                  <template #default="{ row }">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          class="bg-red-500 h-2 rounded-full" 
                          :style="{ width: row.failureRate + '%' }"
                        ></div>
                      </div>
                      <span class="text-sm">{{ safePercentage(row.failureRate, 1) }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="topCourses" label="优势课程" min-width="160">
                  <template #default="{ row }">
                    <el-tag
                      v-for="course in row.topCourses"
                      :key="course"
                      type="success"
                      size="small"
                      class="mr-1 mb-1"
                    >
                      {{ course }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="weakCourses" label="薄弱课程" min-width="160">
                  <template #default="{ row }">
                    <el-tag
                      v-for="course in row.weakCourses"
                      :key="course"
                      type="danger"
                      size="small"
                      class="mr-1 mb-1"
                    >
                      {{ course }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- GPA分布图表 -->
            <div class="bg-white rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">GPA分布情况</h3>
              <div ref="gpaChartRef" style="height: 300px;"></div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 教师教学分析 -->
        <el-tab-pane label="教师教学分析" name="teacher" lazy>
          <div class="bg-white rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">教师教学情况分析</h3>
              <el-button type="primary" @click="exportTeacherData">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>

            <el-table :data="teacherAnalysis" border stripe>
              <el-table-column prop="teacher" label="教师姓名" width="120" />
              <el-table-column prop="courseCount" label="授课数量" width="100" />
              <el-table-column prop="studentCount" label="学生总数" width="100" />
              <el-table-column prop="avgScore" label="平均分" width="100">
                <template #default="{ row }">
                  <el-tag :type="getScoreTagType(row.avgScore)">
                    {{ safeToFixed(row.avgScore, 1) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="passRate" label="及格率" width="120">
                <template #default="{ row }">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="bg-green-500 h-2 rounded-full" 
                        :style="{ width: row.passRate + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm">{{ safePercentage(row.passRate, 1) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="excellentRate" label="优秀率" width="120">
                <template #default="{ row }">
                  {{ safePercentage(row.excellentRate, 1) }}
                </template>
              </el-table-column>
              <el-table-column prop="courses" label="授课课程" min-width="200">
                <template #default="{ row }">
                  <el-tag
                    v-for="course in row.courses.slice(0, 3)"
                    :key="course"
                    type="info"
                    size="small"
                    class="mr-1 mb-1"
                  >
                    {{ course }}
                  </el-tag>
                  <span v-if="row.courses.length > 3" class="text-gray-500 text-sm">
                    等{{ row.courses.length }}门课程
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 已移除：课程分析选项卡（在报告页已有课程报告） -->
      </el-tabs>
    </div>

    <!-- 课程详情弹窗 -->
    <el-dialog
      v-model="showCourseDetail"
      title="课程详细分析"
      width="80%"
      :before-close="handleCloseDetail"
    >
      <div v-if="selectedCourse">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <el-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ safeToFixed(selectedCourse.avgScore, 1) }}</div>
              <div class="text-sm text-gray-600">平均分</div>
            </div>
          </el-card>
          <el-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ safePercentage(selectedCourse.passRate, 1) }}</div>
              <div class="text-sm text-gray-600">及格率</div>
            </div>
          </el-card>
          <el-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ safePercentage(selectedCourse.excellentRate, 1) }}</div>
              <div class="text-sm text-gray-600">优秀率</div>
            </div>
          </el-card>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold mb-2">成绩分布详情</h4>
          <div ref="courseDetailChartRef" style="height: 300px;"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Document,
  School,
  TrendCharts,
  Upload,
  Download,
  Warning,
  Bell
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { 
  StudentGradeRecord, 
  ProcessedStudentData, 
  BasicInfo, 
  GradeSystemInfo 
} from '@/types'
import { DataAnalyzer } from '@/utils/dataAnalyzer'
import { useDataStore } from '@/stores/dataStore'
import { safeToFixed, safePercentage } from '@/utils/numberUtils'

const router = useRouter()
const dataStore = useDataStore()
const dataAnalyzer = new DataAnalyzer()

// 响应式数据
const activeTab = ref('semester')
const selectedSemester = ref('')
const selectedMajor = ref('')
const showCourseDetail = ref(false)
const selectedCourse = ref<any>(null)

// 从store获取数据
const rawStudentData = computed(() => dataStore.processedData)
const basicInfo = computed(() => dataStore.basicInfo)
const gradeSystemInfo = computed(() => dataStore.gradeSystemInfo)

// 图表引用
const gpaChartRef = ref<HTMLElement>()
const courseDetailChartRef = ref<HTMLElement>()

// 图表实例
let gpaChart: echarts.ECharts | null = null
let courseDetailChart: echarts.ECharts | null = null

// 可见性与尺寸检查
const isContainerReady = (el?: HTMLElement) => {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  const style = window.getComputedStyle(el)
  return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
}

// 计算属性
const hasData = computed(() => dataStore.isDataLoaded && rawStudentData.value.length > 0)

const overallGPA = computed(() => {
  if (!hasData.value) return '0.00'
  const totalCredits = rawStudentData.value.reduce((sum, student) => {
    const validCourses = student.courses.filter(c => !c.isVoid && c.credit > 0)
    return sum + validCourses.reduce((courseSum, course) => courseSum + course.credit, 0)
  }, 0)
  
  const totalGradePoints = rawStudentData.value.reduce((sum, student) => {
    const validCourses = student.courses.filter(c => !c.isVoid && c.credit > 0 && c.gpa > 0)
    return sum + validCourses.reduce((courseSum, course) => courseSum + course.gpa * course.credit, 0)
  }, 0)
  
  return totalCredits > 0 ? safeToFixed(totalGradePoints / totalCredits, 2) : '0.00'
})

// 平均课程数
const avgCourseCount = computed(() => {
  if (!hasData.value || rawStudentData.value.length === 0) return 0
  const totalCourses = rawStudentData.value.reduce((sum, student) => {
    return sum + student.courses.filter(c => !c.isVoid).length
  }, 0)
  return totalCourses / rawStudentData.value.length
})

// 不及格率
const failureRate = computed(() => {
  if (!hasData.value) return 0
  let totalCourses = 0
  let failedCourses = 0
  
  rawStudentData.value.forEach(student => {
    student.courses.forEach(course => {
      if (!course.isVoid && course.score !== undefined && course.score !== null) {
        totalCourses++
        if (course.score < 60) {
          failedCourses++
        }
      }
    })
  })
  
  return totalCourses > 0 ? (failedCourses / totalCourses) * 100 : 0
})

// 学业预警数量
const warningCount = computed(() => {
  if (!hasData.value) return 0
  return rawStudentData.value.filter(student => {
    // 计算学生的GPA和不及格课程数
    const validCourses = student.courses.filter(c => !c.isVoid && c.score !== undefined && c.score !== null)
    if (validCourses.length === 0) return false
    
    const failedCourses = validCourses.filter(c => c.score < 60).length
    const totalCredits = validCourses.reduce((sum, c) => sum + c.credit, 0)
    const gradePoints = validCourses.reduce((sum, c) => sum + c.gpa * c.credit, 0)
    const studentGPA = totalCredits > 0 ? gradePoints / totalCredits : 0
    
    // 学业预警条件：GPA < 1.5 或者不及格课程数 >= 4 或者不及格学分 >= 10
    const failedCredits = validCourses.filter(c => c.score < 60).reduce((sum, c) => sum + c.credit, 0)
    return studentGPA < 1.5 || failedCourses >= 4 || failedCredits >= 10
  }).length
})

const semesterOptions = computed(() => {
  if (!hasData.value) return []
  const semesters = new Set<string>()
  dataStore.rawData.forEach(record => {
    semesters.add(record.semester)
  })
  return Array.from(semesters).sort()
})

const majorOptions = computed(() => {
  if (!hasData.value) return []
  return dataStore.majors
})

const semesterSummary = computed(() => {
  if (!hasData.value) return []
  return dataAnalyzer.analyzeSemesterSummary(rawStudentData.value)
})

const finalExamsAnalysis = computed(() => {
  if (!hasData.value) return []
  const finalExamStats = dataAnalyzer.analyzeFinalExamsByMajor(rawStudentData.value)
  
  // 一次性构建课程代码映射，避免嵌套查找
  const courseCodeMap = new Map<string, string>()
  rawStudentData.value.forEach(student => {
    student.courses.forEach(c => {
      if (!c.isVoid && c.courseCode && c.courseName && c.teacher) {
        const key = `${c.courseName}@@${c.teacher}`
        if (!courseCodeMap.has(key)) {
          courseCodeMap.set(key, c.courseCode)
        }
      }
    })
  })
  
  const result: any[] = []
  finalExamStats.forEach(majorStat => {
    majorStat.courses.forEach(course => {
      const key = `${course.courseName}@@${course.teacher}`
      const courseCode = courseCodeMap.get(key) || ''
      result.push({
        courseName: course.courseName,
        courseCode,
        teacher: course.teacher,
        major: majorStat.major,
        studentCount: course.totalStudents,
        avgScore: course.averageScore,
        passRate: course.passRate,
        excellentRate: course.excellentRate
      })
    })
  })
  
  return result
})

const gradeAndMajorAnalysis = computed(() => {
  if (!hasData.value) return []
  return dataAnalyzer.analyzeByGradeAndMajor(rawStudentData.value)
})

const teacherAnalysis = computed(() => {
  if (!hasData.value) return []
  const teacherStats = dataAnalyzer.analyzeTeachingPerformance(rawStudentData.value)
  
  return teacherStats.map(stat => ({
    teacher: stat.teacher || '未知教师',
    courseCount: (stat.courses || []).length,
    studentCount: stat.totalStudents || 0,
    avgScore: stat.averageScore || 0,
    passRate: stat.passRate || 0,
    excellentRate: stat.excellentRate || 0,
    courses: stat.courses || []
  }))
})

// 课程分析已移除（在报告页提供课程报告），此处不再计算

// 方法
const checkDataStatus = () => {
  if (!dataStore.isDataLoaded) {
    ElMessage.warning('暂无数据，请先导入Excel文件')
    router.push('/import')
    return
  }
  
  // 设置默认选择
  if (semesterOptions.value.length > 0) {
    selectedSemester.value = semesterOptions.value[0]
  }
}

const goToImport = () => {
  router.push('/import')
}

// 标签类型验证函数
const validateTagType = (type: string): string => {
  const validTypes = ['success', 'info', 'warning', 'danger']
  return validTypes.includes(type) ? type : 'info'
}

// 标签类型获取函数
const getGPATagType = (gpa: number | undefined | null) => {
  if (gpa == null || isNaN(gpa)) return validateTagType('info')
  if (gpa >= 3.5) return validateTagType('success')
  if (gpa >= 3.0) return validateTagType('info')
  if (gpa >= 2.5) return validateTagType('warning')
  return validateTagType('danger')
}

const getScoreTagType = (score: number | undefined | null) => {
  if (score == null || isNaN(score)) return validateTagType('info')
  if (score >= 90) return validateTagType('success')
  if (score >= 80) return validateTagType('info')
  if (score >= 70) return validateTagType('warning')
  return validateTagType('danger')
}

const getDifficultyTagType = (difficulty: number | undefined | null) => {
  if (difficulty == null || isNaN(difficulty)) return validateTagType('info')
  if (difficulty >= 0.8) return validateTagType('success')  // 简单
  if (difficulty >= 0.6) return validateTagType('info')         // 中等
  if (difficulty >= 0.4) return validateTagType('warning')  // 较难
  return validateTagType('danger')                          // 困难
}

// 导出功能
const exportSemesterData = () => {
  try {
    const data = semesterSummary.value
    const csvContent = [
      ['专业', '学生数', '平均GPA', '及格率(%)', '优秀率(%)', '不及格率(%)', '总学分'],
      ...data.map(row => [
        row.major,
        row.totalStudents,
        safeToFixed(row.averageGPA, 2),
        safeToFixed(row.passRate, 1),
        safeToFixed(row.excellentRate, 1),
        safeToFixed(row.failureRate, 1),
        row.totalCredits
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `学期成绩汇总_${selectedSemester.value || '全部'}.csv`
    link.click()
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const exportFinalData = () => {
  try {
    const data = finalExamsAnalysis.value
    const csvContent = [
      ['课程名称', '课程代码', '任课教师', '专业', '学生数', '平均分', '及格率(%)', '优秀率(%)'],
      ...data.map(row => [
        row.course,
        row.courseCode || '',
        row.teacher || '',
        row.major || '',
        row.totalStudents,
        safeToFixed(row.averageScore, 1),
        safeToFixed(row.passRate, 1),
        safeToFixed(row.excellentRate, 1)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `期末成绩分析_${selectedMajor.value || '全部专业'}.csv`
    link.click()
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const exportTeacherData = () => {
  try {
    const data = teacherAnalysis.value
    const csvContent = [
      ['教师姓名', '授课数量', '学生总数', '平均分', '及格率(%)', '优秀率(%)', '授课课程'],
      ...data.map(row => [
        row.teacher,
        row.courseCount,
        row.studentCount,
        safeToFixed(row.avgScore, 1),
        safeToFixed(row.passRate, 1),
        safeToFixed(row.excellentRate, 1),
        row.courses.join(';')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `教师教学分析.csv`
    link.click()
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 课程详情
const viewCourseDetail = (course: any) => {
  selectedCourse.value = course
  showCourseDetail.value = true
  nextTick(() => {
    initCourseDetailChart()
  })
}

const handleCloseDetail = () => {
  showCourseDetail.value = false
  selectedCourse.value = null
}

// 图表初始化
const initGPAChart = () => {
  const el = gpaChartRef.value
  if (!el || !hasData.value) return
  if (!isContainerReady(el)) {
    setTimeout(initGPAChart, 100)
    return
  }

  // 清理旧的图表实例
  if (gpaChart) {
    gpaChart.dispose()
  }
  
  gpaChart = echarts.init(el)
  
  // 计算真实GPA分布数据
  const gpaRanges = ['0-1.0', '1.0-2.0', '2.0-2.5', '2.5-3.0', '3.0-3.5', '3.5-4.0']
  const gpaDistribution = gpaRanges.map(range => {
    const [min, max] = range.split('-').map(Number)
    return rawStudentData.value.filter(student => {
      const gpa = student.gpa
      return gpa >= min && gpa < (max === 4.0 ? 4.1 : max)
    }).length
  })

  const option = {
    title: {
      text: 'GPA分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'GPA分布',
        type: 'pie',
        radius: '50%',
        data: gpaRanges.map((range, index) => ({
          value: gpaDistribution[index],
          name: range
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  gpaChart.setOption(option)
}

// 成绩分布图已随课程分析移除

const initCourseDetailChart = () => {
  const el = courseDetailChartRef.value
  if (!el || !selectedCourse.value) return
  if (!isContainerReady(el)) {
    setTimeout(initCourseDetailChart, 100)
    return
  }

  // 清理旧的图表实例
  if (courseDetailChart) {
    courseDetailChart.dispose()
  }
  
  courseDetailChart = echarts.init(courseDetailChartRef.value)
  
  // 计算真实课程详细成绩分布数据
  const scoreRanges = ['0-60', '60-70', '70-80', '80-90', '90-100']
  const courseScores: number[] = []
  
  // 收集该课程的所有成绩
  rawStudentData.value.forEach(student => {
    student.courses.forEach(course => {
      if (!course.isVoid && 
          course.courseName === selectedCourse.value.courseName && 
          course.teacher === selectedCourse.value.teacher &&
          course.normalizedScore !== undefined) {
        courseScores.push(course.normalizedScore)
      }
    })
  })
  
  const distribution = scoreRanges.map(range => {
    const [min, max] = range.split('-').map(Number)
    return courseScores.filter(score => {
      return score >= min && score < (max === 100 ? 101 : max)
    }).length
  })

  const option = {
    title: {
      text: `${selectedCourse.value.courseName} 成绩分布`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: scoreRanges
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: distribution,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ffd666' },
            { offset: 0.5, color: '#ffc53d' },
            { offset: 1, color: '#faad14' }
          ])
        }
      }
    ]
  }

  courseDetailChart.setOption(option)
}

// 生命周期
onMounted(() => {
  checkDataStatus()
  const handleResize = () => {
    gpaChart?.resize()
    courseDetailChart?.resize()
  }
  window.addEventListener('resize', handleResize)

  nextTick(() => {
    if (hasData.value) {
      if (activeTab.value === 'grade') initGPAChart()
    }
  })

  // 标签切换时初始化对应图表
  watch(activeTab, async (tab) => {
    await nextTick()
    if (tab === 'grade') setTimeout(initGPAChart, 0)
  })

  // 课程详情弹窗打开时初始化图表
  watch(showCourseDetail, async (open) => {
    if (open) {
      await nextTick()
      setTimeout(initCourseDetailChart, 0)
    } else if (courseDetailChart) {
      courseDetailChart.dispose()
      courseDetailChart = null
    }
  })
})

onBeforeUnmount(() => {
  // 清理所有图表实例，防止内存泄漏和vnode错误
  if (gpaChart) {
    gpaChart.dispose()
    gpaChart = null
  }
  // 成绩分布图已移除，scoreChart 不再使用
  if (courseDetailChart) {
    courseDetailChart.dispose()
    courseDetailChart = null
  }
  // 移除窗口resize监听
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.analysis-page {
  min-height: calc(100vh - 60px);
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.analysis-tabs :deep(.el-tabs__header) {
  background: white;
  border-radius: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
}

.analysis-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.analysis-tabs :deep(.el-tabs__item) {
  font-weight: 500;
}

.analysis-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
}
</style>