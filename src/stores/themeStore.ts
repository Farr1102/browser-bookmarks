import { defineStore } from 'pinia';
import { ref, watch, onMounted, onUnmounted } from 'vue';

const THEME_STORAGE_KEY = 'browser-bookmarks-theme-settings';

// 壁纸位置类型
export type WallpaperPosition = 'cover' | 'contain' | '100% 100%';

// 配色方案类型
export type ColorScheme = 'ocean' | 'sunset' | 'forest';

// 主题设置接口
export interface ThemeSettings {
  darkMode: boolean;
  useSystemTheme: boolean;
  customWallpaper: string;
  wallpaperPosition: WallpaperPosition;
  wallpaperBlur: number;
  colorScheme: ColorScheme;
}

// 配色方案对象
export const colorSchemes = {
  ocean: {
    light: {
      primary: '#1a73e8',
      danger: '#e53935',
    },
    dark: {
      primary: '#4ecdc4',
      danger: '#ff6b6b',
    }
  },
  sunset: {
    light: {
      primary: '#f43b47',
      danger: '#e53935',
    },
    dark: {
      primary: '#ff9b44',
      danger: '#f43b47',
    }
  },
  forest: {
    light: {
      primary: '#42b883',
      danger: '#e53935',
    },
    dark: {
      primary: '#42b883',
      danger: '#ff6b6b',
    }
  }
};

// 默认主题设置
const defaultSettings: ThemeSettings = {
  darkMode: false,
  useSystemTheme: true,
  customWallpaper: '',
  wallpaperPosition: 'cover',
  wallpaperBlur: 5,
  colorScheme: 'ocean'
};

// 从本地存储加载设置
function loadFromStorage(): ThemeSettings {
  try {
    const storedSettings = localStorage.getItem(THEME_STORAGE_KEY);
    return storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;
  } catch (error) {
    console.error('无法加载主题设置:', error);
    return defaultSettings;
  }
}

// 保存设置到本地存储
function saveToStorage(settings: ThemeSettings): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('无法保存主题设置:', error);
  }
}

// 检测系统是否为暗黑模式
function isSystemDarkMode(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// 创建主题仓库
export const useThemeStore = defineStore('theme', () => {
  // 加载设置
  const settings = ref<ThemeSettings>(loadFromStorage());
  
  // 当前是否为暗黑模式（结合系统主题和用户设置）
  const isDarkMode = ref(settings.value.useSystemTheme ? isSystemDarkMode() : settings.value.darkMode);
  
  // 监听系统主题变化
  const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  systemThemeMedia.addEventListener('change', e => {
    if (settings.value.useSystemTheme) {
      isDarkMode.value = e.matches;
      applyTheme();
    }
  });
  
  // 切换暗黑模式
  function toggleDarkMode(value?: boolean): void {
    isDarkMode.value = value !== undefined ? value : !isDarkMode.value;
    
    if (!settings.value.useSystemTheme) {
      settings.value.darkMode = isDarkMode.value;
    }
    
    applyTheme();
  }
  
  // 切换是否使用系统主题
  function toggleUseSystemTheme(value?: boolean): void {
    settings.value.useSystemTheme = value !== undefined ? value : !settings.value.useSystemTheme;
    
    if (settings.value.useSystemTheme) {
      isDarkMode.value = isSystemDarkMode();
      applyTheme();
    }
  }
  
  // 设置自定义壁纸
  function setCustomWallpaper(imageData: string): void {
    settings.value.customWallpaper = imageData;
    applyTheme();
  }
  
  // 移除壁纸
  function removeCustomWallpaper(): void {
    settings.value.customWallpaper = '';
    applyTheme();
  }
  
  // 设置壁纸位置
  function setWallpaperPosition(position: WallpaperPosition): void {
    settings.value.wallpaperPosition = position;
    applyTheme();
  }
  
  // 设置壁纸模糊度
  function setWallpaperBlur(blur: number): void {
    settings.value.wallpaperBlur = blur;
    applyTheme();
  }
  
  // 设置配色方案
  function setColorScheme(scheme: ColorScheme): void {
    settings.value.colorScheme = scheme;
    applyTheme();
  }
  
  // 应用主题到文档
  function applyTheme(): void {
    // 应用暗黑模式
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    
    // 应用自定义壁纸
    if (settings.value.customWallpaper) {
      document.documentElement.style.setProperty('--wallpaper-url', `url(${settings.value.customWallpaper})`);
      document.documentElement.style.setProperty('--wallpaper-position', settings.value.wallpaperPosition);
      document.documentElement.style.setProperty('--wallpaper-blur', `${settings.value.wallpaperBlur}px`);
      document.documentElement.classList.add('has-wallpaper');
    } else {
      document.documentElement.style.removeProperty('--wallpaper-url');
      document.documentElement.classList.remove('has-wallpaper');
    }
    
    // 应用配色方案
    const scheme = settings.value.colorScheme;
    
    // 如果scheme无效，使用默认的ocean方案
    const validScheme = colorSchemes[scheme] ? scheme : 'ocean';
    
    const mode = isDarkMode.value ? 'dark' : 'light';
    const colors = colorSchemes[validScheme][mode];
    
    // 设置主色和危险色 CSS 变量
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--danger-color', colors.danger);
    
    // 计算并设置 RGB 值（用于透明度）
    const primaryRgb = hexToRgb(colors.primary);
    const dangerRgb = hexToRgb(colors.danger);
    
    if (primaryRgb) {
      document.documentElement.style.setProperty(
        '--primary-color-rgb', 
        `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`
      );
    }
    
    if (dangerRgb) {
      document.documentElement.style.setProperty(
        '--danger-color-rgb',
        `${dangerRgb.r}, ${dangerRgb.g}, ${dangerRgb.b}`
      );
    }
  }
  
  // 将十六进制颜色转换为RGB值
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  // 当设置变化时保存到本地存储
  watch(settings, (newSettings) => {
    saveToStorage(newSettings);
  }, { deep: true });
  
  // 初始应用主题
  applyTheme();
  
  return {
    settings,
    isDarkMode,
    colorSchemes,
    toggleDarkMode,
    toggleUseSystemTheme,
    setCustomWallpaper,
    removeCustomWallpaper,
    setWallpaperPosition,
    setWallpaperBlur,
    setColorScheme,
    applyTheme
  };
}); 