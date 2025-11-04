<template>
  <div class="min-h-screen bg-gradient-to-br  to-indigo-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">学生信息管理</h1>
        <p class="text-gray-600">查看学生基本信息、个人成绩汇总和学业预警</p>
      </div>

      <!-- 数据状态检查 -->
      <div v-if="!hasData" class="bg-white rounded-lg shadow-lg p-8 text-center">
        <el-icon class="text-6xl text-gray-400 mb-4">
          <DocumentRemove />
        </el-icon>
        <h2 class="text-xl font-semibold text-gray-900 mb-4">暂无数据</h2>
        <p class="text-gray-600 mb-6">请先导入Excel成绩数据</p>
        <el-button type="primary" @click="goToImport">导入数据</el-button>
      </div>

      <div v-else>
        <!-- 搜索和筛选区域 -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <!-- 搜索框 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">搜索学生</label>
              <el-input
                v-model="queryParams.keyword"
                placeholder="输入学号或姓名"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <Search class="w-4 h-4 text-gray-400" />
                </template>
              </el-input>
            </div>

            <!-- 班级筛选 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">班级</label>
              <el-select
                v-model="queryParams.className"
                placeholder="选择班级"
                clearable
                @change="handleSearch"
                class="w-full"
              >
                <el-option
                  v-for="className in classOptions"
                  :key="className"
                  :label="className"
                  :value="className"
                />
              </el-select>
            </div>

            <!-- 专业筛选 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">专业</label>
              <el-select
                v-model="queryParams.major"
                placeholder="选择专业"
                clearable
                @change="handleSearch"
                class="w-full"
              >
                <el-option
                  v-for="major in majorOptions"
                  :key="major"
                  :label="major"
                  :value="major"
                />
              </el-select>
            </div>

            <!-- 年级筛选 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">年级</label>
              <el-select
                v-model="queryParams.grade"
                placeholder="选择年级"
                clearable
                @change="handleSearch"
                class="w-full"
              >
                <el-option
                  v-for="grade in gradeOptions"
                  :key="grade"
                  :label="grade"
                  :value="grade"
                />
              </el-select>
            </div>
          </div>

          <!-- 学业预警筛选 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">GPA范围：</label>
              <el-slider
                v-model="gpaRange"
                range
                :max="4"
                :min="0"
                :step="0.1"
                @change="handleSearch"
                class="flex-1 max-w-xs"
              />
              <span class="text-sm text-gray-600 min-w-0">
                {{ gpaRange[0] }} - {{ gpaRange[1] }}
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <el-checkbox v-model="showWarningOnly" @change="handleSearch">
                仅显示学业预警
              </el-checkbox>
            </div>
          </div>
        </div>

        <!-- 统计信息卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Users class="w-8 h-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">学生总数</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.totalStudents }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <BookOpen class="w-8 h-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">平均课程数</p>
                <p class="text-2xl font-bold text-gray-900">{{ safeToFixed(statistics.avgCourseCount, 1) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <TrendingUp class="w-8 h-8 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">平均GPA</p>
                <p class="text-2xl font-bold text-gray-900">{{ safeToFixed(statistics.avgGPA, 2) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <AlertTriangle class="w-8 h-8 text-red-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">不及格率</p>
                <p class="text-2xl font-bold text-gray-900">{{ safeToFixed(statistics.failRate, 1) }}%</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <AlertCircle class="w-8 h-8 text-orange-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">学业预警</p>
                <p class="text-2xl font-bold text-gray-900">{{ statistics.warningCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 学生信息表格 -->
        <div class="bg-white rounded-lg shadow-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">学生信息列表</h3>
          </div>
          
          <el-table
            :data="displayStudents"
            v-loading="loading"
            stripe
            class="w-full"
            @row-click="viewStudentDetail"
          >
            <el-table-column prop="studentId" label="学号" width="120" />
            <el-table-column prop="studentName" label="姓名" width="100" />
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column prop="major" label="专业" width="150" />
            <el-table-column prop="grade" label="年级" width="80" />
            <el-table-column prop="gender" label="性别" width="60" align="center" />
            <el-table-column prop="courseCount" label="课程数" width="80" align="center" />
            <el-table-column prop="failedCount" label="不及格数" width="100" align="center">
              <template #default="{ row }">
                <span :class="row.failedCount > 0 ? 'text-red-600 font-medium' : 'text-gray-900'">
                  {{ row.failedCount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="gpa" label="GPA" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getGPATagType(row.gpa)" size="small">
                  {{ safeToFixed(row.gpa, 2) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="totalCredits" label="总学分" width="80" align="center" />
            <el-table-column prop="passedCredits" label="已获学分" width="100" align="center" />
            <el-table-column label="学业状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getWarningTagType(row)" size="small">
                  {{ getWarningText(row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="viewStudentDetail(row)"
                >
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="px-6 py-4 border-t border-gray-200">
            <el-pagination
              v-model:current-page="queryParams.page"
              v-model:page-size="queryParams.pageSize"
              :total="filteredStudents.length"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePageChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>

        <!-- 学生详情弹窗 -->
        <el-dialog
          v-model="showDetailDialog"
          :title="`${selectedStudent?.studentName} - 详细信息`"
          width="80%"
          top="5vh"
        >
          <div v-if="selectedStudent" class="space-y-6">
            <!-- 基本信息 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">基本信息</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span class="text-gray-600">学号：</span>{{ selectedStudent.studentId }}</div>
                <div><span class="text-gray-600">姓名：</span>{{ selectedStudent.studentName }}</div>
                <div><span class="text-gray-600">性别：</span>{{ selectedStudent.gender }}</div>
                <div><span class="text-gray-600">班级：</span>{{ selectedStudent.className }}</div>
                <div><span class="text-gray-600">专业：</span>{{ selectedStudent.major }}</div>
                <div><span class="text-gray-600">年级：</span>{{ selectedStudent.grade }}</div>
                <div><span class="text-gray-600">学生类别：</span>{{ selectedStudent.studentType }}</div>
                <div><span class="text-gray-600">学院：</span>{{ selectedStudent.college }}</div>
              </div>
            </div>

            <!-- 成绩汇总 -->
            <div class="bg-blue-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">成绩汇总</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ selectedStudent.courseCount }}</div>
                  <div class="text-sm text-gray-600">总课程数</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ safeToFixed(selectedStudent.gpa, 2) }}</div>
                  <div class="text-sm text-gray-600">平均GPA</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600">{{ selectedStudent.totalCredits }}</div>
                  <div class="text-sm text-gray-600">总学分</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold" :class="selectedStudent.failedCount > 0 ? 'text-red-600' : 'text-green-600'">
                    {{ selectedStudent.failedCount }}
                  </div>
                  <div class="text-sm text-gray-600">不及格课程</div>
                </div>
              </div>
            </div>

            <!-- 课程成绩详情 -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-4">课程成绩详情</h4>
              <el-table :data="selectedStudent.courses" max-height="300">
                <el-table-column prop="courseName" label="课程名称" width="200" />
                <el-table-column prop="courseCode" label="课程代码" width="120" />
                <el-table-column prop="teacher" label="任课教师" width="100" />
                <el-table-column prop="credit" label="学分" width="80" align="center" />
                <el-table-column prop="score" label="原始成绩" width="100" align="center" />
                <el-table-column prop="normalizedScore" label="标准化成绩" width="120" align="center" />
                <el-table-column prop="gpa" label="绩点" width="80" align="center">
                  <template #default="{ row }">
                    {{ safeToFixed(row.gpa, 2) }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="80" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.isPassed ? 'success' : 'danger'" size="small">
                      {{ row.isPassed ? '及格' : '不及格' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="semester" label="学期" width="100" />
              </el-table>
            </div>

            <!-- 学业预警 -->
            <div v-if="getWarningText(selectedStudent) !== '正常'" class="bg-red-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-red-900 mb-2">学业预警</h4>
              <div class="text-red-800">
                <p v-if="selectedStudent.gpa < 2.0">GPA过低（{{ safeToFixed(selectedStudent.gpa, 2) }}），需要提高学习成绩</p>
                <p v-if="selectedStudent.failedCount >= 3">不及格课程过多（{{ selectedStudent.failedCount }}门），需要重点关注</p>
                <p v-if="selectedStudent.passedCredits / selectedStudent.totalCredits < 0.8">学分获得率较低，需要加强学习</p>
              </div>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Users, BookOpen, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-vue-next'
import type { ProcessedStudentData, BasicInfo, GradeSystemInfo } from '@/types'
import { dataAnalyzer } from '@/utils/dataAnalyzer'
import { useDataStore } from '@/stores/dataStore'
import { safeToFixed } from '@/utils/numberUtils'
import {DocumentRemove} from "@element-plus/icons-vue";

const router = useRouter()
const dataStore = useDataStore()

// 查询参数
const queryParams = reactive({
  keyword: '',
  className: '',
  major: '',
  grade: '',
  page: 1,
  pageSize: 20
})

// 筛选条件
const gpaRange = ref<[number, number]>([0, 4])
const showWarningOnly = ref(false)
const loading = ref(false)

// 从store获取数据
const rawStudentData = computed(() => dataStore.processedData || [])
const basicInfo = computed(() => dataStore.basicInfo)
const gradeSystemInfo = computed(() => dataStore.gradeSystemInfo)

// 弹窗状态
const showDetailDialog = ref(false)
const selectedStudent = ref<ProcessedStudentData | null>(null)

// 检查是否有数据
const hasData = computed(() => dataStore.isDataLoaded && rawStudentData.value && rawStudentData.value.length > 0)

// 筛选选项（从实际数据中提取）
const classOptions = computed(() => {
  if (!hasData.value) return []
  return [...new Set(rawStudentData.value.map(s => s.className))].sort()
})

const majorOptions = computed(() => {
  if (!hasData.value) return []
  return [...new Set(rawStudentData.value.map(s => s.major))].sort()
})

const gradeOptions = computed(() => {
  if (!hasData.value) return []
  return [...new Set(rawStudentData.value.map(s => s.grade))].sort()
})

// 筛选后的学生数据
const filteredStudents = computed(() => {
  if (!hasData.value) return []
  
  let filtered = [...rawStudentData.value]
  
  // 关键词搜索
  if (queryParams.keyword) {
    filtered = filtered.filter(student =>
      student.studentId.includes(queryParams.keyword) ||
      student.studentName.includes(queryParams.keyword)
    )
  }
  
  // 班级筛选
  if (queryParams.className) {
    filtered = filtered.filter(student => student.className === queryParams.className)
  }
  
  // 专业筛选
  if (queryParams.major) {
    filtered = filtered.filter(student => student.major === queryParams.major)
  }
  
  // 年级筛选
  if (queryParams.grade) {
    filtered = filtered.filter(student => student.grade === queryParams.grade)
  }
  
  // GPA范围筛选
  filtered = filtered.filter(student =>
    student.gpa >= gpaRange.value[0] && student.gpa <= gpaRange.value[1]
  )
  
  // 学业预警筛选
  if (showWarningOnly.value) {
    filtered = filtered.filter(student => 
      student.gpa < 2.0 || 
      student.failedCount >= 3 || 
      student.passedCredits / student.totalCredits < 0.8
    )
  }
  
  return filtered
})

// 分页显示的学生数据
const displayStudents = computed(() => {
  const start = (queryParams.page - 1) * queryParams.pageSize
  const end = start + queryParams.pageSize
  return filteredStudents.value.slice(start, end)
})

// 统计信息
const statistics = computed(() => {
  if (!hasData.value) {
    return {
      totalStudents: 0,
      avgCourseCount: 0,
      avgGPA: 0,
      failRate: 0,
      warningCount: 0
    }
  }

  const students = filteredStudents.value
  const totalCourses = students.reduce((sum, s) => sum + s.courseCount, 0)
  const totalFailedCourses = students.reduce((sum, s) => sum + s.failedCount, 0)
  const warningCount = students.filter(s => 
    s.gpa < 2.0 || s.failedCount >= 3 || s.passedCredits / s.totalCredits < 0.8
  ).length

  return {
    totalStudents: students.length,
    avgCourseCount: students.length > 0 ? totalCourses / students.length : 0,
    avgGPA: students.length > 0 ? students.reduce((sum, s) => sum + s.gpa, 0) / students.length : 0,
    failRate: totalCourses > 0 ? (totalFailedCourses / totalCourses) * 100 : 0,
    warningCount
  }
})

// 检查数据状态
const checkDataStatus = () => {
  if (!dataStore.isDataLoaded) {
    ElMessage.warning('暂无数据，请先导入Excel文件')
    router.push('/import')
  }
}

// 标签类型验证函数，统一只允许 Element Plus 支持的类型
const validateTagType = (type: string): string => {
  const validTypes = ['success', 'info', 'warning', 'danger']
  return validTypes.includes(type) ? type : 'info'
}

// 获取GPA标签类型
const getGPATagType = (gpa: number) => {
  if (isNaN(gpa)) return validateTagType('info')
  if (gpa >= 3.5) return validateTagType('success')
  if (gpa >= 3.0) return validateTagType('info')
  if (gpa >= 2.5) return validateTagType('warning')
  return validateTagType('danger')
}

// 获取学业预警标签类型
const getWarningTagType = (student: ProcessedStudentData) => {
  if (student.gpa < 2.0 || student.failedCount >= 3 || student.passedCredits / student.totalCredits < 0.8) {
    return validateTagType('danger')
  }
  if (student.gpa < 2.5 || student.failedCount >= 2) {
    return validateTagType('warning')
  }
  return validateTagType('success')
}

// 获取学业预警文本
const getWarningText = (student: ProcessedStudentData) => {
  if (student.gpa < 2.0) return '严重预警'
  if (student.failedCount >= 3) return '严重预警'
  if (student.passedCredits / student.totalCredits < 0.8) return '严重预警'
  if (student.gpa < 2.5 || student.failedCount >= 2) return '一般预警'
  return '正常'
}

// 搜索处理
const handleSearch = () => {
  queryParams.page = 1 // 重置到第一页
}

// 分页处理
const handlePageChange = () => {
  // 分页变化时不需要额外处理，computed会自动更新
}

// 查看学生详情
const viewStudentDetail = (student: ProcessedStudentData) => {
  selectedStudent.value = student
  showDetailDialog.value = true
}

// 跳转到导入页面
const goToImport = () => {
  router.push('/import')
}

// 初始化数据
onMounted(() => {
  checkDataStatus()
})
</script>

<style scoped>
:deep(.el-table) {
  border-radius: 0;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  color: #374151;
  font-weight: 600;
}

:deep(.el-pagination) {
  justify-content: center;
}
</style>