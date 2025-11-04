<template>
  <div class="px-4 py-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">成绩分析报告</h1>
      <p class="text-gray-600">全面分析学生成绩数据，生成详细的统计报告和可视化图表</p>
    </div>

    <!-- 数据状态 -->
    <div v-if="dataStore.isLoading" class="text-center py-10 text-gray-500">数据加载中...</div>
    <div v-else-if="!hasData" class="text-center py-12">
      <el-empty description="暂无数据">
        <template #image>
          <div class="text-6xl text-gray-300 mb-4">📄</div>
        </template>
        <template #description>
          <p class="text-gray-500 mb-4">请先导入Excel成绩数据</p>
        </template>
        <el-button type="primary" @click="goToImport">导入数据</el-button>
      </el-empty>
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
import { useDataStore } from '@/stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()

// 数据加载状态与数据源
const rawStudentData = computed(() => dataStore.processedData || [])
const hasData = computed(() => dataStore.isDataLoaded && rawStudentData.value.length > 0)

// 总体统计（使用真实数据）
const overallStats = computed(() => {
  if (!hasData.value) return { averageScore: 0, passRate: 0, excellentRate: 0, failRate: 0 }

  const scores: number[] = []
  rawStudentData.value.forEach(s => {
    s.courses.forEach(c => {
      if (!c.isVoid && typeof c.score === 'number' && Number.isFinite(c.score)) {
        scores.push(Number(c.score))
      }
    })
  })

  const total = scores.length
  if (total === 0) return { averageScore: 0, passRate: 0, excellentRate: 0, failRate: 0 }

  const sum = scores.reduce((acc, v) => acc + v, 0)
  const averageScore = sum / total
  const passCount = scores.filter(v => v >= 60).length
  const excellentCount = scores.filter(v => v >= 90).length
  const failCount = scores.filter(v => v < 60).length

  return {
    averageScore,
    passRate: (passCount / total) * 100,
    excellentRate: (excellentCount / total) * 100,
    failRate: (failCount / total) * 100,
  }
})

// 课程分析（使用真实数据）
const courseAnalysis = computed(() => {
  if (!hasData.value) return []

  const courseMap: Record<string, { sum: number; count: number; max: number; min: number; pass: number; excellent: number; squares: number }> = {}

  rawStudentData.value.forEach(s => {
    s.courses.forEach(c => {
      if (c.isVoid || typeof c.score !== 'number' || !Number.isFinite(c.score)) return
      const key = c.courseName || '未知课程'
      const score = Number(c.score)
      if (!courseMap[key]) {
        courseMap[key] = { sum: 0, count: 0, max: -Infinity, min: Infinity, pass: 0, excellent: 0, squares: 0 }
      }
      const bucket = courseMap[key]
      bucket.sum += score
      bucket.count += 1
      bucket.max = Math.max(bucket.max, score)
      bucket.min = Math.min(bucket.min, score)
      bucket.pass += score >= 60 ? 1 : 0
      bucket.excellent += score >= 85 ? 1 : 0
      bucket.squares += score * score
    })
  })

  return Object.entries(courseMap).map(([courseName, v]) => {
    const averageScore = v.count ? v.sum / v.count : 0
    const variance = v.count ? (v.squares / v.count) - averageScore * averageScore : 0
    const standardDeviation = Math.sqrt(Math.max(variance, 0))
    const passRate = v.count ? (v.pass / v.count) * 100 : 0
    const excellentRate = v.count ? (v.excellent / v.count) * 100 : 0

    let difficulty = '中等'
    if (passRate >= 90) difficulty = '简单'
    else if (passRate >= 70) difficulty = '较易'
    else if (passRate >= 50) difficulty = '中等'
    else if (passRate >= 30) difficulty = '较难'
    else difficulty = '困难'

    return {
      courseName,
      averageScore,
      maxScore: v.max === -Infinity ? 0 : v.max,
      minScore: v.min === Infinity ? 0 : v.min,
      passRate,
      excellentRate,
      standardDeviation,
      difficulty,
    }
  }).sort((a, b) => b.averageScore - a.averageScore)
})

// 专业分析（使用真实数据）
const majorAnalysis = computed(() => {
  if (!hasData.value) return []

  const majors = [...new Set(rawStudentData.value.map(s => s.major || '未知专业'))]

  const result = majors.map((major) => {
    const students = rawStudentData.value.filter(s => (s.major || '未知专业') === major)
    const scores: number[] = []
    let failStudents = 0

    students.forEach(s => {
      let studentFailed = false
      s.courses.forEach(c => {
        if (c.isVoid || typeof c.score !== 'number' || !Number.isFinite(c.score)) return
        const score = Number(c.score)
        scores.push(score)
        if (score < 60) studentFailed = true
      })
      if (studentFailed) failStudents += 1
    })

    const count = scores.length
    const averageScore = count ? (scores.reduce((acc, v) => acc + v, 0) / count) : 0
    const passCount = scores.filter(v => v >= 60).length
    const excellentCount = scores.filter(v => v >= 85).length

    return {
      majorName: major,
      studentCount: students.length,
      averageScore,
      passRate: count ? (passCount / count) * 100 : 0,
      excellentRate: count ? (excellentCount / count) * 100 : 0,
      failCount: failStudents,
      ranking: 0,
    }
  }).sort((a, b) => b.averageScore - a.averageScore)

  // 排名赋值
  return result.map((item, idx) => ({ ...item, ranking: idx + 1 }))
})

