<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">数据预览</h1>
      <p class="text-gray-600">查看导入的学生成绩数据，确认数据准确性后开始分析</p>
    </div>

    <!-- 数据概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-lg">
            <User class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">总学生数</p>
            <p class="text-2xl font-bold text-gray-900">{{ basicInfo?.totalStudents || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-lg">
            <Document class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">课程数量</p>
            <p class="text-2xl font-bold text-gray-900">{{ basicInfo?.courses?.length || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 rounded-lg">
            <User class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">专业数量</p>
            <p class="text-2xl font-bold text-gray-900">{{ basicInfo?.majors?.length || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-3 bg-orange-100 rounded-lg">
            <Warning class="w-6 h-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">数据完整度</p>
            <p class="text-2xl font-bold text-gray-900">{{ dataQuality.completeness }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">专业筛选</label>
          <el-select v-model="selectedMajor" placeholder="选择专业" clearable @change="filterData">
            <el-option
              v-for="major in (basicInfo?.majors || [])"
              :key="major"
              :label="major"
              :value="major"
            />
          </el-select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">班级筛选</label>
          <el-select v-model="selectedClass" placeholder="选择班级" clearable @change="filterData">
            <el-option
              v-for="cls in classList"
              :key="cls"
              :label="cls"
              :value="cls"
            />
          </el-select>
        </div>

        <div class="flex-1"></div>

        <div>
          <el-button @click="exportData">
            导出预览数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">学生成绩数据</h2>
      </div>

      <div class="overflow-x-auto">
        <el-table :data="filteredData" style="width: 100%" stripe>
          <!-- 基本信息 -->
          <el-table-column prop="className" label="班级" width="100" />
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="studentName" label="姓名" width="100" />
          <el-table-column prop="courseName" label="课程名称" width="150" />
          <el-table-column prop="score" label="成绩" width="80">
            <template #default="{ row }">
              <span :class="getScoreColor(row.score)">
                {{ row.score }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="academicYear" label="学年" width="100" />
          <el-table-column prop="semester" label="学期" width="80" />
          <el-table-column prop="studentType" label="学生类别" width="100" />
          <el-table-column prop="college" label="学院" width="120" />
          <el-table-column prop="major" label="专业" width="150" />
          <el-table-column prop="grade" label="年级" width="80" />
          <el-table-column prop="studentMark" label="学生标记" width="100" />
          
          <!-- 课程信息 -->
          <el-table-column prop="teachingCollege" label="开课学院" width="120" />
          <el-table-column prop="courseCode" label="课程代码" width="120" />
          <el-table-column prop="teachingClass" label="教学班" width="100" />
          <el-table-column prop="teacher" label="任课教师" width="100" />
          <el-table-column prop="credit" label="学分" width="80" />
          <el-table-column prop="scoreRemark" label="成绩备注" width="100" />
          <el-table-column prop="examNature" label="考试性质" width="100" />
          <el-table-column prop="gradePoint" label="绩点" width="80" />
          <el-table-column prop="courseMark" label="课程标记" width="100" />
          <el-table-column prop="courseCategory" label="课程类别" width="100" />
          <el-table-column prop="courseBelonging" label="课程归属" width="100" />
          <el-table-column prop="courseNature" label="课程性质" width="100" />
          <el-table-column prop="assessmentMethod" label="考核方式" width="100" />
          <el-table-column prop="isScoreVoid" label="是否成绩作废" width="120">
            <template #default="{ row }">
              <el-tag :type="row.isScoreVoid ? 'danger' : 'success'" size="small">
                {{ row.isScoreVoid ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submitter" label="提交人" width="100" />
          <el-table-column prop="submitTime" label="提交时间" width="150" />
          <el-table-column prop="isDegreeRequired" label="是否学位课程" width="120">
            <template #default="{ row }">
              <el-tag :type="row.isDegreeRequired ? 'success' : 'info'" size="small">
                {{ row.isDegreeRequired ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="gender" label="性别" width="60" />
          <el-table-column prop="majorDirection" label="专业方向" width="120" />
          <el-table-column prop="courseNameEn" label="课程英文名称" width="180" />
          <el-table-column prop="remarks" label="备注信息" width="120" />
          <el-table-column prop="creditGradePoint" label="学分绩点" width="100" />
          <el-table-column prop="courseType" label="开课类型" width="100" />
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="p-6 border-t border-gray-200">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-between mt-6">
      <el-button @click="goBack">
        返回导入
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
import { User, Document, Warning } from '@element-plus/icons-vue'
import type { StudentGradeRecord, BasicInfo } from '@/types'
import { useDataStore } from '@/stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()

// 筛选条件
const selectedMajor = ref('')
const selectedClass = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 从store获取数据
const rawData = computed(() => dataStore.rawData)
const basicInfo = computed(() => dataStore.basicInfo)

// 班级列表
const classList = computed(() => {
  const classes = new Set<string>()
  rawData.value.forEach(record => {
    if (record.className) {
      classes.add(record.className)
    }
  })
  return Array.from(classes).sort()
})

// 过滤后的数据
const filteredData = computed(() => {
  let data = rawData.value
  
  if (selectedMajor.value) {
    data = data.filter(record => record.major === selectedMajor.value)
  }
  
  if (selectedClass.value) {
    data = data.filter(record => record.className === selectedClass.value)
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

// 总记录数
const totalRecords = computed(() => {
  let data = rawData.value
  
  if (selectedMajor.value) {
    data = data.filter(record => record.major === selectedMajor.value)
  }
  
  if (selectedClass.value) {
    data = data.filter(record => record.className === selectedClass.value)
  }
  
  return data.length
})

// 数据质量统计
const dataQuality = computed(() => {
  const totalRecords = rawData.value.length
  const validRecords = rawData.value.filter(record => 
    !record.isScoreVoid && 
    record.score !== null && 
    record.score !== undefined && 
    record.score !== ''
  ).length
  
  return {
    completeness: totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 0,
    validRecords,
    invalidRecords: totalRecords - validRecords
  }
})

// 获取成绩颜色
const getScoreColor = (score: string | number) => {
  if (score === null || score === undefined || score === '') return 'text-gray-400'
  
  const numScore = typeof score === 'number' ? score : parseFloat(String(score))
  if (isNaN(numScore)) return 'text-gray-400'
  
  if (numScore < 60) return 'text-red-600'
  if (numScore < 70) return 'text-orange-600'
  if (numScore < 80) return 'text-yellow-600'
  if (numScore < 90) return 'text-blue-600'
  return 'text-green-600'
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

// 返回导入页面
const goBack = () => {
  router.push('/import')
}

// 跳转到分析页面
const goToAnalysis = () => {
  router.push('/analysis')
}

// 检查数据状态
const checkDataStatus = () => {
  if (!dataStore.isDataLoaded) {
    ElMessage.warning('暂无数据，请先导入Excel文件')
    router.push('/import')
  }
}

onMounted(() => {
  checkDataStatus()
})
</script>