<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useLanguageStore } from '../stores/languageStore';

const props = defineProps<{
  isOpen: boolean;
  initialCategoryId?: string;
}>();

const isSubmitting = ref(false);
const emit = defineEmits(['update:isOpen', 'bookmark-added', 'close']);

const bookmarkStore = useBookmarkStore();
const languageStore = useLanguageStore();

const dialogRef = ref<HTMLDialogElement | null>(null);
const titleInput = ref<HTMLInputElement | null>(null);
const title = ref('');
const url = ref('');
const categoryId = ref('');
const errors = ref({
  title: '',
  url: '',
  category: ''
});

// 计算属性：表单是否有效
const isFormValid = computed(() => {
  return (
    title.value.trim() !== '' &&
    url.value.trim() !== '' &&
    validateUrl(url.value) &&
    categoryId.value !== ''
  );
});

// 提交表单
const submitForm = async () => {
  if (!isFormValid.value) return;
  
  try {
    isSubmitting.value = true;
    const newBookmark = await bookmarkStore.addBookmark({
      title: title.value.trim(),
      url: url.value.trim(),
      categoryId: categoryId.value
    });
    
    // 重置表单
    resetForm();
    closeDialog();
    
    // 通知父组件书签已添加
    emit('bookmark-added', newBookmark);
  } catch (error) {
    console.error('Failed to add bookmark:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// 验证URL
const validateUrl = (value: string): boolean => {
  if (!value) return false;
  
  try {
    // 如果没有协议，添加http://
    const urlToTest = value.match(/^https?:\/\//) ? value : `http://${value}`;
    new URL(urlToTest);
    return true;
  } catch (e) {
    return false;
  }
};

// 监听URL输入变化，验证并设置错误信息
const validateUrlInput = () => {
  if (url.value.trim() === '') {
    errors.value.url = '';
    return;
  }
  
  if (!validateUrl(url.value)) {
    errors.value.url = languageStore.t('errors.invalid_url');
  } else {
    errors.value.url = '';
  }
};

// 处理粘贴事件
const handlePaste = async (event: ClipboardEvent) => {
  const clipboardData = event.clipboardData;
  if (!clipboardData) return;
  
  const text = clipboardData.getData('text');
  
  // 尝试将粘贴内容解析为URL
  try {
    // 如果URL有效，则自动填充URL字段
    if (validateUrl(text)) {
      // 阻止默认粘贴行为
      event.preventDefault();
      
      // 如果粘贴到URL字段，直接设置值
      url.value = text;
      
      // 如果标题为空，尝试从URL获取网站标题
      if (!title.value.trim()) {
        try {
          // 这里模拟从URL获取标题的逻辑
          // 实际应用中可能需要通过API或其他方式获取网站标题
          const domain = new URL(text).hostname.replace('www.', '');
          title.value = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        } catch (e) {
          // 如果获取标题失败，不进行任何处理
        }
      }
    }
  } catch (e) {
    // 如果解析URL出错，不进行任何处理
  }
};

// 重置表单
const resetForm = () => {
  title.value = '';
  url.value = '';
  categoryId.value = props.initialCategoryId || '';
  errors.value = {
    title: '',
    url: '',
    category: ''
  };
};

// 打开对话框
const openDialog = async () => {
  if (dialogRef.value) {
    // 确保使用初始分类ID
    categoryId.value = props.initialCategoryId || '';
    dialogRef.value.showModal();
    
    // 在下一个tick后聚焦到标题输入框
    await nextTick();
    if (titleInput.value) {
      titleInput.value.focus();
    }
  }
};

// 关闭对话框
const closeDialog = () => {
  if (dialogRef.value) {
    dialogRef.value.close();
    emit('update:isOpen', false);
    emit('close'); // 兼容旧的close事件
  }
};

// 监听props.isOpen的变化
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    openDialog();
  } else if (dialogRef.value && dialogRef.value.open) {
    dialogRef.value.close();
  }
});

// 组件挂载时
onMounted(() => {
  if (props.isOpen) {
    openDialog();
  }
  
  // 添加事件监听器，对话框被取消时更新状态
  if (dialogRef.value) {
    dialogRef.value.addEventListener('cancel', (event) => {
      // 阻止默认的ESC键关闭行为
      event.preventDefault();
      closeDialog();
    });
  }
});
</script>

<template>
  <dialog 
    ref="dialogRef" 
    class="bookmark-dialog" 
    @close="emit('update:isOpen', false)"
  >
    <div class="dialog-header">
      <button 
        type="button"
        class="close-button"
        @click="closeDialog"
      >
        {{ languageStore.t('common.cancel') }}
      </button>
      <h2 class="dialog-title">{{ languageStore.t('bookmark.add_new') }}</h2>
      <button 
        type="button"
        class="submit-button" 
        :disabled="!isFormValid || isSubmitting"
        @click="submitForm"
      >
        {{ isSubmitting ? languageStore.t('common.saving') : languageStore.t('common.add') }}
      </button>
    </div>
    
    <form @submit.prevent="submitForm" class="bookmark-form">
      <div class="form-group">
        <label for="bookmark-title">{{ languageStore.t('bookmark.title') }}</label>
        <input
          id="bookmark-title"
          ref="titleInput"
          v-model="title"
          type="text"
          required
          :placeholder="languageStore.t('bookmark.title_placeholder')"
          class="form-input"
          @paste="handlePaste"
        />
        <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
      </div>
      
      <div class="form-group">
        <label for="bookmark-url">{{ languageStore.t('bookmark.url') }}</label>
        <input
          id="bookmark-url"
          v-model="url"
          type="text"
          required
          :placeholder="languageStore.t('bookmark.url_placeholder')"
          class="form-input"
          @input="validateUrlInput"
          @paste="handlePaste"
        />
        <span v-if="errors.url" class="error-message">{{ errors.url }}</span>
      </div>
      
      <div class="form-group">
        <label for="bookmark-category">{{ languageStore.t('bookmark.category') }}</label>
        <select
          id="bookmark-category"
          v-model="categoryId"
          required
          class="form-select"
        >
          <option value="" disabled>{{ languageStore.t('bookmark.select_category') }}</option>
          <option
            v-for="category in bookmarkStore.categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.bookmark-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background-color: var(--background-color);
  z-index: 1000;
  overflow-y: auto;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-background);
  position: sticky;
  top: 0;
  z-index: 10;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  flex: 1;
  margin: 0;
  color: var(--text-color);
}

.close-button,
.submit-button {
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px;
}

.close-button {
  color: var(--text-light);
}

.close-button:hover {
  color: var(--danger-color);
}

.submit-button {
  color: var(--primary-color);
}

.submit-button:disabled {
  color: var(--text-light);
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button:not(:disabled):hover {
  opacity: 0.8;
}

.bookmark-form {
  padding: 24px 16px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.form-input,
.form-select {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  background-color: var(--card-background);
  color: var(--text-color);
  appearance: none;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.form-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

.error-message {
  display: block;
  margin-top: 8px;
  color: var(--danger-color);
  font-size: 14px;
}

/* 移动端优化 */
@media (min-width: 768px) {
  .bookmark-dialog {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 550px;
    height: auto;
    max-height: 90vh;
    border-radius: 16px;
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translate(-50%, -48%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  .dialog-header {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
}
</style> 