// 成绩分布图（真实数据）
const scoreDistributionOption = computed(() => {
  const bins = { excellent: 0, good: 0, medium: 0, pass: 0, fail: 0 }
  if (hasData.value) {
    rawStudentData.value.forEach(s => {
      s.courses.forEach(c => {
        if (c.isVoid || typeof c.score !== 'number' || !Number.isFinite(c.score)) return
        const v = Number(c.score)
        if (v >= 90) bins.excellent++
        else if (v >= 80) bins.good++
        else if (v >= 70) bins.medium++
        else if (v >= 60) bins.pass++
        else bins.fail++
      })
    })
  }

  return {
    title: { text: '成绩分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', data: ['优秀(90-100)', '良好(80-89)', '中等(70-79)', '及格(60-69)', '不及格(0-59)'] },
    series: [
      {
        name: '成绩分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: bins.excellent, name: '优秀(90-100)' },
          { value: bins.good, name: '良好(80-89)' },
          { value: bins.medium, name: '中等(70-79)' },
          { value: bins.pass, name: '及格(60-69)' },
          { value: bins.fail, name: '不及格(0-59)' },
        ],
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      },
    ],
  }
})

// 专业平均分对比（真实数据）
const majorComparisonOption = computed(() => {
  const majors = majorAnalysis.value.map(m => m.majorName)
  const averages = majorAnalysis.value.map(m => Number.isFinite(m.averageScore) ? Number(m.averageScore.toFixed(2)) : 0)

  return {
    title: { text: '专业平均分对比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: majors, axisLabel: { interval: 0, rotate: 45 } },
    yAxis: { type: 'value', min: 0, max: 100 },
    series: [
      { name: '平均分', type: 'bar', data: averages, itemStyle: { color: '#3b82f6' } },
    ],
  }
})

// 课程难度分析（真实数据）
const courseDifficultyOption = computed(() => {
  const courses = courseAnalysis.value
  // 可选：限制展示数量，避免标签过多
  const top = courses.slice(0, 12)
  const names = top.map(c => c.courseName)
  const averages = top.map(c => Number.isFinite(c.averageScore) ? Number(c.averageScore.toFixed(2)) : 0)
  const passRates = top.map(c => Number.isFinite(c.passRate) ? Number(c.passRate.toFixed(2)) : 0)

  return {
    title: { text: '课程难度分析', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均分', '及格率'] },
    xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 45 } },
    yAxis: [
      { type: 'value', name: '平均分', min: 0, max: 100, position: 'left' },
      { type: 'value', name: '及格率(%)', min: 0, max: 100, position: 'right' },
    ],
    series: [
      { name: '平均分', type: 'bar', data: averages, itemStyle: { color: '#10b981' } },
      { name: '及格率', type: 'line', yAxisIndex: 1, data: passRates, itemStyle: { color: '#f59e0b' } },
    ],
  }
})

// 各分数段分布（真实数据）
const gradeTrendOption = computed(() => {
  const bins = [0, 0, 0, 0, 0] // 0-59, 60-69, 70-79, 80-89, 90-100
  if (hasData.value) {
    rawStudentData.value.forEach(s => {
      s.courses.forEach(c => {
        if (c.isVoid || typeof c.score !== 'number' || !Number.isFinite(c.score)) return
        const v = Number(c.score)
        if (v < 60) bins[0]++
        else if (v < 70) bins[1]++
        else if (v < 80) bins[2]++
        else if (v < 90) bins[3]++
        else bins[4]++
      })
    })
  }

  return {
    title: { text: '各分数段分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['0-59', '60-69', '70-79', '80-89', '90-100'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: bins,
        itemStyle: {
          color: (params: any) => {
            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
            return colors[params.dataIndex]
          },
        },
      },
    ],
  }
})

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
    '较易': 'info',
    '中等': 'warning',
    '较难': 'danger',
    '困难': 'danger',
  }
  return typeMap[difficulty] || 'info'
}

// 获取排名类型
const getRankingType = (ranking: number) => {
  if (ranking === 1) return 'success'
  if (ranking === 2) return 'info'
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

const goToImport = () => {
  router.push('/import')
}

// 跳转到导出页面
const goToExport = () => {
  router.push('/export')
}

// 移除模拟数据生成
// onMounted(() => {})
</script>