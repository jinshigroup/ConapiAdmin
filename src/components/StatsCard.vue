<!-- src/components/dashboard/StatsCard.vue -->
<template>
  <el-card class="stats-card" :class="`stats-card--${color}`">
    <div class="stats-content">
      <div class="stats-icon">
        <el-icon>
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="stats-info">
        <div class="stats-title">{{ title }}</div>
        <div class="stats-value" v-loading="loading">
          {{ value }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: string
  color: string
  loading?: boolean
}>()
</script>

<style scoped lang="scss">
.stats-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  }

  .stats-content {
    display: flex;
    align-items: center;
    padding: 20px;

    .stats-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 24px;
      color: #fff;
    }

    .stats-info {
      flex: 1;

      .stats-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stats-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        line-height: 1;
      }
    }
  }

  // 颜色变体 - 修复后的版本
  &.stats-card--primary {
    .stats-icon {
      background: #409EFF;
    }
  }

  &.stats-card--success {
    .stats-icon {
      background: #67C23A;
    }
  }

  &.stats-card--warning {
    .stats-icon {
      background: #E6A23C;
    }
  }

  &.stats-card--danger {
    .stats-icon {
      background: #F56C6C;
    }
  }

  &.stats-card--info {
    .stats-icon {
      background: #909399;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .stats-card {
    .stats-content {
      padding: 16px;

      .stats-icon {
        width: 50px;
        height: 50px;
        font-size: 20px;
      }

      .stats-value {
        font-size: 20px;
      }
    }
  }
}
</style>