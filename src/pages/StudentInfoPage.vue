<template>
  <div class="px-4 py-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">学生信息管理</h1>
      <p class="text-gray-600">查看和管理学生的基本信息、考试成绩和挂科情况</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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

      <!-- 挂科率筛选 -->
      <div class="flex items-center space-x-4">
        <label class="text-sm font-medium text-gray-700">挂科率范围：</label>
        <el-slider
          v-model="failRateRange"
          range
          :max="100"
          :min="0"
          :step="5"
          @change="handleSearch"
          class="flex-1 max-w-xs"
        />
        <span class="text-sm text-gray-600 min-w-0">
          {{ failRateRange[0] }}% - {{ failRateRange[1] }}%
        </span>
      </div>
    </div>

    <!-- 统计信息卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BookOpen class="w-8 h-8 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">平均考试数</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.avgExamCount.toFixed(1) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <AlertTriangle class="w-8 h-8 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">平均挂科率</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.avgFailRate.toFixed(1) }}%</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TrendingUp class="w-8 h-8 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">平均绩点</p>
            <p class="text-2xl font-bold text-gray-900">{{ statistics.avgGPA.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 学生信息表格 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">学生信息列表</h3>
      </div>
      
      <el-table
        :data="studentList.students"
        v-loading="loading"
        stripe
        class="w-full"
      >
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="major" label="专业" width="150" />
        <el-table-column prop="grade" label="年级" width="80" />
        <el-table-column prop="examCount" label="考试数目" width="100" align="center" />
        <el-table-column prop="failCount" label="挂科数目" width="100" align="center">
          <template #default="{ row }">
            <span :class="row.failCount > 0 ? 'text-red-600 font-medium' : 'text-gray-900'">
              {{ row.failCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="failRate" label="挂科率" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getFailRateTagType(row.failRate)"
              size="small"
            >
              {{ row.failRate.toFixed(1) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gpa" label="平均绩点" width="100" align="center">
          <template #default="{ row }">
            {{ row.gpa.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="passedCredits" label="已获学分" width="100" align="center">
          <template #default="{ row }">
            {{ row.passedCredits }}/{{ row.totalCredits }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="viewStudentDetail(row)"
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
          :total="studentList.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Users, BookOpen, AlertTriangle, TrendingUp } from 'lucide-vue-next'
import type { StudentInfo, StudentInfoList, StudentQueryParams } from '@/types'

const router = useRouter()

// 查询参数
const queryParams = reactive<StudentQueryParams>({
  keyword: '',
  className: '',
  major: '',
  grade: '',
  page: 1,
  pageSize: 20
})

// 挂科率范围
const failRateRange = ref<[number, number]>([0, 100])

// 学生信息列表
const studentList = ref<StudentInfoList>({
  students: [],
  total: 0,
  pageSize: 20,
  currentPage: 1
})

// 加载状态
const loading = ref(false)

// 筛选选项
const classOptions = ref(['人工智能2201', '人工智能2202', '数据科学2201', '数据科学2202', '计算机2201', '计算机2202'])
const majorOptions = ref(['人工智能', '数据科学与大数据技术', '计算机科学与技术'])
const gradeOptions = ref(['2021级', '2022级', '2023级', '2024级'])

// 统计信息
const statistics = computed(() => {
  const students = studentList.value.students
  if (students.length === 0) {
    return {
      totalStudents: 0,
      avgExamCount: 0,
      avgFailRate: 0,
      avgGPA: 0
    }
  }

  return {
    totalStudents: studentList.value.total,
    avgExamCount: students.reduce((sum, s) => sum + s.examCount, 0) / students.length,
    avgFailRate: students.reduce((sum, s) => sum + s.failRate, 0) / students.length,
    avgGPA: students.reduce((sum, s) => sum + s.gpa, 0) / students.length
  }
})

// 模拟学生数据
const mockStudents: StudentInfo[] = [
  {
    studentId: '2022001001',
    studentName: '张三',
    className: '人工智能2201',
    major: '人工智能',
    grade: '2022级',
    examCount: 8,
    failCount: 0,
    failRate: 0,
    gpa: 3.8,
    totalCredits: 120,
    passedCredits: 120
  },
  {
    studentId: '2022001002',
    studentName: '李四',
    className: '人工智能2201',
    major: '人工智能',
    grade: '2022级',
    examCount: 8,
    failCount: 1,
    failRate: 12.5,
    gpa: 3.2,
    totalCredits: 120,
    passedCredits: 115
  },
  {
    studentId: '2022001003',
    studentName: '王五',
    className: '人工智能2202',
    major: '人工智能',
    grade: '2022级',
    examCount: 7,
    failCount: 2,
    failRate: 28.6,
    gpa: 2.8,
    totalCredits: 120,
    passedCredits: 105
  },
  {
    studentId: '2022002001',
    studentName: '赵六',
    className: '数据科学2201',
    major: '数据科学与大数据技术',
    grade: '2022级',
    examCount: 9,
    failCount: 0,
    failRate: 0,
    gpa: 3.9,
    totalCredits: 125,
    passedCredits: 125
  },
  {
    studentId: '2022002002',
    studentName: '钱七',
    className: '数据科学2201',
    major: '数据科学与大数据技术',
    grade: '2022级',
    examCount: 9,
    failCount: 1,
    failRate: 11.1,
    gpa: 3.4,
    totalCredits: 125,
    passedCredits: 120
  },
  {
    studentId: '2022003001',
    studentName: '孙八',
    className: '计算机2201',
    major: '计算机科学与技术',
    grade: '2022级',
    examCount: 10,
    failCount: 3,
    failRate: 30.0,
    gpa: 2.5,
    totalCredits: 130,
    passedCredits: 100
  }
]

// 获取挂科率标签类型
const getFailRateTagType = (failRate: number) => {
  if (failRate === 0) return 'success'
  if (failRate <= 10) return 'warning'
  if (failRate <= 20) return 'danger'
  return 'danger'
}

// 搜索处理
const handleSearch = async () => {
  loading.value = true
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 筛选数据
    let filteredStudents = [...mockStudents]
    
    // 关键词搜索
    if (queryParams.keyword) {
      filteredStudents = filteredStudents.filter(student =>
        student.studentId.includes(queryParams.keyword!) ||
        student.studentName.includes(queryParams.keyword!)
      )
    }
    
    // 班级筛选
    if (queryParams.className) {
      filteredStudents = filteredStudents.filter(student =>
        student.className === queryParams.className
      )
    }
    
    // 专业筛选
    if (queryParams.major) {
      filteredStudents = filteredStudents.filter(student =>
        student.major === queryParams.major
      )
    }
    
    // 年级筛选
    if (queryParams.grade) {
      filteredStudents = filteredStudents.filter(student =>
        student.grade === queryParams.grade
      )
    }
    
    // 挂科率筛选
    filteredStudents = filteredStudents.filter(student =>
      student.failRate >= failRateRange.value[0] &&
      student.failRate <= failRateRange.value[1]
    )
    
    // 分页
    const total = filteredStudents.length
    const start = (queryParams.page - 1) * queryParams.pageSize
    const end = start + queryParams.pageSize
    const students = filteredStudents.slice(start, end)
    
    studentList.value = {
      students,
      total,
      pageSize: queryParams.pageSize,
      currentPage: queryParams.page
    }
  } catch (error) {
    ElMessage.error('获取学生信息失败')
  } finally {
    loading.value = false
  }
}

// 查看学生详情
const viewStudentDetail = (student: StudentInfo) => {
  ElMessage.info(`查看学生 ${student.studentName} 的详细信息`)
  // 这里可以跳转到学生详情页面或打开详情弹窗
}

// 初始化数据
onMounted(() => {
  handleSearch()
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