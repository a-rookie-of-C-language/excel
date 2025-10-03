<template>
  <div class="px-4 py-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">成绩分析报告</h1>
      <p class="text-gray-600">全面分析学生成绩数据，生成详细的统计报告和可视化图表</p>
    </div>

    <!-- 总体统计 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">总体统计</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-blue-50 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">{{ overallStats.averageScore.toFixed(1) }}</div>
          <div class="text-sm text-blue-800">平均分</div>
        </div>
        <div class="bg-green-50 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">{{ overallStats.passRate.toFixed(1) }}%</div>
          <div class="text-sm text-green-800">及格率</div>
        </div>
        <div class="bg-orange-50 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-orange-600 mb-2">{{ overallStats.excellentRate.toFixed(1) }}%</div>
          <div class="text-sm text-orange-800">优秀率</div>
        </div>
        <div class="bg-red-50 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-red-600 mb-2">{{ overallStats.failRate.toFixed(1) }}%</div>
          <div class="text-sm text-red-800">不及格率</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- 成绩分布图 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">成绩分布</h3>
        <div class="h-80">
          <v-chart :option="scoreDistributionOption" class="w-full h-full" />
        </div>
      </div>

      <!-- 专业对比图 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">专业平均分对比</h3>
        <div class="h-80">
          <v-chart :option="majorComparisonOption" class="w-full h-full" />
        </div>
      </div>

      <!-- 课程难度分析 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">课程难度分析</h3>
        <div class="h-80">
          <v-chart :option="courseDifficultyOption" class="w-full h-full" />
        </div>
      </div>

      <!-- 成绩趋势图 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">各分数段分布</h3>
        <div class="h-80">
          <v-chart :option="gradeTrendOption" class="w-full h-full" />
        </div>
      </div>
    </div>

    <!-- 详细分析表格 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">课程详细分析</h3>
      <el-table 
        :data="courseAnalysis" 
        stripe 
        border
        :header-cell-style="{ backgroundColor: '#f8fafc', color: '#374151' }"
      >
        <el-table-column prop="courseName" label="课程名称" width="150" />
        <el-table-column prop="averageScore" label="平均分" width="100" align="center">
          <template #default="{ row }">
            <span :class="getScoreColor(row.averageScore)">
              {{ row.averageScore.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="maxScore" label="最高分" width="100" align="center" />
        <el-table-column prop="minScore" label="最低分" width="100" align="center" />
        <el-table-column prop="passRate" label="及格率" width="100" align="center">
          <template #default="{ row }">
            <span :class="getPassRateColor(row.passRate)">
              {{ row.passRate.toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="excellentRate" label="优秀率" width="100" align="center">
          <template #default="{ row }">
            {{ row.excellentRate.toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="standardDeviation" label="标准差" width="100" align="center">
          <template #default="{ row }">
            {{ row.standardDeviation.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度评级" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getDifficultyType(row.difficulty)">
              {{ row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 专业分析 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">专业分析</h3>
      <el-table 
        :data="majorAnalysis" 
        stripe 
        border
        :header-cell-style="{ backgroundColor: '#f8fafc', color: '#374151' }"
      >
        <el-table-column prop="majorName" label="专业名称" width="200" />
        <el-table-column prop="studentCount" label="学生人数" width="120" align="center" />
        <el-table-column prop="averageScore" label="平均分" width="100" align="center">
          <template #default="{ row }">
            <span :class="getScoreColor(row.averageScore)">
              {{ row.averageScore.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="及格率" width="100" align="center">
          <template #default="{ row }">
            <span :class="getPassRateColor(row.passRate)">
              {{ row.passRate.toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="excellentRate" label="优秀率" width="100" align="center">
          <template #default="{ row }">
            {{ row.excellentRate.toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="failCount" label="挂科人数" width="120" align="center">
          <template #default="{ row }">
            <span class="text-red-600">{{ row.failCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ranking" label="排名" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getRankingType(row.ranking)">
              {{ row.ranking }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-between">
      <el-button @click="goBack">
        返回预览
      </el-button>
      <div class="space-x-4">
        <el-button @click="exportReport">
          导出报告
        </el-button>
        <el-button type="primary" @click="goToExport">
          生成详细报告
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'

const router = useRouter()

// 模拟数据
const mockData = ref({
  courses: ['高等数学', '线性代数', '概率论与数理统计', '程序设计基础', '数据结构'],
  majors: ['人工智能', '数据科学与大数据技术', '计算机科学与技术'],
  students: [] as any[]
})

// 总体统计
const overallStats = computed(() => {
  const allScores = mockData.value.students.flatMap(s => s.scores.filter((score: number) => score > 0))
  const totalScores = allScores.length
  
  if (totalScores === 0) return { averageScore: 0, passRate: 0, excellentRate: 0, failRate: 0 }
  
  const averageScore = allScores.reduce((sum: number, score: number) => sum + score, 0) / totalScores
  const passCount = allScores.filter((score: number) => score >= 60).length
  const excellentCount = allScores.filter((score: number) => score >= 90).length
  const failCount = allScores.filter((score: number) => score < 60).length
  
  return {
    averageScore,
    passRate: (passCount / totalScores) * 100,
    excellentRate: (excellentCount / totalScores) * 100,
    failRate: (failCount / totalScores) * 100
  }
})

// 课程分析数据
const courseAnalysis = computed(() => {
  return mockData.value.courses.map((course, index) => {
    const scores = mockData.value.students
      .map(s => s.scores[index])
      .filter(score => score > 0)
    
    if (scores.length === 0) {
      return {
        courseName: course,
        averageScore: 0,
        maxScore: 0,
        minScore: 0,
        passRate: 0,
        excellentRate: 0,
        standardDeviation: 0,
        difficulty: '未知'
      }
    }
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores)
    const passCount = scores.filter(score => score >= 60).length
    const excellentCount = scores.filter(score => score >= 90).length
    const passRate = (passCount / scores.length) * 100
    const excellentRate = (excellentCount / scores.length) * 100
    
    // 计算标准差
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // 难度评级
    let difficulty = '中等'
    if (passRate >= 90) difficulty = '简单'
    else if (passRate >= 70) difficulty = '较易'
    else if (passRate >= 50) difficulty = '中等'
    else if (passRate >= 30) difficulty = '较难'
    else difficulty = '困难'
    
    return {
      courseName: course,
      averageScore,
      maxScore,
      minScore,
      passRate,
      excellentRate,
      standardDeviation,
      difficulty
    }
  })
})

// 专业分析数据
const majorAnalysis = computed(() => {
  return mockData.value.majors.map((major, majorIndex) => {
    const majorStudents = mockData.value.students.filter(s => s.majorIndex === majorIndex)
    const allScores = majorStudents.flatMap(s => s.scores.filter((score: number) => score > 0))
    
    if (allScores.length === 0) {
      return {
        majorName: major,
        studentCount: majorStudents.length,
        averageScore: 0,
        passRate: 0,
        excellentRate: 0,
        failCount: 0,
        ranking: 3
      }
    }
    
    const averageScore = allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length
    const passCount = allScores.filter((score: number) => score >= 60).length
    const excellentCount = allScores.filter((score: number) => score >= 90).length
    const failStudents = majorStudents.filter(s => s.scores.some((score: number) => score > 0 && score < 60))
    
    return {
      majorName: major,
      studentCount: majorStudents.length,
      averageScore,
      passRate: (passCount / allScores.length) * 100,
      excellentRate: (excellentCount / allScores.length) * 100,
      failCount: failStudents.length,
      ranking: majorIndex + 1
    }
  }).sort((a, b) => b.averageScore - a.averageScore)
    .map((item, index) => ({ ...item, ranking: index + 1 }))
})

// 成绩分布图配置
const scoreDistributionOption = computed(() => ({
  title: {
    text: '成绩分布',
    left: 'center',
    textStyle: { fontSize: 14 }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['优秀(90-100)', '良好(80-89)', '中等(70-79)', '及格(60-69)', '不及格(0-59)']
  },
  series: [
    {
      name: '成绩分布',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 25, name: '优秀(90-100)' },
        { value: 35, name: '良好(80-89)' },
        { value: 40, name: '中等(70-79)' },
        { value: 35, name: '及格(60-69)' },
        { value: 21, name: '不及格(0-59)' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))

// 专业对比图配置
const majorComparisonOption = computed(() => ({
  title: {
    text: '专业平均分对比',
    left: 'center',
    textStyle: { fontSize: 14 }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  xAxis: {
    type: 'category',
    data: mockData.value.majors,
    axisLabel: {
      interval: 0,
      rotate: 45
    }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100
  },
  series: [
    {
      name: '平均分',
      type: 'bar',
      data: [78.5, 82.3, 75.8],
      itemStyle: {
        color: '#3b82f6'
      }
    }
  ]
}))

// 课程难度分析配置
const courseDifficultyOption = computed(() => ({
  title: {
    text: '课程难度分析',
    left: 'center',
    textStyle: { fontSize: 14 }
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['平均分', '及格率']
  },
  xAxis: {
    type: 'category',
    data: mockData.value.courses,
    axisLabel: {
      interval: 0,
      rotate: 45
    }
  },
  yAxis: [
    {
      type: 'value',
      name: '平均分',
      min: 0,
      max: 100,
      position: 'left'
    },
    {
      type: 'value',
      name: '及格率(%)',
      min: 0,
      max: 100,
      position: 'right'
    }
  ],
  series: [
    {
      name: '平均分',
      type: 'bar',
      data: [75.2, 68.5, 72.8, 81.3, 69.7],
      itemStyle: { color: '#10b981' }
    },
    {
      name: '及格率',
      type: 'line',
      yAxisIndex: 1,
      data: [85.5, 72.3, 78.9, 92.1, 74.6],
      itemStyle: { color: '#f59e0b' }
    }
  ]
}))

// 各分数段分布配置
const gradeTrendOption = computed(() => ({
  title: {
    text: '各分数段分布',
    left: 'center',
    textStyle: { fontSize: 14 }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  xAxis: {
    type: 'category',
    data: ['0-59', '60-69', '70-79', '80-89', '90-100']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '人数',
      type: 'bar',
      data: [21, 35, 40, 35, 25],
      itemStyle: {
        color: function(params: any) {
          const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
          return colors[params.dataIndex]
        }
      }
    }
  ]
}))

// 生成模拟数据
const generateMockData = () => {
  const students = []
  for (let i = 0; i < 156; i++) {
    const majorIndex = Math.floor(Math.random() * 3)
    const scores = mockData.value.courses.map(() => {
      // 5%概率缺失成绩
      if (Math.random() < 0.05) return 0
      return Math.floor(Math.random() * 40) + 60
    })
    
    students.push({
      id: i + 1,
      majorIndex,
      scores
    })
  }
  mockData.value.students = students
}

// 获取成绩颜色
const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-blue-600'
  if (score >= 80) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  if (score >= 60) return 'text-orange-600'
  return 'text-red-600'
}

// 获取及格率颜色
const getPassRateColor = (rate: number) => {
  if (rate >= 90) return 'text-green-600'
  if (rate >= 80) return 'text-blue-600'
  if (rate >= 70) return 'text-yellow-600'
  if (rate >= 60) return 'text-orange-600'
  return 'text-red-600'
}

// 获取难度类型
const getDifficultyType = (difficulty: string) => {
  const typeMap: Record<string, string> = {
    '简单': 'success',
    '较易': 'primary',
    '中等': 'warning',
    '较难': 'danger',
    '困难': 'danger'
  }
  return typeMap[difficulty] || 'info'
}

// 获取排名类型
const getRankingType = (ranking: number) => {
  if (ranking === 1) return 'success'
  if (ranking === 2) return 'primary'
  if (ranking === 3) return 'warning'
  return 'info'
}

// 导出报告
const exportReport = () => {
  ElMessage.success('报告导出功能开发中...')
}

// 返回预览页面
const goBack = () => {
  router.push('/preview')
}

// 跳转到导出页面
const goToExport = () => {
  router.push('/export')
}

onMounted(() => {
  generateMockData()
})
</script>