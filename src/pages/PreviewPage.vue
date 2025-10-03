<template>
  <div class="px-4 py-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">数据预览</h1>
      <p class="text-gray-600">查看和验证已上传的成绩数据，确保数据完整性和准确性</p>
    </div>

    <!-- 基本信息卡片 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-sm text-blue-600 mb-1">学期</div>
          <div class="font-medium text-blue-900">{{ basicInfo.semester }}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-sm text-green-600 mb-1">年级</div>
          <div class="font-medium text-green-900">{{ basicInfo.grade }}</div>
        </div>
        <div class="bg-purple-50 rounded-lg p-4">
          <div class="text-sm text-purple-600 mb-1">学生总数</div>
          <div class="font-medium text-purple-900">{{ basicInfo.totalStudents }}</div>
        </div>
        <div class="bg-orange-50 rounded-lg p-4">
          <div class="text-sm text-orange-600 mb-1">课程数量</div>
          <div class="font-medium text-orange-900">{{ basicInfo.courses.length }}</div>
        </div>
      </div>
    </div>

    <!-- 专业分布 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">专业分布</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="major in majorDistribution" :key="major.name" 
             class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-gray-900 mb-1">{{ major.count }}</div>
          <div class="text-sm text-gray-600">{{ major.name }}</div>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">学生成绩数据</h3>
        <div class="flex space-x-4">
          <el-select v-model="selectedMajor" placeholder="选择专业" clearable @change="filterData">
            <el-option label="全部专业" value="" />
            <el-option 
              v-for="major in basicInfo.majors" 
              :key="major" 
              :label="major" 
              :value="major" 
            />
          </el-select>
          <el-select v-model="selectedClass" placeholder="选择班级" clearable @change="filterData">
            <el-option label="全部班级" value="" />
            <el-option 
              v-for="className in classList" 
              :key="className" 
              :label="className" 
              :value="className" 
            />
          </el-select>
        </div>
      </div>

      <el-table 
        :data="filteredData" 
        stripe 
        border
        height="500"
        :header-cell-style="{ backgroundColor: '#f8fafc', color: '#374151' }"
      >
        <el-table-column prop="studentId" label="学号" width="120" fixed="left" />
        <el-table-column prop="studentName" label="姓名" width="100" fixed="left" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="major" label="专业" width="150" />
        <el-table-column 
          v-for="course in basicInfo.courses" 
          :key="course"
          :prop="course"
          :label="course"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span :class="getScoreColor(getCourseScore(row, course))">
              {{ getCourseScore(row, course) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="平均分" width="80" align="center">
          <template #default="{ row }">
            <span class="font-medium">{{ calculateAverage(row).toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="挂科数" width="80" align="center">
          <template #default="{ row }">
            <span :class="getFailCountColor(getFailCount(row))">
              {{ getFailCount(row) }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-center">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 数据质量检查 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">数据质量检查</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600 mb-1">{{ dataQuality.completeness }}%</div>
          <div class="text-sm text-gray-600">数据完整性</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600 mb-1">{{ dataQuality.validScores }}</div>
          <div class="text-sm text-gray-600">有效成绩数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600 mb-1">{{ dataQuality.missingScores }}</div>
          <div class="text-sm text-gray-600">缺失成绩数</div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-between">
      <el-button @click="goBack">
        返回上传
      </el-button>
      <div class="space-x-4">
        <el-button @click="exportData">
          导出数据
        </el-button>
        <el-button type="primary" @click="goToAnalysis">
          开始分析
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { StudentGrade } from '@/types'

const router = useRouter()

// 基本信息
const basicInfo = ref({
  semester: '2024-2025学年第2学期',
  grade: '2022级',
  totalStudents: 156,
  majors: ['人工智能', '数据科学与大数据技术', '计算机科学与技术'],
  courses: ['高等数学', '线性代数', '概率论与数理统计', '程序设计基础', '数据结构']
})

// 筛选条件
const selectedMajor = ref('')
const selectedClass = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 模拟学生数据
const studentData = ref<StudentGrade[]>([])

// 专业分布
const majorDistribution = computed(() => {
  const distribution = basicInfo.value.majors.map(major => ({
    name: major,
    count: Math.floor(Math.random() * 60) + 30
  }))
  return distribution
})

// 班级列表
const classList = computed(() => {
  const classes = ['AI2201', 'AI2202', 'DS2201', 'DS2202', 'CS2201', 'CS2202']
  return classes
})

// 过滤后的数据
const filteredData = computed(() => {
  let data = studentData.value
  
  if (selectedMajor.value) {
    data = data.filter(student => student.major === selectedMajor.value)
  }
  
  if (selectedClass.value) {
    data = data.filter(student => student.className === selectedClass.value)
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

// 数据质量统计
const dataQuality = computed(() => {
  const totalScores = studentData.value.length * basicInfo.value.courses.length
  const validScores = studentData.value.reduce((count, student) => {
    return count + student.courses.filter(course => course.score > 0).length
  }, 0)
  
  return {
    completeness: Math.round((validScores / totalScores) * 100),
    validScores,
    missingScores: totalScores - validScores
  }
})

// 生成模拟数据
const generateMockData = () => {
  const data: StudentGrade[] = []
  const majors = basicInfo.value.majors
  const classes = classList.value
  
  for (let i = 1; i <= basicInfo.value.totalStudents; i++) {
    const major = majors[Math.floor(Math.random() * majors.length)]
    const className = classes[Math.floor(Math.random() * classes.length)]
    
    const courses = basicInfo.value.courses.map(courseName => ({
      courseName,
      courseCode: `CS${Math.floor(Math.random() * 1000)}`,
      teacher: `教师${Math.floor(Math.random() * 10) + 1}`,
      credit: 3,
      score: Math.random() > 0.05 ? Math.floor(Math.random() * 40) + 60 : 0, // 5%概率缺失成绩
      isPassed: false,
      courseType: '基础课'
    }))
    
    courses.forEach(course => {
      course.isPassed = course.score >= 60
    })
    
    data.push({
      studentId: `2022${String(i).padStart(4, '0')}`,
      studentName: `学生${i}`,
      className,
      major,
      grade: basicInfo.value.grade,
      semester: basicInfo.value.semester,
      courses
    })
  }
  
  studentData.value = data
}

// 获取课程成绩
const getCourseScore = (student: StudentGrade, courseName: string) => {
  const course = student.courses.find(c => c.courseName === courseName)
  return course?.score || 0
}

// 获取成绩颜色
const getScoreColor = (score: number) => {
  if (score === 0) return 'text-gray-400'
  if (score < 60) return 'text-red-600'
  if (score < 70) return 'text-orange-600'
  if (score < 80) return 'text-yellow-600'
  if (score < 90) return 'text-blue-600'
  return 'text-green-600'
}

// 计算平均分
const calculateAverage = (student: StudentGrade) => {
  const validScores = student.courses.filter(c => c.score > 0)
  if (validScores.length === 0) return 0
  const sum = validScores.reduce((total, course) => total + course.score, 0)
  return sum / validScores.length
}

// 获取挂科数
const getFailCount = (student: StudentGrade) => {
  return student.courses.filter(c => c.score > 0 && c.score < 60).length
}

// 获取挂科数颜色
const getFailCountColor = (count: number) => {
  if (count === 0) return 'text-green-600'
  if (count <= 2) return 'text-orange-600'
  return 'text-red-600'
}

// 筛选数据
const filterData = () => {
  currentPage.value = 1
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出功能开发中...')
}

// 返回上传页面
const goBack = () => {
  router.push('/upload')
}

// 跳转到分析页面
const goToAnalysis = () => {
  router.push('/report')
}

onMounted(() => {
  generateMockData()
})
</script>