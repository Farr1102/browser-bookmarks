<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useLanguageStore } from '../stores/languageStore';
import { useRoute } from 'vue-router';
import { useLayoutStore } from '../stores/layoutStore';
import BookmarkItem from '../components/BookmarkItem.vue';
import AddBookmarkDialog from '../components/AddBookmarkDialog.vue';
import Breadcrumb from '../components/Breadcrumb.vue';

const props = defineProps<{
  categoryId: string;
}>();

const bookmarkStore = useBookmarkStore();
const languageStore = useLanguageStore();
const layoutStore = useLayoutStore();
const route = useRoute();

// 书签对话框状态
const isAddBookmarkDialogOpen = ref(false);

// 打开添加书签对话框
const openAddBookmarkDialog = () => {
  isAddBookmarkDialogOpen.value = true;
};

// 关闭对话框
const closeAddBookmarkDialog = () => {
  isAddBookmarkDialogOpen.value = false;
};

const bookmarks = computed(() => {
  // 如果是默认分类且在根路径，则显示所有书签
  if (props.categoryId === 'default' && route.path === '/') {
    return bookmarkStore.getAllBookmarks;
  }
  // 否则只显示当前分类的书签
  return bookmarkStore.getBookmarksByCategory(props.categoryId);
});

// 判断是否为主页（显示所有书签）
const isHomePage = computed(() => {
  return route.path === '/';
});
</script>

<template>
  <div class="category-view">
    <div class="category-header">
      <Breadcrumb :category-id="categoryId" />
      
      <div class="category-actions">
        <button class="add-button" @click="openAddBookmarkDialog">
          {{ languageStore.t('bookmark.add') }}
        </button>
      </div>
    </div>

    <div v-if="bookmarks.length === 0" class="empty-state">
      <p>{{ isHomePage ? '暂无书签' : languageStore.t('bookmark.category') === 'Category' ? 'No bookmarks in this category' : '该分类下暂无书签' }}</p>
      <button class="add-button" @click="openAddBookmarkDialog">{{ languageStore.t('bookmark.add') }}</button>
    </div>

    <div class="bookmarks-grid" :style="{ 
      'grid-template-columns': `repeat(${layoutStore.settings.bookmarksPerRow}, 1fr)` 
    }">
      <BookmarkItem 
        v-for="bookmark in bookmarks" 
        :key="bookmark.id"
        :bookmark="bookmark"
      />
    </div>
    
    <!-- 添加书签对话框 -->
    <AddBookmarkDialog
      :is-open="isAddBookmarkDialogOpen"
      :initial-category-id="props.categoryId"
      @close="closeAddBookmarkDialog"
      @bookmark-added="closeAddBookmarkDialog"
    />
  </div>
</template>

<style scoped>
.category-view {
  padding: 1rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.category-actions {
  display: flex;
  align-items: center;
}

.add-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: var(--primary-hover);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--card-background);
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.empty-state p {
  margin-bottom: 1rem;
  color: var(--text-light);
}

.bookmarks-grid {
  display: grid;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .bookmarks-grid {
    grid-template-columns: 1fr !important;
  }
  
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .category-actions {
    width: 100%;
  }
  
  .add-button {
    width: 100%;
  }
}
</style> 