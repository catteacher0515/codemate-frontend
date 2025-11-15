<template>
  <div class="team-create-page">
    <h2>创建队伍</h2>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="top"
      class="create-form"
    >
      <el-form-item label="队伍名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入队伍名称"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="队伍描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入队伍描述（选填）"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="队伍人数" prop="maxNum">
        <el-input-number v-model="formData.maxNum" :min="2" :max="5" />
      </el-form-item>

      <el-form-item label="过期时间" prop="expireTime">
        <el-date-picker
          v-model="formData.expireTime"
          type="datetime"
          placeholder="选择过期时间（选填）"
          value-format="YYYY-MM-DDTHH:mm:ss"
          :disabled-date="disabledBeforeToday"
        />
      </el-form-item>

      <el-form-item label="队伍状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="0">公开</el-radio>
          <el-radio :label="1">私有</el-radio>
          <el-radio :label="2">加密</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="formData.status === 2"
        label="队伍密码"
        prop="password"
      >
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入至少4位密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="队伍标签 (最多3个)" prop="tags">
        <el-select
          v-model="formData.tags"
          multiple
          :multiple-limit="3"
          filterable
          allow-create
          default-first-option
          placeholder="输入标签后按回车"
          style="width: 100%;"
        >
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="isLoading">
          立即创建
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>

    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import type { FormInstance, FormRules } from 'element-plus';

// (ElMessage 是由 auto-import 自动导入的，无需手动 import)

// --- 状态定义 ---

const router = useRouter();
const formRef = ref<FormInstance>(); // (用于表单校验)
const isLoading = ref(false); // (防止重复提交)

// (1) 表单数据 (匹配 TeamCreateDTO)
const formData = ref({
  name: '',
  description: '',
  maxNum: 3,
  expireTime: null, // (允许为空)
  status: 0,
  password: '',
  tags: [],
});

// (2) 表单校验规则
const formRules = ref<FormRules>({
  name: [
    { required: true, message: '队伍名称不能为空', trigger: 'blur' },
    { min: 3, message: '队伍名称至少3个字', trigger: 'blur' },
  ],
  maxNum: [
    { required: true, message: '必须设置队伍人数', trigger: 'blur' },
  ],
  password: [
    // (自定义一个校验规则，匹配后端)
    { validator: (rule, value, callback) => {
        if (formData.value.status === 2 && (value === null || value.length < 4)) {
          callback(new Error('加密队伍必须设置至少4位密码'));
        } else {
          callback();
        }
      }, trigger: 'blur' }
  ],
  tags: [
    { type: 'array', min: 1, message: '至少设置一个标签', trigger: 'change' }
  ]
});

// --- 辅助函数 ---

/**
 * 辅助函数：禁用今天之前的日期
 */
const disabledBeforeToday = (time: Date) => {
  // (设置 time 的时分秒为 0，确保“今天”可选)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return time.getTime() < today.getTime();
};

// --- 核心行动 ---

/**
 * 【行动 A：提交表单】
 */
const handleSubmit = async () => {
  if (!formRef.value) return; // (类型守卫)
  isLoading.value = true;

  try {
    // (1. 触发表单校验)
    await formRef.value.validate();

    // (2. 发送 POST 请求到后端)
    const response = await axios.post('/api/team/create', formData.value);

    // (3. 处理后端响应)
    if (response.data.code === 0) {
      ElMessage.success('队伍创建成功！');
      // (跳转到“我的队伍”页面，或者伙伴匹配页)
      // (我们先假设跳回伙伴匹配页)
      router.push('/partner/match');
    } else {
      // (显示后端返回的业务错误)
      ElMessage.error(`创建失败: ${response.data.message || '未知错误'}`);
    }

  } catch (error: any) {
    // (处理网络错误或 axios 错误)
    if (error.response) {
      // (后端返回了非 2xx 状态码，比如 401 未登录)
      ElMessage.error(`创建失败: ${error.response.data.message || '服务器错误'}`);
    } else if (error.name !== 'ValidateError') {
      // (如果错误不是“表单校验失败”，则显示网络错误)
      ElMessage.error('网络请求失败');
    }
  } finally {
    isLoading.value = false; // (无论成功失败，都解除 loading 状态)
  }
};

/**
 * 【行动 B：重置表单】
 */
const handleReset = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

</script>

<style scoped>
.team-create-page {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.create-form {
  margin-top: 20px;
}
</style>
