<template>
  <div class="px-4 py-6">
    <!-- 系统介绍区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div class="flex items-start space-x-6">
        <!-- 左侧图标和标题 -->
        <div class="flex-shrink-0">
          <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 class="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <!-- 右侧内容 -->
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            高等院校成绩分析系统
          </h2>
          <p class="text-lg text-gray-600 mb-4">
            智能Excel文件开放分析
          </p>
          <p class="text-gray-500 leading-relaxed">
            专为重庆理工大学两江人工智能学院设计的成绩数据分析平台，支持Excel文件智能解析，
            自动生成专业的期末考试成绩分析报告，提供多维度统计分析和数据可视化功能。
          </p>
        </div>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Upload class="w-5 h-5 mr-2" />
        文件导入
      </h3>
      
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
           @click="handleUploadClick">
        <Upload class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-lg text-gray-600 mb-2">
          支持 xlsx、xls、csv格式文件
        </p>
        <p class="text-sm text-gray-500 mb-4">
          文件大小不超过 10MB，支持拖拽上传、点击上传、粘贴上传
        </p>
        <el-button type="primary" size="large">
          选择Excel文件
        </el-button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart3, Upload, Eye, FileText, HelpCircle, Activity, Database, TrendingUp, Download } from 'lucide-vue-next'

const router = useRouter()


// 处理上传点击
const handleUploadClick = () => {
  router.push('/import')
}

// 处理快速操作
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'preview':
      router.push('/preview')
      break
    case 'analysis':
    case 'report':
      router.push('/report')
      break
    case 'help':
      // 显示帮助信息
      break
  }
}
</script>
