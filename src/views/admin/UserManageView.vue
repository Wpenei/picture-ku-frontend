<template>
  <div id="adminManageView">
    <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>

    <a-table
      :columns="columns"
      :data-source="dataList"
      bordered
      @change="doTableChange"
      :pagination="pagination"
    >
      <template #bodyCell="{ column, text, record }">
        <template
          v-if="['id', 'userAccount', 'userName', 'userProfile'].includes(column.dataIndex)"
        >
          {{ text }}
        </template>
        <!-- 用户头像-->
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="120" />
        </template>
        <!-- 用户角色-->
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else-if="record.userRole === 'user'">
            <a-tag color="blue">普通用户</a-tag>
          </div>
          <div v-else-if="record.userRole === 'vip'">
            <a-tag color="yellow">VIP</a-tag>
          </div>
        </template>
        <!-- 创建日期-->
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.dataIndex === 'operation'">
          <a-space wrap>
            <a-button type="primary"  @click="handleEdit(record.id)"
            >编辑
            </a-button>
            <a-button danger @click="showDeleteConfirm(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    <!-- 在template的a-table下方添加 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑用户信息"
      width="600px"
      :confirm-loading="editLoading"
      ok-text="确认"
      cancel-text="取消"
      @ok="handleEditSubmit"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="用户账号">
          <a-input v-model:value="editForm.userAccount" />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-model:value="editForm.userName" />
        </a-form-item>
        <a-form-item label="用户角色">
          <a-select v-model:value="editForm.userRole">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="vip">VIP用户</a-select-option>
          </a-select>
        </a-form-item>
        <!-- 替换原有的a-upload组件 -->
        <a-form-item label="用户头像">
          <a-input v-model:value="editForm.userAvatar" placeholder="请输入图片地址" />
          <div style="margin-top: 8px">
            <span v-if="editForm.userAvatar" style="color: #888; font-size: 12px"
              >当前头像预览：</span
            >
            <a-image
              v-if="editForm.userAvatar"
              :src="editForm.userAvatar"
              :width="120"
              :preview="false"
              style="margin-top: 4px"
            />
          </div>
        </a-form-item>
        <a-form-item label="用户简介">
          <a-textarea v-model:value="editForm.userProfile" :rows="4" />
        </a-form-item>

      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { computed, createVNode, onMounted, reactive, ref } from 'vue'
import type { UnwrapRef } from 'vue'
import {
  updateUserUsingPost,
  deleteUserUsingDelete,
  getUserListUsingPost,
  getUserVoByIdUsingGet,
} from '@/api/userController.ts'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import UserEdit from '@/components/UserEdit.vue'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
]
// 数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)
// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend',
})
// 查询后端数据
const fetchData = async () => {
  const res = await getUserListUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}
// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})
// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}
// 点击搜索后,重新获取数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}
// 删除功能
const doDelete = async (id: number) => {
  if (!id) {
    return
  }
  const res = await deleteUserUsingDelete({
    id,
  })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}
// 删除确认框
const showDeleteConfirm = (id: number) => {
  Modal.confirm({
    title: '你确定删除当前用户吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '若想恢复需联系管理员',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    maskClosable: true,
    keyboard: true,
    width: 520,
    onOk() {
      doDelete(id)
    },
    onCancel() {
      console.log('Cancel delete')
    },
  })
}

// 新增响应式数据
const editModalVisible = ref(false)
const editLoading = ref(false)
const editForm = reactive({
  id: undefined,
  userAccount: '',
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: '',
})

// 点击编辑按钮
const handleEdit = async (id: number) => {
  try {
    const res = await getUserVoByIdUsingGet({ id })
    if (res.data.data) {
      Object.assign(editForm, res.data.data)
      editModalVisible.value = true
    }
  } catch (error) {
    message.error('获取用户信息失败')
  }
}

// 提交修改
const handleEditSubmit = async () => {
  editLoading.value = true
  try {
    const res = await updateUserUsingPost(editForm)
    if (res.data.code === 0) {
      message.success('更新成功')
      editModalVisible.value = false
      fetchData() // 刷新表格
    }
  } finally {
    editLoading.value = false
  }
}

// 页面首次加载时获取用户列表
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#adminManageView {
}

.search {
  margin-bottom: 12px;
}

.editable-row-operations a {
  margin-right: 8px;
}
</style>
