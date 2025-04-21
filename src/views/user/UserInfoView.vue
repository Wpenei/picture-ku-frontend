<template>
  <div id="user-info">
    <a-row style=" height: 280px">
      <!-- 个人信息  -->
      <a-col :xs="6" :sm="6" :md="8" :lg="8" :xl="8">
        <a-card title="个人信息" style="height: 280px">
          <template #extra>
            <a-button type="text" @click="openModal">
              <EditOutlined />
            </a-button>
          </template>
          <div style="text-align: center; margin-bottom: 16px">
            <a-avatar :src="loginUser?.userAvatar" :size="96">
              <template #icon>
                <AntDesignOutlined />
              </template>
            </a-avatar>
          </div>
          <h2 style="text-align: center">{{ loginUser?.userName }}</h2>
          <div style="text-align: center">
            <a-typography-text
              :content="loginUser?.id"
              class="copyable-id"
              :copyable="{
                text: loginUser?.id,
                tooltip: false,
                onCopy: () => message.success('ID复制成功'),
              }"
            >
              ID: {{ loginUser?.id }}
            </a-typography-text>
          </div>
        </a-card>
      </a-col>
      <!-- 个人空间信息  -->
      <a-col :xs="18" :sm="18" :md="16" :lg="16" :xl="16">
        <a-card title="空间信息概览" style="height: 280px; margin-left: 16px">
          <a-space direction="vertical" style="width: 100%">
            <!-- 空间名称与级别 -->
            <a-row :gutter="16">
              <a-col :span="12">
                <a-typography-paragraph>
                  <a-typography-text strong>空间名称：</a-typography-text>
                  {{ space.spaceName || ' ' }}
                </a-typography-paragraph>
              </a-col>
              <a-col :span="12">
                <a-typography-text strong>空间级别：</a-typography-text>
                <a-tag
                  :color="
                    space.spaceLevel === SPACE_LEVEL_ENUM.COMMON
                      ? 'default'
                      : space.spaceLevel === SPACE_LEVEL_ENUM.PROFESSIONAL
                        ? 'green'
                        : 'red'
                  "
                >
                  {{SPACE_LEVEL_MAP[space.spaceLevel]}}
                </a-tag>
              </a-col>
            </a-row>
            <!-- 存储量展示 -->
            <a-row :gutter="16" style="margin-top: 16px">
              <a-col :span="12">
                <a-statistic
                  title="已使用"
                  :value="formatSize(space.totalSize)"
                  :value-style="{ fontSize: '18px' }"
                >
                  <template #suffix>
                    <span style="font-size: 14px; margin-left: 4px"
                      >/ {{ formatSize(space.maxSize) }}</span
                    >
                  </template>
                </a-statistic>
              </a-col>
              <a-col :span="12">
                <a-statistic
                  title="剩余空间"
                  :value="formatSize(space.maxSize - space.totalSize)"
                  :value-style="{ fontSize: '18px' }"
                />
              </a-col>
            </a-row>
            <!-- 进度条 -->
            <a-progress
              :stroke-color="
                percent >= 90
                  ? { '0%': '#ff4d4f', '100%': '#cf1322' }
                  : percent >= 75
                    ? { '0%': '#ffd666', '100%': '#faad14' }
                    : { '0%': '#2a7fff', '100%': '#0052cc' }
              "
              :percent="percent"
              :stroke-width="10"
              stroke-linecap="round"
              status="active"
            >
              <template #format="percent">
                <span :style="{ color: percent > 75 ? '#ff4d4f' : '#1890ff' }">
                  {{ percent }}%
                </span>
              </template>
            </a-progress>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近上传模块 -->
    <a-row style="margin-top: 16px">
      <a-col :span="24">
        <a-card title="最近编辑">
          <template #extra>
            <!-- 添加时间选择器 -->
            <div style="margin-top: 12px">
              <a-radio-group
                v-model:value="timeRange"
                button-style="solid"
                @change="handleTimeRangeChange()"
              >
                <a-radio-button value="today">今天</a-radio-button>
                <a-radio-button value="yesterday">昨天</a-radio-button>
                <a-radio-button value="week">最近7天</a-radio-button>
              </a-radio-group>
            </div>
          </template>
          <a-list
            :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }"
            :data-source="recentUploads"
            :loading="loading"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-card hoverable>
                  <template #cover>
                    <img
                      :alt="item.name"
                      :src="item.thumbnailUrl ?? item.url"
                      style="height: 200px; object-fit: cover"
                    />
                  </template>
                  <a-card-meta :title="item.name">
                    <template #description>
                      <div>编辑时间：{{ formatDate(item.editTime) }}</div>
                      <div>大小：{{ formatSize(item.picSize) }}</div>
                    </template>
                  </a-card-meta>
                </a-card>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- 弹出的编辑信息模态框 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="修改资料"
      width="600px"
      :confirm-loading="editLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleEditSubmit"
      @cancel="closeModal"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="头像">
          <a-input v-model:value="editForm.userAvatar" placeholder="请输入图片地址" />
          <a-avatar :src="loginUser?.userAvatar" :size="96">
            <template #icon>
              <AntDesignOutlined />
            </template>
          </a-avatar>
        </a-form-item>
        <a-form-item label="昵称" required>
          <a-input v-model:value="editForm.userName" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item label="个人简介">
          <a-textarea
            v-model:value="editForm.userProfile"
            :rows="4"
            placeholder="请输入你的个人简介"
          />
        </a-form-item>
        <a-form-item label="角色">
          <a-tag
            :color="editForm.userRole === 'admin' ? 'green' : 'gray'"
            class="role-tag"
            :bordered="false"
          >
            {{ editForm.userRole === 'admin' ? '管理员' : '普通用户' }}
          </a-tag>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { updateUserUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { AntDesignOutlined, EditOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import {  getSpaceByUserIdUsingPost, getSpaceVoByIdUsingGet } from '@/api/spaceController'
import { formatSize } from '@/utils'
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_MAP, SPACE_ROLE_MAP, SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { useRouter } from 'vue-router' // 请确认实际接口路径
import { listPictureVoByPageUsingPost } from '@/api/pictureController'
import dayjs from 'dayjs'

const loginUserStore = useLoginUserStore()
const loginUser =  loginUserStore.loginUser

const router = useRouter()

// 获取空间详情
const space = ref<API.SpaceVO>({})
// 计算百分比（添加NaN保护）
const percent = computed(() => {
  if (!space.value.maxSize) return 0
  return Number(((space.value.totalSize / space.value.maxSize) * 100).toFixed(2))
})
// 根据用户id获取空间详情
const getSpaceByUserId = async () => {
  try {
    const res = await getSpaceByUserIdUsingPost({
      userId: loginUser.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }else if(res.data.data === null){
      message.warning('您还未创建空间')
    }
    else {
      message.error('获取空间信息失败：' + res.data.message)
    }
  } catch (error) {
    message.error('获取空间信息失败')
  }
}

// 最近上传列表
const recentUploads = ref<API.PictureVO[]>([])
const loading = ref(false)

// 时间范围选择
const timeRange = ref('today')

// 获取时间范围
const getTimeRange = () => {
  const now = dayjs()
  switch (timeRange.value) {
    case 'today':
      return {
        startEditTime: now.startOf('day'),
        endEditTime: now.endOf('day'),
      }
    case 'yesterday':
      return {
        startEditTime: now.subtract(1, 'day').startOf('day'),
        endEditTime: now.subtract(1, 'day').endOf('day'),
      }
    case 'week':
      return {
        startEditTime: now.subtract(7, 'day').startOf('day'),
        endEditTime: now.endOf('day'),
      }
    default:
      return {
        startEditTime: now.startOf('day'),
        endEditTime: now.endOf('day'),
      }
  }
}

// 处理时间范围变化
const handleTimeRangeChange = () => {
  getRecentUploads()
}

// 获取最近上传的图片
const getRecentUploads = async () => {
  loading.value = true
  try {
    const timeRange = getTimeRange()
    const spaceId = space.value.id
    const res = await listPictureVoByPageUsingPost({
      userId: loginUser.value?.id,
      spaceId: spaceId,
      current: 1,
      pageSize: 20,
      sortField: 'createTime',
      sortOrder: 'descend',
      startEditTime: timeRange.startEditTime,
      endEditTime: timeRange.endEditTime,
    })
    if (res.data.code === 0 && res.data.data) {
      recentUploads.value = res.data.data.records || []
    }
  } catch (error) {
    message.error('获取最近上传列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(async () => {
  await getSpaceByUserId()
  if (space.value.id) {
    getRecentUploads()
  }
})

// 文件类型统计
const fileTypes = ref([
  { name: '图片', count: 243, color: 'blue' },
  { name: '视频', count: 32, color: 'red' },
  { name: '文档', count: 15, color: 'green' },
])

// 编辑模态框相关状态
const editModalVisible = ref(false)
const editLoading = ref(false)
const editForm = reactive({
  id: undefined,
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: '',
})

// 打开编辑模态框
const openModal = () => {
  editModalVisible.value = true
  // 初始化表单数据为当前登录用户的信息
  Object.assign(editForm, loginUser.value)
}

// 关闭编辑模态框
const closeModal = () => {
  editModalVisible.value = false
}

// 提交修改
const handleEditSubmit = async () => {
  editLoading.value = true
  try {
    const res = await updateUserUsingPost(editForm)
    if (res.data.code === 0) {
      message.success('更新成功')
      editModalVisible.value = false
      loginUserStore.fetchLoginUser() // 更新全局状态中的用户信息
    }
  } finally {
    editLoading.value = false
  }
}
</script>
<style scoped>
#user-info {
  max-width: 450px;
  margin: 0 auto;
}

.recent-upload {
  position: relative;
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }
}

.upload-time {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-align: center;
}

.ant-radio-group {
  width: 100%;
  margin-bottom: 12px;

  .ant-radio-button-wrapper {
    flex: 1;
    text-align: center;
  }
}
</style>
