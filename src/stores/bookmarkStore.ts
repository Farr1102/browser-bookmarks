import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Bookmark, Category } from '../types/bookmark';

// 存储键名
const BOOKMARKS_STORAGE_KEY = 'bookmarks';
const CATEGORIES_STORAGE_KEY = 'categories';

// 从localStorage加载数据
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

// 保存数据到localStorage
const saveToStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const useBookmarkStore = defineStore('bookmarkStore', () => {
  // 状态
  const bookmarks = ref<Bookmark[]>(loadFromStorage(BOOKMARKS_STORAGE_KEY, []));
  const categories = ref<Category[]>(loadFromStorage(CATEGORIES_STORAGE_KEY, []));

  // 初始化检查：确保至少有一个分类
  if (categories.value.length === 0) {
    const firstCategory: Category = {
      id: crypto.randomUUID(),
      name: '我的收藏',
      parentId: null,
      createdAt: Date.now()
    };
    categories.value.push(firstCategory);
    saveToStorage(CATEGORIES_STORAGE_KEY, categories.value);
  }

  // 获取所有书签，并按创建时间排序（最新的在前面）
  const getAllBookmarks = computed(() => {
    return [...bookmarks.value].sort((a, b) => b.createdAt - a.createdAt);
  });

  // Getters
  const getBookmarksByCategory = computed(() => (categoryId: string) => {
    return bookmarks.value.filter(bookmark => bookmark.categoryId === categoryId);
  });

  const getCategoryById = computed(() => (categoryId: string) => {
    return categories.value.find(category => category.id === categoryId);
  });

  const getChildCategories = computed(() => (parentId: string | null) => {
    return categories.value.filter(category => category.parentId === parentId);
  });

  // 获取分类路径（支持多级分类导航）
  const getCategoryPath = computed(() => (categoryId: string) => {
    const path: Category[] = [];
    let current: Category | undefined = categories.value.find(c => c.id === categoryId);
    
    while (current) {
      path.unshift(current);
      if (current.parentId) {
        const parent = categories.value.find(c => c.id === current?.parentId);
        if (!parent) break;
        current = parent;
      } else {
        current = undefined;
      }
    }
    
    return path;
  });

  // 获取第一个分类的ID（用于默认值）
  const getDefaultCategoryId = computed(() => {
    return categories.value.length > 0 ? categories.value[0].id : '';
  });

  // Actions
  function addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>) {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    
    bookmarks.value.push(newBookmark);
    saveToStorage(BOOKMARKS_STORAGE_KEY, bookmarks.value);
    return newBookmark;
  }

  function updateBookmark(id: string, data: Partial<Omit<Bookmark, 'id' | 'createdAt'>>) {
    const index = bookmarks.value.findIndex(b => b.id === id);
    if (index !== -1) {
      bookmarks.value[index] = { ...bookmarks.value[index], ...data };
      saveToStorage(BOOKMARKS_STORAGE_KEY, bookmarks.value);
      return true;
    }
    return false;
  }

  function deleteBookmark(id: string) {
    const index = bookmarks.value.findIndex(b => b.id === id);
    if (index !== -1) {
      bookmarks.value.splice(index, 1);
      saveToStorage(BOOKMARKS_STORAGE_KEY, bookmarks.value);
      return true;
    }
    return false;
  }

  function addCategory(category: Omit<Category, 'id' | 'createdAt'>) {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    
    categories.value.push(newCategory);
    saveToStorage(CATEGORIES_STORAGE_KEY, categories.value);
    return newCategory;
  }

  function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>) {
    const index = categories.value.findIndex(c => c.id === id);
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...data };
      saveToStorage(CATEGORIES_STORAGE_KEY, categories.value);
      return true;
    }
    return false;
  }

  function deleteCategory(id: string) {
    // 检查是否有子分类
    const hasChildren = categories.value.some(c => c.parentId === id);
    if (hasChildren) {
      return false;
    }
    
    // 如果只剩下一个分类，则不允许删除
    if (categories.value.length <= 1) {
      return false;
    }
    
    // 获取第一个不是要删除的分类的ID
    const fallbackCategoryId = categories.value.find(c => c.id !== id)?.id || '';
    
    // 将该分类下的书签移至另一个分类
    bookmarks.value.forEach(bookmark => {
      if (bookmark.categoryId === id) {
        bookmark.categoryId = fallbackCategoryId;
      }
    });
    
    // 删除分类
    const index = categories.value.findIndex(c => c.id === id);
    if (index !== -1) {
      categories.value.splice(index, 1);
      saveToStorage(CATEGORIES_STORAGE_KEY, categories.value);
      saveToStorage(BOOKMARKS_STORAGE_KEY, bookmarks.value);
      return true;
    }
    return false;
  }

  // 导入导出功能
  function exportData() {
    return {
      bookmarks: bookmarks.value,
      categories: categories.value
    };
  }

  function importData(data: { bookmarks: Bookmark[], categories: Category[] }) {
    if (Array.isArray(data.bookmarks) && Array.isArray(data.categories)) {
      // 确保至少有一个分类
      if (data.categories.length === 0) {
        data.categories.push({ 
          id: crypto.randomUUID(), 
          name: '我的收藏', 
          parentId: null, 
          createdAt: Date.now() 
        });
      }
      
      bookmarks.value = data.bookmarks;
      categories.value = data.categories;
      
      saveToStorage(BOOKMARKS_STORAGE_KEY, bookmarks.value);
      saveToStorage(CATEGORIES_STORAGE_KEY, categories.value);
      return true;
    }
    return false;
  }

  return {
    bookmarks,
    categories,
    getAllBookmarks,
    getBookmarksByCategory,
    getCategoryById,
    getChildCategories,
    getCategoryPath,
    getDefaultCategoryId,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    addCategory,
    updateCategory,
    deleteCategory,
    exportData,
    importData
  };
}); 