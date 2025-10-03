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

    <!-- 快速操作区域 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="item in quickActions"
          :key="item.name"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="handleQuickAction(item.action)"
        >
          <div class="flex items-center justify-center w-12 h-12 rounded-lg mb-4"
               :class="item.bgColor">
            <component :is="item.icon" class="w-6 h-6" :class="item.iconColor" />
          </div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ item.title }}</h4>
          <p class="text-sm text-gray-600">{{ item.description }}</p>
        </div>
      </div>
    </div>

    <!-- 系统状态区域 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Activity class="w-5 h-5 mr-2" />
        系统状态
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600 mb-1">{{ systemStats.totalAnalysis }}</div>
          <div class="text-sm text-gray-600">总分析次数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600 mb-1">{{ systemStats.successRate }}%</div>
          <div class="text-sm text-gray-600">解析成功率</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600 mb-1">{{ systemStats.lastUpdate }}</div>
          <div class="text-sm text-gray-600">最近更新</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart3, Upload, Eye, FileText, HelpCircle, Activity, Database, TrendingUp, Download } from 'lucide-vue-next'

const router = useRouter()

// 快速操作配置
const quickActions = [
  {
    name: 'preview',
    title: '数据预览',
    description: '查看和验证已上传的成绩数据，确保数据完整性',
    icon: Database,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    action: 'preview'
  },
  {
    name: 'analysis',
    title: '成绩分析',
    description: '多维度统计分析，生成专业成绩报告',
    icon: TrendingUp,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    action: 'analysis'
  },
  {
    name: 'report',
    title: '报告生成',
    description: '生成标准格式的学院成绩分析报告',
    icon: FileText,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    action: 'report'
  },
  {
    name: 'help',
    title: '使用帮助',
    description: '查看系统使用指南和常见问题解答',
    icon: HelpCircle,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    action: 'help'
  }
]

// 系统统计数据
const systemStats = ref({
  totalAnalysis: 0,
  successRate: 100,
  lastUpdate: '今天'
})

// 处理上传点击
const handleUploadClick = () => {
  router.push('/upload')
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
