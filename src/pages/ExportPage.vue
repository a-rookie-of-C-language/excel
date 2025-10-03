<template>
  <div class="px-4 py-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">报告导出</h1>
      <p class="text-gray-600">选择导出格式和内容，生成专业的成绩分析报告</p>
    </div>

    <!-- 导出配置 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">导出配置</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 导出格式选择 -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4">导出格式</h4>
          <div class="space-y-3">
            <label class="flex items-center">
              <input 
                v-model="exportConfig.format" 
                type="radio" 
                value="pdf" 
                class="mr-3 text-blue-600"
              >
              <div class="flex items-center">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium">PDF 报告</div>
                  <div class="text-sm text-gray-500">适合打印和正式文档</div>
                </div>
              </div>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="exportConfig.format" 
                type="radio" 
                value="word" 
                class="mr-3 text-blue-600"
              >
              <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Word 文档</div>
                  <div class="text-sm text-gray-500">便于编辑和修改</div>
                </div>
              </div>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="exportConfig.format" 
                type="radio" 
                value="excel" 
                class="mr-3 text-blue-600"
              >
              <div class="flex items-center">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Excel 表格</div>
                  <div class="text-sm text-gray-500">数据分析和处理</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- 导出内容选择 -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4">导出内容</h4>
          <div class="space-y-3">
            <label class="flex items-center">
              <input 
                v-model="exportConfig.includeOverview" 
                type="checkbox" 
                class="mr-3 text-blue-600"
              >
              <span>总体统计概览</span>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="exportConfig.includeCharts" 
                type="checkbox" 
                class="mr-3 text-blue-600"
              >
              <span>数据可视化图表</span>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="exportConfig.includeCourseAnalysis" 
                type="checkbox" 
                class="mr-3 text-blue-600"
              >
              <span>课程详细分析</span>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="exportConfig.includeMajorAnalysis" 
                type="checkbox" 
                class="mr-3 text-blue-600"
              >
              <span>专业对比分析</span>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="exportConfig.includeStudentList" 
                type="checkbox" 
                class="mr-3 text-blue-600"
              >
              <span>学生成绩明细</span>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="exportConfig.includeRecommendations" 
                type="checkbox" 
                class="mr-3 text-blue-600"
              >
              <span>改进建议</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 报告预览 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">报告预览</h3>
      
      <div class="border border-gray-200 rounded-lg p-6 bg-gray-50 min-h-96">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">重庆理工大学两江人工智能学院</h2>
          <h3 class="text-xl font-semibold text-gray-700 mb-4">成绩分析报告</h3>
          <div class="text-sm text-gray-600">
            <p>学期：2024-2025学年第2学期</p>
            <p>生成时间：{{ new Date().toLocaleString() }}</p>
          </div>
        </div>

        <div v-if="exportConfig.includeOverview" class="mb-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">一、总体统计概览</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">78.5</div>
              <div class="text-sm text-gray-600">平均分</div>
            </div>
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">85.2%</div>
              <div class="text-sm text-gray-600">及格率</div>
            </div>
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-orange-600">22.4%</div>
              <div class="text-sm text-gray-600">优秀率</div>
            </div>
            <div class="bg-white rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-red-600">14.8%</div>
              <div class="text-sm text-gray-600">不及格率</div>
            </div>
          </div>
        </div>

        <div v-if="exportConfig.includeCharts" class="mb-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">二、数据可视化分析</h4>
          <div class="bg-white rounded-lg p-4 text-center text-gray-500">
            <div class="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
            <p>图表将在导出时生成</p>
          </div>
        </div>

        <div v-if="exportConfig.includeCourseAnalysis" class="mb-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">三、课程详细分析</h4>
          <div class="bg-white rounded-lg p-4">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-2">课程名称</th>
                  <th class="text-center py-2">平均分</th>
                  <th class="text-center py-2">及格率</th>
                  <th class="text-center py-2">难度评级</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b">
                  <td class="py-2">高等数学</td>
                  <td class="text-center py-2">75.2</td>
                  <td class="text-center py-2">85.5%</td>
                  <td class="text-center py-2">中等</td>
                </tr>
                <tr class="border-b">
                  <td class="py-2">线性代数</td>
                  <td class="text-center py-2">68.5</td>
                  <td class="text-center py-2">72.3%</td>
                  <td class="text-center py-2">较难</td>
                </tr>
                <tr>
                  <td class="py-2">...</td>
                  <td class="text-center py-2">...</td>
                  <td class="text-center py-2">...</td>
                  <td class="text-center py-2">...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="exportConfig.includeMajorAnalysis" class="mb-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">四、专业对比分析</h4>
          <div class="bg-white rounded-lg p-4 text-center text-gray-500">
            <p>专业对比数据表格</p>
          </div>
        </div>

        <div v-if="exportConfig.includeRecommendations" class="mb-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">五、改进建议</h4>
          <div class="bg-white rounded-lg p-4">
            <ul class="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>针对线性代数课程，建议加强基础概念讲解</li>
              <li>数据科学专业整体表现优秀，可作为标杆</li>
              <li>建议对不及格学生进行个别辅导</li>
              <li>可考虑调整部分课程的教学方法</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出进度 -->
    <div v-if="isExporting" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">导出进度</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <div class="flex-1">
            <div class="flex justify-between text-sm mb-1">
              <span>{{ exportProgress.currentStep }}</span>
              <span>{{ exportProgress.percentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: exportProgress.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div class="text-sm text-gray-600">
          预计剩余时间：{{ exportProgress.remainingTime }}
        </div>
      </div>
    </div>

    <!-- 导出历史 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">导出历史</h3>
      <div class="space-y-3">
        <div v-for="record in exportHistory" :key="record.id" 
             class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
              </svg>
            </div>
            <div>
              <div class="font-medium">{{ record.name }}</div>
              <div class="text-sm text-gray-500">{{ record.date }} · {{ record.format.toUpperCase() }}</div>
            </div>
          </div>
          <div class="flex space-x-2">
            <el-button size="small" @click="downloadFile(record)">
              下载
            </el-button>
            <el-button size="small" type="danger" @click="deleteRecord(record.id)">
              删除
            </el-button>
          </div>
        </div>
        
        <div v-if="exportHistory.length === 0" class="text-center py-8 text-gray-500">
          暂无导出记录
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-between">
      <el-button @click="goBack">
        返回分析
      </el-button>
      <div class="space-x-4">
        <el-button @click="previewReport">
          预览报告
        </el-button>
        <el-button 
          type="primary" 
          :loading="isExporting"
          :disabled="!isConfigValid"
          @click="startExport"
        >
          {{ isExporting ? '导出中...' : '开始导出' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 导出配置
const exportConfig = ref({
  format: 'pdf',
  includeOverview: true,
  includeCharts: true,
  includeCourseAnalysis: true,
  includeMajorAnalysis: true,
  includeStudentList: false,
  includeRecommendations: true
})

// 导出状态
const isExporting = ref(false)
const exportProgress = ref({
  currentStep: '',
  percentage: 0,
  remainingTime: ''
})

// 导出历史
const exportHistory = ref([
  {
    id: 1,
    name: '2024-2025学年第2学期成绩分析报告',
    date: '2024-12-20 14:30',
    format: 'pdf',
    size: '2.5MB'
  },
  {
    id: 2,
    name: '课程难度分析报告',
    date: '2024-12-19 16:45',
    format: 'word',
    size: '1.8MB'
  }
])

// 配置验证
const isConfigValid = computed(() => {
  return exportConfig.value.format && (
    exportConfig.value.includeOverview ||
    exportConfig.value.includeCharts ||
    exportConfig.value.includeCourseAnalysis ||
    exportConfig.value.includeMajorAnalysis ||
    exportConfig.value.includeStudentList ||
    exportConfig.value.includeRecommendations
  )
})

// 开始导出
const startExport = async () => {
  if (!isConfigValid.value) {
    ElMessage.warning('请选择导出格式和内容')
    return
  }

  isExporting.value = true
  
  const steps = [
    '准备数据...',
    '生成图表...',
    '渲染报告...',
    '生成文件...',
    '完成导出'
  ]

  try {
    for (let i = 0; i < steps.length; i++) {
      exportProgress.value.currentStep = steps[i]
      exportProgress.value.percentage = ((i + 1) / steps.length) * 100
      exportProgress.value.remainingTime = `${steps.length - i - 1}秒`
      
      // 模拟导出过程
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 添加到导出历史
    const newRecord = {
      id: Date.now(),
      name: `成绩分析报告_${new Date().toLocaleDateString()}`,
      date: new Date().toLocaleString(),
      format: exportConfig.value.format,
      size: '2.1MB'
    }
    exportHistory.value.unshift(newRecord)

    ElMessage.success('报告导出成功！')
    
    // 模拟文件下载
    downloadFile(newRecord)
    
  } catch (error) {
    ElMessage.error('导出失败，请重试')
  } finally {
    isExporting.value = false
    exportProgress.value = {
      currentStep: '',
      percentage: 0,
      remainingTime: ''
    }
  }
}

// 预览报告
const previewReport = () => {
  ElMessage.info('报告预览功能开发中...')
}

// 下载文件
const downloadFile = (record: any) => {
  // 模拟文件下载
  const link = document.createElement('a')
  link.href = '#'
  link.download = `${record.name}.${record.format}`
  link.click()
  
  ElMessage.success(`开始下载 ${record.name}`)
}

// 删除记录
const deleteRecord = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个导出记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    exportHistory.value = exportHistory.value.filter(record => record.id !== id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 返回分析页面
const goBack = () => {
  router.push('/report')
}

onMounted(() => {
  // 初始化页面
})
</script>