<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useLanguageStore } from '../stores/languageStore';

const route = useRoute();
const bookmarkStore = useBookmarkStore();
const languageStore = useLanguageStore();

const breadcrumbs = computed(() => {
  const categoryId = route.params.id as string;
  if (!categoryId) return [];

  const breadcrumbList = [];
  let currentCategory = bookmarkStore.categories.find(c => c.id === categoryId);

  while (currentCategory) {
    breadcrumbList.unshift({
      id: currentCategory.id,
      name: currentCategory.name,
      icon: '📁'
    });
    currentCategory = bookmarkStore.categories.find(c => c.id === currentCategory?.parentId);
  }

  return breadcrumbList;
});
</script>

<template>
  <nav class="breadcrumb" v-if="breadcrumbs.length">
    <RouterLink to="/" class="breadcrumb-item home">
      🏠 {{ languageStore.t('nav.home') }}
    </RouterLink>
    <span class="separator" v-if="breadcrumbs.length">/</span>
    <template v-for="(item, index) in breadcrumbs" :key="item.id">
      <RouterLink
        :to="'/category/' + item.id"
        class="breadcrumb-item"
        :class="{ active: index === breadcrumbs.length - 1 }"
      >
        <span class="icon">{{ item.icon }}</span>
        {{ item.name }}
      </RouterLink>
      <span class="separator" v-if="index < breadcrumbs.length - 1">/</span>
    </template>
  </nav>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--card-background);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px var(--shadow-color);
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  color: var(--text-light);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  color: var(--primary-color);
  transform: translateY(-1px);
}

.breadcrumb-item.active {
  color: var(--text-color);
  font-weight: 500;
  pointer-events: none;
}

.breadcrumb-item.home {
  font-weight: 500;
}

.separator {
  margin: 0 8px;
  color: var(--text-light);
  opacity: 0.5;
}

.icon {
  margin-right: 6px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .breadcrumb {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .separator {
    margin: 0 6px;
  }
}
</style> 