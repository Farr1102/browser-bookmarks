<script setup lang="ts">
import { ref } from 'vue';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { useLanguageStore } from '../stores/languageStore';
import ThemeToggle from '../components/ThemeToggle.vue';
import { useRouter } from 'vue-router';
import { parseBookmarksFromHtml, isBookmarkHtmlFile } from '../utils/bookmarkParser';
import { exportBookmarksToHtml } from '../utils/bookmarkExporter';
import { useLayoutStore } from '../stores/layoutStore';

const bookmarkStore = useBookmarkStore();
const languageStore = useLanguageStore();
const layoutStore = useLayoutStore();
const router = useRouter();

const wallpaperFile = ref<File | null>(null);
const wallpaperPreview = ref<string | null>(null);

// Function to handle exporting bookmarks
const exportBookmarks = (format: 'json' | 'html' = 'json') => {
  const data = bookmarkStore.exportData();
  let blob;
  let filename;

  if (format === 'html') {
    const html = exportBookmarksToHtml(data);
    blob = new Blob([html], { type: 'text/html' });
    filename = 'bookmarks-export.html';
  } else {
    const json = JSON.stringify(data, null, 2);
    blob = new Blob([json], { type: 'application/json' });
    filename = 'bookmarks-export.json';
  }
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

// Function to handle importing bookmarks
const importBookmarks = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  
  const file = target.files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      
      // Check if it's an HTML bookmark file
      if (isBookmarkHtmlFile(content)) {
        const parsedData = parseBookmarksFromHtml(content);
        bookmarkStore.importData(parsedData);
      } else {
        // Try parsing as JSON
        const data = JSON.parse(content);
        bookmarkStore.importData(data);
      }
      
      alert(languageStore.t('settings.importSuccess'));
    } catch (error) {
      console.error('Import error:', error);
      alert(languageStore.t('settings.importError'));
    }
  };
  
  reader.readAsText(file);
};

// Function to go back to previous page
const goBack = () => {
  router.back();
};

// Function to handle wallpaper file selection
const handleWallpaperSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  
  wallpaperFile.value = target.files[0];
  
  // Create a preview
  const reader = new FileReader();
  reader.onload = (e) => {
    wallpaperPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(wallpaperFile.value);
};
</script>

<template>
  <div class="settings-container">
    <div class="settings-header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="settings-title">{{ languageStore.t('settings.title') }}</h1>
    </div>

    <section class="settings-section">
      <h2 class="section-title">{{ languageStore.t('settings.importExport') }}</h2>
      
      <div class="export-controls">
        <button class="action-button" @click="exportBookmarks('json')">
          {{ languageStore.t('export.as_json') }}
        </button>
        <button class="action-button" @click="exportBookmarks('html')">
          {{ languageStore.t('export.as_html') }}
        </button>
      </div>
      
      <div class="import-controls">
        <p class="import-note">{{ languageStore.t('settings.import_note') }}</p>
        <label class="file-input-label">
          {{ languageStore.t('settings.import_bookmarks') }}
          <input
            type="file"
            accept=".json,.html"
            @change="importBookmarks"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
        </label>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">{{ languageStore.t('settings.theme_settings') }}</h2>
      <ThemeToggle />
    </section>
    
    <section class="settings-section">
      <h2 class="section-title">{{ languageStore.t('settings.wallpaper_settings') }}</h2>
      
      <div class="wallpaper-controls">
        <label class="file-input-label">
          {{ languageStore.t('theme.select_wallpaper') }}
          <input 
            type="file" 
            class="file-input"
            accept="image/*"
            @change="handleWallpaperSelect"
          >
        </label>
      </div>
      
      <div v-if="wallpaperPreview" class="wallpaper-preview">
        <p class="preview-label">{{ languageStore.t('settings.preview') }}:</p>
        <div 
          class="preview-image"
          :style="{ 'background-image': `url(${wallpaperPreview})` }"
        ></div>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">{{ languageStore.t('settings.layout_settings') }}</h2>
      
      <div class="layout-controls">
        <div class="form-group">
          <label class="form-label">{{ languageStore.t('settings.bookmarks_per_row') }}</label>
          <div class="form-input-group">
            <input 
              type="number" 
              v-model="layoutStore.settings.bookmarksPerRow"
              min="2"
              max="6"
              class="number-input"
            >
          </div>
          <p class="form-help">{{ languageStore.t('settings.bookmarks_per_row_help') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.settings-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.back-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.back-button:hover {
  background-color: var(--card-background-hover);
}

.back-icon {
  display: inline-block;
  line-height: 1;
}

.settings-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
  flex-grow: 1;
}

.settings-section {
  background-color: var(--card-background);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.section-title {
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.export-controls, .import-controls, .wallpaper-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-button, .file-input-label {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.file-input-label:hover {
  background-color: var(--primary-hover);
}

.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.import-note {
  width: 100%;
  margin-bottom: 0.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.wallpaper-preview {
  margin-top: 1rem;
  width: 100%;
}

.preview-label {
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-size: 0.9rem;
}

.preview-image {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 2px 10px var(--shadow-color);
}

@media (max-width: 768px) {
  .export-controls, .import-controls, .wallpaper-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-button, .file-input-label {
    width: 100%;
    text-align: center;
  }
}

.layout-controls {
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 500;
}

.form-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.number-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--input-background);
  color: var(--text-color);
  font-size: 1rem;
}

.number-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

.form-help {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-light);
}
</style> 