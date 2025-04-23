<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useThemeStore, WallpaperPosition, ColorScheme } from '../stores/themeStore';
import { useLanguageStore } from '../stores/languageStore';

const themeStore = useThemeStore();
const languageStore = useLanguageStore();
const { t } = languageStore;

// 响应式状态
const isDarkMode = computed(() => themeStore.isDarkMode);
const useSystemTheme = computed(() => themeStore.settings.useSystemTheme);
const customWallpaper = computed(() => themeStore.settings.customWallpaper);
const wallpaperPosition = computed({
  get: () => themeStore.settings.wallpaperPosition,
  set: (value) => themeStore.setWallpaperPosition(value)
});
const wallpaperBlur = computed({
  get: () => themeStore.settings.wallpaperBlur,
  set: (value) => themeStore.setWallpaperBlur(value)
});
const colorScheme = computed({
  get: () => themeStore.settings.colorScheme,
  set: (value) => themeStore.setColorScheme(value)
});

// 本地状态
const fileInput = ref<HTMLInputElement | null>(null);
const wallpaperPreview = ref<string>(customWallpaper.value || '');
const hasCustomWallpaper = computed(() => !!customWallpaper.value);

// 监听 isDarkMode 变化
watch(isDarkMode, (newValue) => {
  themeStore.toggleDarkMode(newValue);
});

// 监听 useSystemTheme 变化
watch(useSystemTheme, (newValue) => {
  themeStore.toggleUseSystemTheme();
  if (newValue) {
    isDarkMode.value = themeStore.isDarkMode;
  }
});

// 监听 wallpaperPosition 变化
watch(wallpaperPosition, (newValue) => {
  themeStore.setWallpaperPosition(newValue);
});

// 监听 wallpaperBlur 变化
watch(wallpaperBlur, (newValue) => {
  themeStore.setWallpaperBlur(newValue);
});

// 监听 colorScheme 变化
watch(colorScheme, (newValue) => {
  themeStore.setColorScheme(newValue);
});

// 切换暗色模式
const toggleDarkMode = () => {
  themeStore.toggleDarkMode();
};

// 切换使用系统主题
const toggleSystemTheme = () => {
  themeStore.toggleUseSystemTheme();
};

// 壁纸模糊度控制
const updateWallpaperBlur = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  wallpaperBlur.value = parseInt(value);
};

// 设置壁纸位置
const updateWallpaperPosition = () => {
  themeStore.setWallpaperPosition(wallpaperPosition.value);
};

// 设置颜色方案
const setColorScheme = (scheme: ColorScheme) => {
  themeStore.setColorScheme(scheme);
};

// 计算壁纸预览样式
const wallpaperPreviewStyle = computed(() => {
  return {
    backgroundImage: wallpaperPreview.value ? `url(${wallpaperPreview.value})` : 'none',
    backgroundSize: wallpaperPosition.value === 'cover' ? 'cover' : 
                   wallpaperPosition.value === 'contain' ? 'contain' : 
                   wallpaperPosition.value === '100% 100%' ? '100% 100%' : 'auto',
    backgroundPosition: 'center',
    filter: `blur(${wallpaperBlur.value / 2}px)`
  };
});

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  if (!file.type.startsWith('image/')) {
    alert(t('errors.selectImageFile'));
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    wallpaperPreview.value = result;
    themeStore.setCustomWallpaper(result);
  };
  reader.readAsDataURL(file);
};

// 移除壁纸
const removeWallpaper = () => {
  themeStore.removeCustomWallpaper();
  wallpaperPreview.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

// 从主题存储同步设置
onMounted(() => {
  wallpaperPreview.value = themeStore.settings.customWallpaper || '';
});

// 配色方案选项
const colorSchemes = computed(() => [
  { id: 'ocean', name: t('theme.color_scheme.default') || 'Ocean Blue' },
  { id: 'sunset', name: t('theme.color_scheme.red') || 'Sunset Red' },
  { id: 'forest', name: t('theme.color_scheme.green') || 'Forest Green' }
]);
</script>

<template>
  <div class="theme-settings">
    <div class="theme-section">
      <div class="theme-option">
        <span>{{ t('theme.darkMode') }}</span>
        <label class="toggle-switch">
          <input type="checkbox" :checked="isDarkMode" @change="toggleDarkMode" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="theme-option">
        <span>{{ t('theme.systemTheme') }}</span>
        <label class="toggle-switch">
          <input type="checkbox" :checked="useSystemTheme" @change="toggleSystemTheme" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="theme-section">
      <h3>{{ t('theme.wallpaper') }}</h3>
      
      <div class="theme-option">
        <label class="file-input-label">
          {{ t('theme.select_wallpaper') }}
          <input 
            type="file" 
            class="file-input" 
            accept="image/*" 
            @change="handleFileSelect" 
            ref="fileInput"
          />
        </label>
      </div>
      
      <div v-if="hasCustomWallpaper" class="wallpaper-controls">
        <div class="wallpaper-preview" :style="wallpaperPreviewStyle"></div>
        
        <div class="theme-option">
          <span>{{ t('theme.wallpaperBlur') }}</span>
          <input 
            type="range" 
            min="0" 
            max="20" 
            :value="wallpaperBlur" 
            @input="updateWallpaperBlur" 
            class="range-slider"
          />
          <span>{{ wallpaperBlur }}px</span>
        </div>
        
        <div class="theme-option">
          <span>{{ t('theme.wallpaperPosition') }}</span>
          <select v-model="wallpaperPosition">
            <option value="cover">{{ t('theme.positions.cover') }}</option>
            <option value="contain">{{ t('theme.positions.contain') }}</option>
            <option value="100% 100%">{{ t('theme.positions.stretch') }}</option>
          </select>
        </div>
        
        <button class="danger-button" @click="removeWallpaper">
          {{ t('theme.removeWallpaper') }}
        </button>
      </div>
    </div>
    
    <div class="theme-section">
      <h3>{{ t('theme.colorScheme') }}</h3>
      <div class="color-schemes">
        <div 
          v-for="scheme in colorSchemes" 
          :key="scheme.id"
          :class="['color-scheme', `${scheme.id}-scheme`, { active: colorScheme === scheme.id }]"
          @click="colorScheme = scheme.id as ColorScheme"
          :title="scheme.name"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.theme-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-section h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--text-color);
}

.theme-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.file-input-label {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.file-input-label:hover {
  background-color: rgba(var(--primary-color-rgb), 0.9);
}

.file-input {
  display: none;
}

.range-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
}

.range-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
}

select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  color: var(--text-color);
  font-size: 14px;
}

.danger-button {
  margin-top: 8px;
  padding: 8px 16px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.danger-button:hover {
  background-color: rgba(var(--danger-color-rgb), 0.9);
}

.wallpaper-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallpaper-preview {
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  margin-bottom: 16px;
}

.color-schemes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-scheme {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.ocean-scheme {
  background: linear-gradient(135deg, #1a73e8, #4ecdc4);
}

.sunset-scheme {
  background: linear-gradient(135deg, #f43b47, #ff9b44);
}

.forest-scheme {
  background: linear-gradient(135deg, #42b883, #2f9164);
}

.color-scheme:hover {
  transform: scale(1.05);
}

.color-scheme.active {
  border-color: var(--text-color);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

@media (max-width: 640px) {
  .theme-option {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .theme-option .toggle-switch {
    align-self: flex-end;
  }
}
</style> 