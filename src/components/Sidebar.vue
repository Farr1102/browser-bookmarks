<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useLanguageStore } from '../stores/languageStore';

const props = defineProps<{
  isOpen: boolean;
}>();

const bookmarkStore = useBookmarkStore();
const languageStore = useLanguageStore();

// 折叠状态跟踪
const collapsedCategories = ref<Record<string, boolean>>({
  'default': true // 默认分类默认为折叠状态
});

// 获取所有根分类（没有父分类的分类）
const rootCategories = computed(() => {
  return bookmarkStore.getChildCategories(null);
});

// 切换分类的折叠状态
const toggleCategory = (categoryId: string) => {
  collapsedCategories.value[categoryId] = !collapsedCategories.value[categoryId];
};

// 检查分类是否折叠
const isCategoryCollapsed = (categoryId: string) => {
  return !!collapsedCategories.value[categoryId];
};
</script>

<template>
  <aside class="sidebar" :class="{ 'open': isOpen }">
    <div class="sidebar-header">
      <h2>{{ languageStore.t('nav.categories') }}</h2>
    </div>
    
    <nav class="categories-nav">
      <router-link 
        to="/" 
        class="category-link"
        exact-active-class="active"
      >
        {{ languageStore.t('nav.all_bookmarks') }}
      </router-link>
      
      <div v-for="category in rootCategories" :key="category.id" class="category">
        <div class="category-header">
          <router-link 
            :to="`/category/${category.id}`"
            class="category-link"
            active-class="active"
          >
            {{ category.name }}
          </router-link>
          
          <button 
            v-if="bookmarkStore.getChildCategories(category.id).length > 0"
            class="collapse-button"
            @click="toggleCategory(category.id)"
          >
            {{ isCategoryCollapsed(category.id) ? '+' : '-' }}
          </button>
        </div>
        
        <div 
          class="subcategories" 
          v-if="bookmarkStore.getChildCategories(category.id).length > 0 && !isCategoryCollapsed(category.id)"
        >
          <div 
            v-for="child in bookmarkStore.getChildCategories(category.id)" 
            :key="child.id" 
            class="category"
          >
            <div class="category-header">
              <router-link 
                :to="`/category/${child.id}`"
                class="category-link"
                active-class="active"
              >
                {{ child.name }}
              </router-link>
              
              <button 
                v-if="bookmarkStore.getChildCategories(child.id).length > 0"
                class="collapse-button"
                @click="toggleCategory(child.id)"
              >
                {{ isCategoryCollapsed(child.id) ? '+' : '-' }}
              </button>
            </div>
            
            <!-- 递归渲染下一级子分类 -->
            <div 
              class="subcategories" 
              v-if="bookmarkStore.getChildCategories(child.id).length > 0 && !isCategoryCollapsed(child.id)"
            >
              <div 
                v-for="grandchild in bookmarkStore.getChildCategories(child.id)" 
                :key="grandchild.id" 
                class="category"
              >
                <router-link 
                  :to="`/category/${grandchild.id}`"
                  class="category-link"
                  active-class="active"
                >
                  {{ grandchild.name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <div class="sidebar-footer">
      <router-link to="/settings" class="settings-button">
        {{ languageStore.t('nav.manage_categories') }}
      </router-link>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: fixed;
  left: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 10;
}

.sidebar:not(.open) {
  transform: translateX(-280px);
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--sidebar-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--text-color);
  font-weight: 600;
}

.categories-nav {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.category {
  margin-bottom: 4px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-link {
  display: block;
  padding: 12px 16px;
  color: var(--text-color);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all 0.2s;
  flex: 1;
  border-radius: 0 10px 10px 0;
  font-size: 16px;
}

.category-link:hover {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.category-link.active {
  background-color: rgba(var(--primary-color-rgb), 0.15);
  border-left-color: var(--primary-color);
  font-weight: 600;
}

.collapse-button {
  background: none;
  border: none;
  color: var(--text-light);
  font-weight: bold;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  padding: 0;
  border-radius: 14px;
  transition: all 0.2s;
}

.collapse-button:hover {
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.subcategories {
  margin-left: 16px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--sidebar-border);
}

.settings-button {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: center;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s;
  font-weight: 500;
}

.settings-button:hover {
  background-color: rgba(var(--primary-color-rgb), 0.2);
}

@media (max-width: 768px) {
  .sidebar {
    width: 280px;
  }
  
  .sidebar.open {
    transform: translateX(0);
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  }
}
</style> 