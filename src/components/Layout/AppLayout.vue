<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- 左侧标题 -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-semibold text-gray-900">
                重庆理工大学两江人工智能学院成绩分析系统
              </h1>
            </div>
          </div>
          
          <!-- 右侧导航 -->
          <nav class="hidden md:flex space-x-8">
            <router-link
              v-for="item in navItems"
              :key="item.name"
              :to="item.path"
              class="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === item.path }"
            >
              <component :is="item.icon" class="w-4 h-4 inline-block mr-1" />
              {{ item.label }}
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Home, Users, Eye, BarChart3, Download } from 'lucide-vue-next'

const navItems = [
  { name: 'home', path: '/', label: '首页', icon: Home },
  { name: 'students', path: '/students', label: '学生信息', icon: Users },
  { name: 'preview', path: '/preview', label: '数据预览', icon: Eye },
  { name: 'report', path: '/report', label: '成绩分析', icon: BarChart3 },
  { name: 'export', path: '/export', label: '报告导出', icon: Download },
]
</script>