<template>
  <div id="user-edit">
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

import { reactive, ref } from 'vue'
import { getUserVoByIdUsingGet, updateUserUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { editPictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController.ts'

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
    const res = await getPictureVoByIdUsingGet({ id })
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
    const res = await editPictureUsingPost(editForm)
    if (res.data.code === 0) {
      message.success('更新成功')
      editModalVisible.value = false
      fetchData() // 刷新表格
    }
  } finally {
    editLoading.value = false
  }
}
const loading = ref(false)
// 当前用户信息
const currentUser = ref<API.UserVO>(
  {
    id: undefined,
    userAccount: '',
    userAvatar: '',
    userName: '',
    userProfile: '',
    userRole: '',
    createTime: '',
  }
)
const rules = reactive({
  userAccount: [{ required: true, message: '账号不能为空' }],
  userName: [{ required: true, message: '用户名不能为空' }],
  userRole: [{ required: true, message: '请选择用户角色' }],
})

// 修改后的获取用户逻辑
const showUpdateConfirm = async (id: number) => {
  if (!id) return
  const res = await getUserVoByIdUsingGet({ id })
  if (res.data.code === 0 && res.data.data) {
    // 正确解构后端返回的用户数据
    currentUser.value = res.data.data ?? {} // 展开实际用户数据
  } else {
    message.error('获取用户信息失败：' + (res.data.message || '未知错误'))
  }
}

</script>
