<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <StatsCard
            title="内容总数"
            :value="stats.totalContent"
            icon="Document"
            color="#409EFF"
            :loading="loading"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatsCard
            title="媒体资源"
            :value="stats.totalMedia"
            icon="Picture"
            color="#67C23A"
            :loading="loading"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatsCard
            title="用户数量"
            :value="stats.totalUsers"
            icon="User"
            color="#E6A23C"
            :loading="loading"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatsCard
            title="存储用量"
            :value="`${stats.storageUsage}%`"
            icon="DataLine"
            color="#F56C6C"
            :loading="loading"
        />
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="actions-row">
      <el-col :xs="24" :lg="8">
        <el-card class="quick-actions-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">快捷操作</span>
            </div>
          </template>
          <div class="actions-grid">
            <el-button
                type="primary"
                icon="Plus"
                class="action-button"
                @click="$router.push('/content/create')"
            >
              创建内容
            </el-button>
            <el-button
                type="success"
                icon="Collection"
                class="action-button"
                @click="$router.push('/schema')"
            >
              管理内容模型
            </el-button>
            <el-button
                type="warning"
                icon="Picture"
                class="action-button"
                @click="$router.push('/asset')"
            >
              管理媒体
            </el-button>
            <el-button
                type="info"
                icon="User"
                class="action-button"
                @click="$router.push('/user')"
            >
              管理用户
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 最近活动 -->
      <el-col :xs="24" :lg="16">
        <el-card class="recent-activities-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近活动</span>
              <el-button type="text" @click="refreshActivities">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <el-table
              :data="recentActivities"
              :loading="activitiesLoading"
              style="width: 100%"
              empty-text="暂无活动记录"
          >
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getActivityTypeTag(row.type)" size="small">
                  {{ getActivityTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200" />
            <el-table-column prop="user" label="操作人" width="120" />
            <el-table-column prop="time" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.time) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 内容类型统计 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">内容类型分布</span>
            </div>
          </template>
          <div ref="contentChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">内容状态分布</span>
            </div>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import StatsCard from '@/components/StatsCard.vue'
import { formatTime } from '@/utils/date'
import { contentApi } from '@/api/content'
import { assetApi } from '@/api/asset'
import { userApi } from '@/api/user'
import { schemaApi } from '@/api/schema'

const router = useRouter()

const loading = ref(false)
const activitiesLoading = ref(false)

const stats = ref({
  totalContent: 0,
  totalMedia: 0,
  totalUsers: 0,
  storageUsage: 0
})

const recentActivities = ref<any[]>([])

const contentChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()
let contentChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

const getActivityTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    create: 'success',
    update: 'primary',
    delete: 'danger',
    publish: 'warning',
    upload: 'info'
  }
  return typeMap[type] || 'info'
}

const getActivityTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    publish: '发布',
    upload: '上传'
  }
  return typeMap[type] || '其他'
}

// 获取统计数据
const fetchStats = async () => {
  try {
    // 获取内容总数
    const contentRes = await contentApi.getList({ page: 0, size: 1 })
    stats.value.totalContent = contentRes.totalElements || 0

    // 获取媒体资源总数
    const assetRes = await assetApi.getList({ page: 0, size: 1 })
    stats.value.totalMedia = assetRes.totalElements || 0

    // 获取用户总数
    const userRes = await userApi.getPage(0, 1)
    stats.value.totalUsers = userRes.totalElements || 0

    // 存储用量（模拟数据）
    stats.value.storageUsage = Math.floor(Math.random() * 100)
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  }
}

// 获取最近活动（模拟数据）
const fetchRecentActivities = async () => {
  activitiesLoading.value = true
  try {
    // 模拟API调用延时
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟活动数据
    recentActivities.value = [
      { type: 'create', description: '创建了新的博客文章', user: '管理员', time: new Date() },
      { type: 'update', description: '更新了产品页面内容', user: '编辑', time: new Date(Date.now() - 1000 * 60 * 30) },
      { type: 'publish', description: '发布了新闻公告', user: '管理员', time: new Date(Date.now() - 1000 * 60 * 60) },
      { type: 'upload', description: '上传了产品图片', user: '编辑', time: new Date(Date.now() - 1000 * 60 * 120) },
      { type: 'create', description: '创建了新的内容模型', user: '管理员', time: new Date(Date.now() - 1000 * 60 * 180) }
    ]
  } catch (error) {
    ElMessage.error('获取活动记录失败')
  } finally {
    activitiesLoading.value = false
  }
}

const refreshActivities = async () => {
  await fetchRecentActivities()
  ElMessage.success('活动记录已刷新')
}

// 初始化内容类型分布图表
const initContentChart = async () => {
  if (!contentChartRef.value) return

  try {
    // 获取内容模型列表
    const schemaRes = await schemaApi.getList({ page: 0, size: 100 })
    const schemas = schemaRes.content || []

    // 构造图表数据
    const chartData = schemas.slice(0, 5).map((schema: any) => ({
      value: Math.floor(Math.random() * 100) + 10, // 模拟数据
      name: schema.displayName || schema.name
    }))

    // 如果数据不足5条，补充"其他"项
    if (chartData.length < 5) {
      chartData.push({
        value: Math.floor(Math.random() * 50),
        name: '其他'
      })
    }

    contentChart = echarts.init(contentChartRef.value)
    contentChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [
        {
          name: '内容类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    })
  } catch (error) {
    // 忽略图表初始化错误
  }
}

// 初始化内容状态分布图表
const initStatusChart = () => {
  if (!statusChartRef.value) return

  statusChart = echarts.init(statusChartRef.value)
  statusChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '发布内容数',
        type: 'bar',
        barWidth: '60%',
        data: [10, 52, 200, 334, 390, 330, 220],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  })
}

const initCharts = async () => {
  await initContentChart()
  initStatusChart()
}

const disposeCharts = () => {
  contentChart?.dispose()
  statusChart?.dispose()
}

onMounted(() => {
  // 初始化统计数据
  fetchStats()

  // 初始化图表
  initCharts()

  // 加载活动记录
  fetchRecentActivities()

  // 监听窗口大小变化，重新调整图表大小
  window.addEventListener('resize', () => {
    contentChart?.resize()
    statusChart?.resize()
  })
})

onUnmounted(() => {
  disposeCharts()
})
</script>

<style scoped lang="scss">
.dashboard {
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .actions-row {
    margin-bottom: 20px;

    .quick-actions-card {
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;

        .action-button {
          height: 60px;
          font-size: 14px;
        }
      }
    }
  }

  .charts-row {
    .chart-card {
      .chart-container {
        height: 300px;
      }
    }
  }

  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>