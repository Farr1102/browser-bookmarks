<script setup lang="ts">
import { ref } from 'vue';
import type { Bookmark } from '../types/bookmark';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useLanguageStore } from '../stores/languageStore';

const emit = defineEmits<{
  (e: 'submit', bookmark: Omit<Bookmark, 'id' | 'createdAt'>): void;
}>();

const bookmarkStore = useBookmarkStore();
const languageStore = useLanguageStore();

const newBookmark = ref({
  title: '',
  url: '',
  categoryId: 'default'
});

// 表单提交
const submitForm = () => {
  if (newBookmark.value.title.trim() && newBookmark.value.url.trim()) {
    emit('submit', {
      title: newBookmark.value.title.trim(),
      url: newBookmark.value.url.trim(),
      categoryId: newBookmark.value.categoryId
    });
    
    // 重置表单
    newBookmark.value.title = '';
    newBookmark.value.url = '';
    newBookmark.value.categoryId = 'default';
  }
};

// 尝试从粘贴内容自动填充标题和URL
const handlePaste = (event: ClipboardEvent) => {
  const pastedText = event.clipboardData?.getData('text');
  if (!pastedText) return;
  
  // 检查是否是URL
  try {
    const url = new URL(pastedText);
    
    // 如果当前没有输入URL，则填充URL字段
    if (!newBookmark.value.url) {
      newBookmark.value.url = url.href;
      
      // 如果当前没有标题，使用域名作为标题
      if (!newBookmark.value.title) {
        newBookmark.value.title = url.hostname.replace(/^www\./, '');
      }
    }
  } catch (e) {
    // 不是有效URL，不做处理
  }
};
</script>

<template>
  <div class="bookmark-form-container">
    <form class="bookmark-form ios-form" @submit.prevent="submitForm">
      <div class="form-header">
        <h3>{{ languageStore.t('bookmark.add') }}</h3>
      </div>
      
      <div class="form-body">
        <div class="form-group">
          <input 
            id="bookmark-title" 
            v-model="newBookmark.title" 
            required
            :placeholder="languageStore.t('bookmark.title')" 
            class="form-input"
            @paste="handlePaste"
          />
        </div>
        
        <div class="form-group">
          <input 
            id="bookmark-url" 
            v-model="newBookmark.url" 
            type="url" 
            required
            placeholder="https://example.com" 
            class="form-input"
            @paste="handlePaste"
          />
        </div>
        
        <div class="form-group">
          <select 
            id="bookmark-category"
            v-model="newBookmark.categoryId"
            class="form-select"
          >
            <option 
              v-for="category in bookmarkStore.categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="form-footer">
        <button type="submit" class="ios-button">
          {{ languageStore.t('bookmark.add') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.bookmark-form-container {
  width: 100%;
  margin-bottom: 20px;
}

.bookmark-form {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background-color: var(--card-background);
  box-shadow: 0 2px 12px var(--shadow-color);
}

.form-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.form-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.form-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-input, .form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  background-color: rgba(var(--background-color-rgb), 0.5);
  color: var(--text-color);
  transition: all 0.2s;
}

.form-input:focus, .form-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
  background-color: var(--card-background);
}

.form-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
}

.ios-button {
  display: block;
  width: 100%;
  padding: 14px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: center;
}

.ios-button:hover {
  background-color: var(--primary-hover);
}

.ios-button:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .form-input, .form-select, .ios-button {
    font-size: 15px;
  }
}
</style> 