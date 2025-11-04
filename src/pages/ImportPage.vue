<template>
  <div class="px-4 py-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">文件导入</h1>
      <p class="text-gray-600">上传Excel文件进行成绩数据分析</p>
    </div>

    <!-- 文件上传区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div 
        class="border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer"
        :class="isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          @change="handleFileSelect"
          class="hidden"
        />
        
        <Upload class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        
        <div v-if="!selectedFile">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">选择或拖拽文件到此处</h3>
          <p class="text-gray-600 mb-2">支持 .xlsx、.xls、.csv 格式</p>
          <p class="text-sm text-gray-500 mb-6">文件大小不超过 10MB</p>
          <el-button type="primary" size="large">
            <Upload class="w-4 h-4 mr-2" />
            选择文件
          </el-button>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-center space-x-3">
            <FileText class="w-8 h-8 text-green-600" />
            <div class="text-left">
              <p class="font-semibold text-gray-900">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <el-button type="primary" @click="handleUpload" :loading="uploading">
              <Upload class="w-4 h-4 mr-2" />
              {{ uploading ? '解析中...' : '开始解析' }}
            </el-button>
            <el-button @click="clearFile">
              <X class="w-4 h-4 mr-2" />
              重新选择
            </el-button>
          </div>
        </div>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploading" class="mt-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">解析进度</span>
          <span class="text-sm text-gray-600">{{ uploadProgress }}%</span>
        </div>
        <el-progress :percentage="uploadProgress" :show-text="false" />
      </div>

      <!-- 解析结果 -->
      <div v-if="parseResult && !uploading" class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center mb-3">
          <Info class="w-5 h-5 text-green-600 mr-2" />
          <h3 class="text-lg font-semibold text-green-900">解析结果</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div class="text-center">
            <span class="block text-sm text-gray-600">总记录数</span>
            <span class="block text-xl font-bold text-gray-900">{{ parseResult.totalRecords }}</span>
          </div>
          <div class="text-center">
            <span class="block text-sm text-gray-600">有效记录</span>
            <span class="block text-xl font-bold text-green-600">{{ parseResult.validRecords }}</span>
          </div>
          <div class="text-center" v-if="parseResult.invalidRecords > 0">
            <span class="block text-sm text-gray-600">无效记录</span>
            <span class="block text-xl font-bold text-red-600">{{ parseResult.invalidRecords }}</span>
          </div>
        </div>
        <div v-if="parseResult.warnings.length > 0" class="border-t border-green-200 pt-3">
          <h4 class="font-semibold text-green-900 mb-2">警告信息：</h4>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="warning in parseResult.warnings" :key="warning" class="text-sm text-green-800">{{ warning }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 文件要求说明 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-blue-900 mb-3 flex items-center">
        <Info class="w-5 h-5 mr-2" />
        文件格式要求
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
        <div>
          <h4 class="font-semibold mb-2">支持的文件格式：</h4>
          <ul class="space-y-1">
            <li>• Excel文件 (.xlsx, .xls)</li>
            <li>• CSV文件 (.csv)</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-2">文件要求：</h4>
          <ul class="space-y-1">
            <li>• 文件大小不超过 10MB</li>
            <li>• 包含学生成绩数据</li>
            <li>• 第一行为表头</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Upload, FileText, X, Info } from 'lucide-vue-next'
import { validateFile, formatFileSize } from '@/utils/fileUpload'
import { excelParser } from '@/utils/excelParser'
import { useDataStore } from '@/stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const parseResult = ref<{
  totalRecords: number
  validRecords: number
  invalidRecords: number
  warnings: string[]
} | null>(null)

// 触发文件选择
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

// 处理拖拽相关事件
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    validateAndSetFile(files[0])
  }
}

// 验证并设置文件
const validateAndSetFile = (file: File) => {
  // 使用工具函数验证文件
  const validation = validateFile(file)
  
  if (!validation.isValid) {
    ElMessage.error(validation.error || '文件验证失败')
    return
  }

  selectedFile.value = file
  ElMessage.success('文件选择成功')
}

// 清除文件
const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 处理文件上传
const handleUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请先选择文件')
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  parseResult.value = null

  try {
    // 设置文件信息
    dataStore.setFileInfo(selectedFile.value.name, selectedFile.value.size)
    dataStore.setLoading(true)
    
    // 模拟解析进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 30) {
        uploadProgress.value += 5
      }
    }, 100)

    // 解析Excel文件
    uploadProgress.value = 30
    const rawData = await excelParser.parseFile(selectedFile.value)
    
    uploadProgress.value = 50
    
    // 验证数据
    const validationResult = excelParser.validate35Fields(rawData)
    dataStore.setValidationResult(validationResult)
    
    uploadProgress.value = 70
    
    // 处理数据
    const processedData = excelParser.normalizeGrades(rawData)
    const basicInfo = excelParser.extractBasicInfo(rawData)
    const gradeSystemInfo = excelParser.detectGradeSystem(rawData)
    
    uploadProgress.value = 90
    
    // 存储数据
    dataStore.setRawData(rawData)
    dataStore.setProcessedData(processedData)
    dataStore.setBasicInfo(basicInfo)
    dataStore.setGradeSystemInfo(gradeSystemInfo)
    dataStore.setDataLoaded(true)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // 设置解析结果
    parseResult.value = {
      totalRecords: rawData.length,
      validRecords: rawData.length - validationResult.invalidRecords.length,
      invalidRecords: validationResult.invalidRecords.length,
      warnings: validationResult.warnings
    }
    
    ElMessage.success(`文件解析成功！共解析 ${rawData.length} 条记录，${processedData.length} 名学生`)
    
    // 跳转到预览页面
    setTimeout(() => {
      router.push('/preview')
    }, 1500)
    
  } catch (error) {
    ElMessage.error(`文件解析失败：${error instanceof Error ? error.message : '未知错误'}`)
    console.error('Excel parse error:', error)
  } finally {
    uploading.value = false
    dataStore.setLoading(false)
  }
}
</script>