import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

// 存储键
const LAYOUT_STORAGE_KEY = 'bookmark-layout-settings';

// 默认设置
const DEFAULT_BOOKMARKS_PER_ROW = 3;

interface LayoutSettings {
  bookmarksPerRow: number;
}

// 从 localStorage 加载设置
const loadFromStorage = (): LayoutSettings => {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取布局设置失败:', error);
  }
  return {
    bookmarksPerRow: DEFAULT_BOOKMARKS_PER_ROW
  };
};

// 保存设置到 localStorage
const saveToStorage = (settings: LayoutSettings): void => {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('保存布局设置失败:', error);
  }
};

// 定义 store
export const useLayoutStore = defineStore('layout', () => {
  // 设置状态
  const settings = ref<LayoutSettings>(loadFromStorage());
  
  // 更新每行书签数
  const setBookmarksPerRow = (value: number) => {
    settings.value.bookmarksPerRow = value;
  };
  
  // 监听设置变化并保存
  watch(settings, (newSettings) => {
    saveToStorage(newSettings);
  }, { deep: true });
  
  return {
    settings,
    setBookmarksPerRow
  };
}); 