<template>
  <div id="team">
    <h2>我的团队</h2>
    <a-card title="我创建的团队空间" class="card">
      <template #extra>
        <a-button type="primary" @click="doCreateTeam">
          <PlusOutlined />
          创建团队空间
        </a-button>
      </template>
      <div v-if="myCreatedTeamList.length">
        <div v-for="teamSpace in myCreatedTeamList" :key="teamSpace.spaceVO?.id" class="spaceList">
          <a-row justify="space-around" align="middle">
            <a-col :span="4">
              <h4>{{ teamSpace.spaceVO.spaceName }}</h4>
            </a-col>
            <a-col :span="16">
              <a-row justify="center">
                <a-col :span="8">
                  <a-space>
                    <div>
                      大小: {{ formatSize(teamSpace.spaceVO.totalSize) }} /{{
                        formatSize(teamSpace.spaceVO.maxSize)
                      }}
                    </div>
                    <div>
                      数量: {{ teamSpace.spaceVO.totalCount }} / {{ teamSpace.spaceVO.maxCount }}
                    </div>
                  </a-space>
                </a-col>
                <a-col :span="8">
                  <a-row>
                    <a-col :span="12">
                      空间级别
                      <a-tag :color="getSpaceLevelColor(teamSpace.spaceVO.spaceLevel)">
                        {{ SPACE_LEVEL_MAP[teamSpace.spaceVO.spaceLevel] }}
                      </a-tag>
                    </a-col>
                    <a-col :span="12">
                      担任角色
                      <a-tag :color="getSpaceTypeColor(teamSpace.spaceRole)">
                        {{ SPACE_ROLE_MAP[teamSpace.spaceRole] }}
                      </a-tag>
                    </a-col>
                  </a-row>
                </a-col>
                <a-col :span="8">
                  <div>
                    创建时间：{{
                      dayjs(teamSpace.spaceVO.createTime).format('YYYY-MM-DD HH:mm:ss')
                    }}
                  </div>
                </a-col>
              </a-row>
            </a-col>
            <a-col :span="4">
              <a-space>
                <a-button :href="`/addSpace?id=${teamSpace.spaceId}&type=${teamSpace.spaceVO?.spaceType}`" type="default">
                  编辑
                </a-button>
                <a-button @click="goSpaceDetail(teamSpace.spaceVO?.id)" type="primary">
                  空间详情
                </a-button>
                <a-button
                  v-if="canManageSpaceUser(teamSpace.spaceId, false)"
                  type="dashed"
                  :icon="h(BarChartOutlined)"
                  :href="`/space_analyze?spaceId=${teamSpace.spaceVO?.id}`"
                  target="_blank"
                >
                  分析
                </a-button>
              </a-space>
            </a-col>
          </a-row>
        </div>
      </div>
      <div v-else>
        <div>
          <p style="text-align: center">您还没有创建团队空间。</p>
        </div>
      </div>
    </a-card>
    <a-card title="我加入的团队空间" class="card">
      <div v-if="myJoinTeamList.length">
        <div v-for="teamSpace in myJoinTeamList" :key="teamSpace.spaceVO?.id" class="spaceList">
          <a-row justify="space-around" align="middle" style="margin-bottom: 12px">
            <a-col :span="4">
              <h4>{{ teamSpace.spaceVO.spaceName }}</h4>
              <div style="font-size: 12px">创建人：{{teamSpace.spaceVO.userVO.userName}}</div>
            </a-col>
            <a-col :span="16">
              <a-row justify="center">
                <a-col :span="8">
                  <a-space>
                    <div>
                      大小: {{ formatSize(teamSpace.spaceVO.totalSize) }} /{{
                        formatSize(teamSpace.spaceVO.maxSize)
                      }}
                    </div>
                    <div>
                      数量: {{ teamSpace.spaceVO.totalCount }} / {{ teamSpace.spaceVO.maxCount }}
                    </div>
                  </a-space>
                </a-col>
                <a-col :span="8">
                  <a-row>
                    <a-col :span="12">
                      空间级别
                      <a-tag :color="getSpaceLevelColor(teamSpace.spaceVO.spaceLevel)">
                        {{ SPACE_LEVEL_MAP[teamSpace.spaceVO.spaceLevel] }}
                      </a-tag>
                    </a-col>
                    <a-col :span="12">
                      担任角色
                      <a-tag :color="getSpaceTypeColor(teamSpace.spaceRole)">
                        {{ SPACE_ROLE_MAP[teamSpace.spaceRole] }}
                      </a-tag>
                    </a-col>
                  </a-row>
                </a-col>
                <a-col :span="8">
                  <div>
                    加入时间：{{ dayjs(teamSpace.createTime).format('YYYY-MM-DD HH:mm:ss') }}
                  </div>
                </a-col>
              </a-row>
            </a-col>
            <a-col :span="4">
              <a-space>
                <a-button @click="goSpaceDetail(teamSpace.spaceVO?.id)" type="default">
                  空间详情
                </a-button>
                <a-button
                  v-if="canManageSpaceUser(teamSpace.spaceId, true)"
                  type="dashed"
                  :icon="h(BarChartOutlined)"
                  :href="`/space_analyze?spaceId=${teamSpace.spaceVO?.id}`"
                  target="_blank"
                >
                  空间分析
                </a-button>
              </a-space>
            </a-col>
          </a-row>
        </div>
      </div>
      <div v-else>
        <p style="text-align: center">您还没有加入任何团队空间。</p>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, h, computed, nextTick } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import {
  listMyCreateTeamSpaceUsingPost,
  listMyJoinTeamSpaceUsingPost,
} from '@/api/spaceUserController.ts'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons-vue'
import { SPACE_LEVEL_MAP, SPACE_PERMISSION_ENUM, SPACE_ROLE_MAP, SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { formatSize } from '@/utils'
import { BarChartOutlined } from '@ant-design/icons-vue'

const loginUserStore = useLoginUserStore()
const createLoading = ref(false)
const joinLoading = ref(false)
const router = useRouter()
const myCreatedTeamList = ref<API.SpaceUserVO[]>([])
const myJoinTeamList = ref<API.SpaceUserVO[]>([])

// 获取团队空间列表（只在组件挂载时获取一次）
onMounted(async () => {
  if (loginUserStore?.loginUser) {
    createLoading.value = true
    joinLoading.value = true
    try {
      const result = await listMyCreateTeamSpaceUsingPost({})
      if (result.data.code === 0 && result.data.data) {
        myCreatedTeamList.value = result.data.data ?? []
      } else {
        message.error('获取团队空间失败，' + result.data.message)
      }
      const res = await listMyJoinTeamSpaceUsingPost({})
      if (res.data.code === 0) {
        myJoinTeamList.value = res.data.data ?? []
      }
    } catch (error) {
      console.error('获取团队空间列表失败:', error)
    } finally {
      createLoading.value = false
      joinLoading.value = false
    }
  } else {
    message.warning('登录获取更多内容！')
    router.push('/login')
  }
})

// region 空间分析按钮
// 创建一个 Map 来存储 id 和 permissionList
const createSpacePermissionIdMap = computed(() => {
  const map = new Map<number, string[]>()
  myCreatedTeamList.value.forEach((teamSpace) => {
    if (teamSpace.spaceVO && teamSpace.spaceId !== undefined) {
      map.set(teamSpace.spaceId, teamSpace.spaceVO.permissionList || [])
    }
  })
  return map
})
// 创建一个 Map 来存储 id 和 permissionList
const joinSpacePermissionIdMap = computed(() => {
  const map = new Map<number, string[]>()
  myJoinTeamList.value.forEach((teamSpace) => {
    if (teamSpace.spaceVO && teamSpace.spaceId !== undefined) {
      map.set(teamSpace.spaceId, teamSpace.spaceVO.permissionList || [])
    }
  })
  return map
})
// 通用权限检查函数
// 修改：createPermissionChecker 直接返回布尔值
function createPermissionChecker(permission: string, spaceId: number, isJoin: boolean): boolean {
  const permissionList = getPermissionListBySpaceId(spaceId, isJoin)
  // 添加调试信息，确认每次检查的值
  // console.log(`Checking permission '${permission}' for spaceId ${spaceId} (isJoin=${isJoin}). List: ${JSON.stringify(permissionList)}. Result: ${permissionList.includes(permission)}`);
  return permissionList.includes(permission)
}

// 修改：canManageSpaceUser 直接调用 createPermissionChecker 并返回布尔值
function canManageSpaceUser(spaceId: number | undefined, isJoin: boolean): boolean {
  // 处理 spaceId 可能为 undefined 的情况
  if (spaceId === undefined) {
    return false
  }
  return createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE, spaceId, isJoin)
}

// 获取指定 spaceId 的权限列表
function getPermissionListBySpaceId(spaceId: number, isJoin: boolean): string[] {
  const map = isJoin ? joinSpacePermissionIdMap.value : createSpacePermissionIdMap.value
  return map.get(spaceId) || []
}

// endregion

// 空间详情
const goSpaceDetail = (spaceId: string) => {
  router.push({
    path: '/space/' + spaceId,
  })
}
// 空间详情
const doCreateTeam = () => {
  router.push('/addSpace?type=' + SPACE_TYPE_ENUM.TEAM)
}

const getSpaceLevelColor = (level: number) => {
  switch (level) {
    case 0: // 假设 0 表示基础班
      return 'default'
    case 1: //  1 表示专业版
      return 'green'
    case 2: //  2 表示旗舰版
      return 'red'
    default:
      return 'default'
  }
}
const getSpaceTypeColor = (type: number) => {
  switch (type) {
    case 0: // 假设 0 表示浏览者
      return 'default'
    case 1: // 假设 1 表示编辑者
      return 'green'
    case 2: // 假设 2 表示管理员
      return 'volcano'
    default:
      return 'default'
  }
}
</script>
<style scoped>
.card {
  margin-top: 16px;
}
</style>
