<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useLanguageStore } from '../stores/languageStore';
import { useThemeStore } from '../stores/themeStore';
import { RouterView, useRoute } from 'vue-router';
import AddBookmarkDialog from '../components/AddBookmarkDialog.vue';
import { type ColorScheme, colorSchemes } from '../stores/themeStore';

const bookmarkStore = useBookmarkStore();
const languageStore = useLanguageStore();
const themeStore = useThemeStore();
const route = useRoute();

// 获取当前路由中的分类ID
const getCurrentCategoryId = computed(() => {
  const path = route.path;
  return path.startsWith('/category/') ? path.split('/').pop() || '' : '';
});

// 书签对话框状态
const addBookmarkDialog = ref(null);
const isAddBookmarkDialogOpen = ref(false);

// 打开添加书签对话框
const openAddBookmarkDialog = () => {
  // 打开对话框
  isAddBookmarkDialogOpen.value = true;
};

// 关闭对话框
const closeAddBookmarkDialog = () => {
  isAddBookmarkDialogOpen.value = false;
};

// 配色方案选择器
const showColorPicker = ref(false);
const colorPickerRef = ref<HTMLDivElement | null>(null);
const isDarkMode = computed(() => themeStore.isDarkMode);

// 可用的配色方案
const colorSchemeOptions = [
  { value: 'ocean', label: languageStore.t('theme.color_scheme.default') || 'Ocean' },
  { value: 'sunset', label: languageStore.t('theme.color_scheme.red') || 'Sunset' },
  { value: 'forest', label: languageStore.t('theme.color_scheme.green') || 'Forest' }
];

// 切换颜色选择器
const toggleColorPicker = () => {
  showColorPicker.value = !showColorPicker.value;
};

// 选择颜色方案
const selectColorScheme = (scheme: ColorScheme) => {
  themeStore.setColorScheme(scheme);
  showColorPicker.value = false;
};

// 当前选择的颜色方案
const currentColorScheme = computed(() => {
  const scheme = themeStore.settings.colorScheme;
  if (!colorSchemes[scheme]) {
    // 如果找不到配色方案，返回默认的ocean配色
    return isDarkMode.value ? colorSchemes['ocean'].dark.primary : colorSchemes['ocean'].light.primary;
  }
  return isDarkMode.value ? colorSchemes[scheme].dark.primary : colorSchemes[scheme].light.primary;
});

// 点击外部关闭颜色选择器
const handleClickOutside = (event: MouseEvent) => {
  if (showColorPicker.value && colorPickerRef.value && !colorPickerRef.value.contains(event.target as Node)) {
    showColorPicker.value = false;
  }
};

// 挂载和卸载全局事件处理
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 获取所有根分类（没有父分类的分类）
const rootCategories = computed(() => {
  return bookmarkStore.getChildCategories(null);
});

// 添加分类相关
const showAddCategory = ref(false);
const newCategoryName = ref('');

const addCategory = () => {
  if (newCategoryName.value.trim()) {
    bookmarkStore.addCategory({
      name: newCategoryName.value.trim(),
      parentId: null
    });
    newCategoryName.value = '';
    showAddCategory.value = false;
  }
};

// 删除分类
const deleteCategory = (id: string) => {
  if (confirm(languageStore.t('category.delete_confirm'))) {
    const result = bookmarkStore.deleteCategory(id);
    if (!result) {
      alert(languageStore.t('category.delete_error'));
    }
  }
};

// 切换语言
const toggleLanguage = () => {
  languageStore.toggleLanguage();
};

// 切换主题
const toggleDarkMode = () => {
  themeStore.toggleDarkMode();
};
</script>

