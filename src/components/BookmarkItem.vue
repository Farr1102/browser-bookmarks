<script setup lang="ts">
import { ref, computed } from "vue";
import type { Bookmark } from "../types/bookmark";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useLanguageStore } from "../stores/languageStore";
import { getFavicon, getInitial, extractDomain } from "../utils/favicon";

const props = defineProps<{
  bookmark: Bookmark;
}>();

const bookmarkStore = useBookmarkStore();
const languageStore = useLanguageStore();
const showEditForm = ref(false);
const showConfirmDelete = ref(false);

const editedBookmark = ref({
  title: props.bookmark.title,
  url: props.bookmark.url,
  categoryId: props.bookmark.categoryId,
});

// 获取网站favicon
const favicon = computed(() => {
  return getFavicon(props.bookmark.url);
});

// 从URL中获取域名
const domain = computed(() => {
  return extractDomain(props.bookmark.url);
});

// 使用首字母作为fallback的图标
const initial = computed(() => {
  return getInitial(props.bookmark.title);
});

// 图片错误处理（使用首字母作为fallback）
const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};

const toggleEditForm = () => {
  if (!showEditForm.value) {
    // 打开编辑表单时，重置为原始值
    editedBookmark.value = {
      title: props.bookmark.title,
      url: props.bookmark.url,
      categoryId: props.bookmark.categoryId,
    };
  }
  showEditForm.value = !showEditForm.value;
  showConfirmDelete.value = false;
};

const saveEdit = () => {
  if (editedBookmark.value.title.trim() && editedBookmark.value.url.trim()) {
    bookmarkStore.updateBookmark(props.bookmark.id, {
      title: editedBookmark.value.title.trim(),
      url: editedBookmark.value.url.trim(),
      categoryId: editedBookmark.value.categoryId,
    });
    showEditForm.value = false;
    // 重置图片错误状态
    imageError.value = false;
  }
};

const confirmDelete = () => {
  showConfirmDelete.value = true;
  showEditForm.value = false;
};

const cancelDelete = () => {
  showConfirmDelete.value = false;
};

const deleteBookmark = () => {
  bookmarkStore.deleteBookmark(props.bookmark.id);
  showConfirmDelete.value = false;
};
</script>

<template>
  <div class="bookmark-item">
    <!-- 显示模式 -->
    <div v-if="!showEditForm && !showConfirmDelete" class="bookmark-display">
      <div class="bookmark-icon">
        <img
          v-if="!imageError"
          :src="favicon"
          :alt="bookmark.title"
          @error="handleImageError"
          class="favicon"
        />
        <div v-else class="favicon-fallback">{{ initial }}</div>
      </div>

      <div class="bookmark-content">
        <a :href="bookmark.url" target="_blank" class="bookmark-title">
          {{ bookmark.title }}
        </a>
        <div class="bookmark-url">{{ domain }}</div>
      </div>

      <div class="bookmark-actions">
        <button class="edit-button" @click="toggleEditForm">
          <span class="button-icon">✏️</span>
          <!-- {{ languageStore.t('app.edit') }} -->
        </button>
        <button class="delete-button" @click="confirmDelete">
          <span class="button-icon">🗑️</span>
          <!-- {{ languageStore.t('app.delete') }} -->
        </button>
      </div>
    </div>

    <!-- 编辑模式 -->
    <form
      v-else-if="showEditForm"
      class="bookmark-edit-form"
      @submit.prevent="saveEdit"
    >
      <div class="form-group">
        <label for="edit-title">{{ languageStore.t("bookmark.title") }}</label>
        <input
          id="edit-title"
          v-model="editedBookmark.title"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="edit-url">{{ languageStore.t("bookmark.url") }}</label>
        <input
          id="edit-url"
          v-model="editedBookmark.url"
          type="url"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="edit-category">{{
          languageStore.t("bookmark.category")
        }}</label>
        <select
          id="edit-category"
          v-model="editedBookmark.categoryId"
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

      <div class="form-actions">
        <button type="submit" class="save-button">
          {{ languageStore.t("common.save") }}
        </button>
        <button type="button" class="cancel-button" @click="toggleEditForm">
          {{ languageStore.t("common.cancel") }}
        </button>
      </div>
    </form>

    <!-- 删除确认 -->
    <div v-else-if="showConfirmDelete" class="delete-confirm">
      <p>{{ languageStore.t("bookmark.delete_confirm") }}</p>
      <div class="form-actions">
        <button class="confirm-button" @click="deleteBookmark">
          {{ languageStore.t("confirm.yes") }}
        </button>
        <button class="cancel-button" @click="cancelDelete">
          {{ languageStore.t("common.cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bookmark-item {
  background-color: var(--card-background);
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--shadow-color);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.bookmark-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-color);
}

.bookmark-display {
  display: flex;
  padding: 16px;
  position: relative;
}

.bookmark-icon {
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favicon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 10px;
  background-color: rgba(var(--background-color-rgb), 0.5);
  padding: 4px;
  transition: transform 0.2s ease;
}

.favicon:hover {
  transform: scale(1.05);
}

.favicon-fallback {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-light, #6d8eff));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.favicon-fallback:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}

.bookmark-content {
  flex: 1;
  min-width: 0;
}

.bookmark-title {
  display: block;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-title:hover {
  color: var(--primary-color);
}

.bookmark-url {
  color: var(--text-light);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-actions {
  position: absolute;
  right: 0;
  top: 0;
  /* transform: translateY(-50%); */
  display: flex;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.bookmark-display:hover .bookmark-actions {
  opacity: 1;
}

.edit-button,
.delete-button {
  padding: 5px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--card-background-hover);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.bookmark-display:hover .edit-button,
.bookmark-display:hover .delete-button {
  opacity: 1;
  transform: translateY(0);
}

.edit-button {
  transition-delay: 0.05s;
}

.delete-button {
  transition-delay: 0.1s;
}

.edit-button:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.delete-button:hover {
  background-color: var(--danger-color);
  color: white;
  transform: translateY(-2px);
}

.bookmark-edit-form,
.delete-confirm {
  padding: 16px;
  background-color: var(--card-background);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  background-color: rgba(var(--background-color-rgb), 0.5);
  color: var(--text-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.save-button,
.confirm-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
}

.cancel-button {
  background-color: rgba(var(--background-color-rgb), 0.5);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 16px;
}

.delete-confirm {
  text-align: center;
  padding: 24px 16px;
}

.delete-confirm p {
  margin-bottom: 20px;
  color: var(--text-color);
  font-size: 16px;
}

.confirm-button {
  background-color: var(--danger-color);
}

.button-icon {
  margin-right: 6px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .bookmark-display {
    flex-direction: column;
  }

  .bookmark-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .bookmark-actions {
    flex-direction: row;
    margin-left: 0;
    margin-top: 12px;
  }
}
</style>
