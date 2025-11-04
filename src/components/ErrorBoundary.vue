<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">出现了一些问题</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <el-button @click="retry" type="primary">重试</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')

// 捕获子组件错误
onErrorCaptured((error: Error, instance, info) => {
  console.error('ErrorBoundary caught error:', error, info)
  
  hasError.value = true
  errorMessage.value = error.message || '未知错误'
  
  // 发送错误报告（可选）
  ElMessage.error('页面出现错误，请重试')
  
  // 阻止错误继续传播
  return false
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  // 强制重新渲染
  window.location.reload()
}

const goHome = () => {
  hasError.value = false
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>