<template>
  <div class="layout">
    <header class="header">
      <h1 class="app-title">{{ languageStore.t('app.name') }}</h1>
      
      <div class="header-actions">
        <!-- 配色方案选择器 -->
        <div class="color-picker-container" ref="colorPickerRef">
          <button 
            class="color-picker-button icon-button" 
            @click.stop="toggleColorPicker"
            :style="{ borderColor: currentColorScheme }"
            :title="languageStore.t('theme.color_scheme')"
          >
            <span class="color-dot" :style="{ backgroundColor: currentColorScheme }"></span>
            <span class="tooltip">{{ languageStore.t('theme.color_scheme') }}</span>
          </button>
          
          <div v-if="showColorPicker" class="color-picker-popover">
            <div class="popover-header">
              {{ languageStore.t('theme.color_scheme') }}
            </div>
            <div class="color-scheme-list">
              <button 
                v-for="option in colorSchemeOptions" 
                :key="option.value"
                class="color-scheme-item"
                :class="{ active: themeStore.settings.colorScheme === option.value }"
                @click="selectColorScheme(option.value as ColorScheme)"
              >
                <span 
                  class="color-preview" 
                  :style="{ 
                    backgroundColor: isDarkMode 
                      ? (colorSchemes[option.value] ? colorSchemes[option.value].dark.primary : colorSchemes.ocean.dark.primary) 
                      : (colorSchemes[option.value] ? colorSchemes[option.value].light.primary : colorSchemes.ocean.light.primary) 
                  }"
                ></span>
                <span class="color-name">{{ option.label }}</span>
              </button>
            </div>
          </div>
        </div>
      
        <!-- 主题切换按钮 -->
        <button class="icon-button" @click="toggleDarkMode" :title="languageStore.t('theme.dark_mode')">
          <span v-if="themeStore.isDarkMode">🌙</span>
          <span v-else>☀️</span>
          <span class="tooltip">{{ themeStore.isDarkMode ? languageStore.t('theme.dark_mode') : languageStore.t('theme.light_mode') }}</span>
        </button>
        
        <!-- 语言切换按钮 -->
        <button class="icon-button" @click="toggleLanguage" :title="languageStore.currentLanguage === 'cn' ? '切换语言' : 'Change Language'">
          {{ languageStore.currentLanguage === 'cn' ? '🇨🇳' : '🇺🇸' }}
          <span class="tooltip">{{ languageStore.currentLanguage === 'cn' ? languageStore.t('language.change') || '切换语言' : languageStore.t('language.change') || 'Change Language' }}</span>
        </button>
        
        <!-- 设置按钮 -->
        <router-link to="/settings" class="icon-button" :title="languageStore.t('settings.title') || '设置'">
          ⚙️
          <span class="tooltip">{{ languageStore.t('settings.title') || '设置' }}</span>
        </router-link>
      </div>
    </header>

    <main class="content">
      <!-- 分类标签区域 -->
      <div class="categories-section">
        <div class="categories-header">
          <h2>{{ languageStore.t('nav.categories') }}</h2>
        </div>
        
        <div class="categories-tags">
          <router-link 
            to="/" 
            class="category-tag"
            exact-active-class="active"
          >
            {{ languageStore.t('nav.all_bookmarks') }}
          </router-link>
          
          <div v-for="category in rootCategories" :key="category.id" class="category-tag-container">
            <router-link 
              :to="`/category/${category.id}`"
              class="category-tag"
              active-class="active"
            >
              {{ category.name }}
              <button 
                v-if="category.id !== 'default'" 
                class="delete-category-button"
                @click.prevent.stop="deleteCategory(category.id)"
              >
                ×
              </button>
            </router-link>
          </div>
          
          <!-- 添加分类按钮和表单 -->
          <div class="add-category-container">
            <button 
              v-if="!showAddCategory" 
              class="add-category-button"
              @click="showAddCategory = true"
            >
              + {{ languageStore.t('category.add') }}
            </button>
            
            <form v-else class="add-category-form" @submit.prevent="addCategory">
              <input 
                v-model="newCategoryName" 
                class="category-input" 
                :placeholder="languageStore.t('category.name')"
                autofocus
                @blur="showAddCategory = false"
              />
              <button type="submit" class="submit-category-button">
                ✓
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <!-- 主内容区域 -->
      <div class="main-content">
        <RouterView />
      </div>
      
      <!-- 浮动添加按钮 -->
      <button class="floating-add-button" @click="openAddBookmarkDialog">+</button>
    </main>
    
    <!-- 添加书签对话框 -->
    <AddBookmarkDialog 
      :is-open="isAddBookmarkDialogOpen" 
      :initial-category-id="getCurrentCategoryId.value"
      @close="closeAddBookmarkDialog"
      @bookmark-added="closeAddBookmarkDialog"
    />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 64px;
  background-color: var(--header-bg);
  color: var(--header-text);
  box-shadow: 0 1px 0 var(--border-color);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 20;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  flex-grow: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  padding: 0;
  transition: all 0.2s;
  background-color: rgba(var(--background-color-rgb), 0.3);
  position: relative;
}

