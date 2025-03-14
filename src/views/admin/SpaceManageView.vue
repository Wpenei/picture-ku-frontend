<template>
  <div id="spaceManagePage">
    <div class="title" style="margin-bottom: 16px">
      <a-flex justify="space-between">
        <h2>空间管理</h2>
        <a-space wrap>
          <a-button type="primary" href="/addSpace">
            <template #icon>
              <PlusOutlined />
            </template>
            创建空间
          </a-button>

          <a-button type="primary" ghost href="/space_analyze?queryPublic=1" target="_blank">
            分析公共图库
          </a-button>
          <a-button type="primary" ghost href="/space_analyze?queryAll=1" target="_blank" >
            分析全空间
          </a-button>
        </a-space>
      </a-flex>
    </div>
    <div class="search" style="margin-bottom: 16px">
      <!-- 搜索表单 -->
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="空间名称">
          <a-input
            v-model:value="searchParams.spaceName"
            placeholder="请输入空间名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="空间级别">
          <a-select
            v-model:value="searchParams.spaceLevel"
            placeholder="请选择空间级别"
            style="min-width: 180px"
            allow-clear
            :options="SPACE_LEVEL_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="用户id">
          <a-input v-model:value="searchParams.userId" placeholder="请输入用户id" allow-clear />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-form-item>
      </a-form>
    </div>
    <!-- 表格 totalSize-->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <!-- 空间级别-->
        <template v-if="column.dataIndex === 'spaceLevel'">
          <div v-if="record.spaceLevel === SPACE_LEVEL_ENUM.COMMON">
            <a-tag :bordered="false">{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
          </div>
          <div v-else-if="record.spaceLevel === SPACE_LEVEL_ENUM.PROFESSIONAL">
            <a-tag color="green">{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
          </div>
          <div v-else>
            <a-tag color="red">
              <template #icon>
                <check-circle-outlined />
              </template>
              {{ SPACE_LEVEL_MAP[record.spaceLevel] }}
            </a-tag>
          </div>
        </template>
        <template v-if="column.dataIndex === 'spaceUseInfo'">
          <div>大小: {{ formatSize(record.totalSize) }} /{{ formatSize(record.maxSize) }}</div>
          <div>数量: {{ record.totalCount }} / {{ record.maxCount }}</div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button type="link" :href="`/space_analyze?spaceId=${record.id}`" target="_blank"> 分析 </a-button>
            <a-button :href="`/addSpace?id=${record.id}`"> 编辑</a-button>
            <a-button danger @click="showDeleteConfirm(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { computed, createVNode, onMounted, reactive, ref } from 'vue'
import { deleteSpaceUsingDelete, listSpaceByPageUsingPost } from '@/api/spaceController.ts'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { formatSize } from '../../utils'
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '../../constants/space.ts'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
  },
  {
    title: '用户id',
    dataIndex: 'userId',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]
// 定义数据
const dataList = ref<[]>([])
const total = ref(0)
// 搜索条件
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})
// 获取数据
const fetchData = async () => {
  const res = await listSpaceByPageUsingPost({
    ...searchParams,
  })
  if (res.data.code === 0 && res.data.data) {
    console.log(res.data.data)
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}
// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})
// 表格变化之后，重新获取数据
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}
// 搜索数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}
// 删除数据
const doDelete = async (id: number) => {
  if (!id) {
    return
  }
  const res = await deleteSpaceUsingDelete({
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
    title: '你确定删除当前空间吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除后无法恢复!',
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
</script>

<style scoped>
.space-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.space-upload img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-space-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-space-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
