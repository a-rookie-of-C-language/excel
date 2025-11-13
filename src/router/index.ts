import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import ImportPage from '@/pages/ImportPage.vue'
import StudentInfoPage from '@/pages/StudentInfoPage.vue'
import AnalysisPage from '@/pages/AnalysisPage.vue'
import PreviewPage from '@/pages/PreviewPage.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/import',
    name: 'import',
    component: ImportPage,
  },
  {
    path: '/students',
    name: 'students',
    component: StudentInfoPage,
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: AnalysisPage,
  },
  {
    path: '/preview',
    name: 'preview',
    component: PreviewPage,
  },
]

const isElectron = navigator.userAgent.toLowerCase().includes('electron') || window.location.protocol === 'file:'
const router = createRouter({
  history: isElectron ? createWebHashHistory() : createWebHistory(),
  routes,
})

export default router