.icon-button:hover {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.icon-button .tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  padding: 6px 10px;
  background-color: var(--card-background);
  color: var(--text-color);
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  z-index: 1000;
}

.icon-button:hover .tooltip {
  opacity: 1;
}

/* 配色方案选择器样式 */
.color-picker-container {
  position: relative;
}

.color-picker-button {
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.color-picker-button .tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  padding: 6px 10px;
  background-color: var(--card-background);
  color: var(--text-color);
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  z-index: 1000;
}

.color-picker-button:hover .tooltip {
  opacity: 1;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.3s;
}

.color-picker-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
  border: 1px solid var(--border-color);
  animation: popover-fade 0.2s ease-out;
}

@keyframes popover-fade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popover-header {
  padding: 12px 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.color-scheme-list {
  padding: 8px;
}

.color-scheme-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.color-scheme-item:hover {
  background-color: rgba(var(--background-color-rgb), 0.6);
}

.color-scheme-item.active {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.color-preview {
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-name {
  font-size: 14px;
  color: var(--text-color);
}

.settings-link {
  color: var(--primary-color);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  font-weight: 500;
}

.settings-link:hover {
  background-color: rgba(var(--primary-color-rgb), 0.2);
}

.content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  position: relative;
}

.categories-section {
  margin-bottom: 20px;
}

.categories-header {
  margin-bottom: 12px;
}

.categories-header h2 {
  font-size: 18px;
  margin: 0;
}

.categories-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.category-tag-container {
  position: relative;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background-color: var(--card-background);
  border-radius: 16px;
  color: var(--text-color);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
}

.category-tag.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.category-tag:hover {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.category-tag.active:hover {
  background-color: var(--primary-hover);
}

.delete-category-button {
  display: none;
  background: none;
  border: none;
  color: inherit;
  margin-left: 6px;
  padding: 0;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.category-tag-container:hover .delete-category-button {
  display: inline-block;
}

.add-category-button {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border: 1px dashed var(--primary-color);
  border-radius: 16px;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 14px;
}

.add-category-form {
  display: flex;
  align-items: center;
}

.category-input {
  padding: 6px 10px;
  border-radius: 16px;
  border: 1px solid var(--primary-color);
  font-size: 14px;
  background-color: var(--card-background);
  color: var(--text-color);
  width: 150px;
}

.submit-category-button {
  margin-left: 5px;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
}

.main-content {
  flex-grow: 1;
}

/* 浮动添加按钮 - iOS风格 */
.floating-add-button {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: var(--primary-color);
  color: white;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.4);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  transform: rotate(0deg);
}

.floating-add-button:hover {
  transform: rotate(90deg);
  background-color: var(--primary-hover);
}

.floating-add-button:active {
  transform: scale(0.95) rotate(90deg);
}

@media (max-width: 768px) {
  .header {
    padding: 0 12px;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .categories-tags {
    gap: 8px;
  }
  
  .category-tag {
    padding: 4px 10px;
    font-size: 13px;
  }
  
  .floating-add-button {
    bottom: 24px;
    right: 24px;
    width: 50px;
    height: 50px;
    font-size: 28px;
  }
}
</style> 