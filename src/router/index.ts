import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import StudentInfoPage from '@/pages/StudentInfoPage.vue'
import PreviewPage from '@/pages/PreviewPage.vue'
import ReportPage from '@/pages/ReportPage.vue'
import ExportPage from '@/pages/ExportPage.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/students',
    name: 'students',
    component: StudentInfoPage,
  },
  {
    path: '/preview',
    name: 'preview',
    component: PreviewPage,
  },
  {
    path: '/report',
    name: 'report',
    component: ReportPage,
  },
  {
    path: '/export',
    name: 'export',
    component: ExportPage,
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
