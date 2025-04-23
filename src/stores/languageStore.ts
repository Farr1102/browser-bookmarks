import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

// 存储键
const LANGUAGE_STORAGE_KEY = 'bookmark-language';

// 支持的语言
export type Language = 'cn' | 'en';

// 从 localStorage 加载语言设置
const loadFromStorage = (): Language => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : 'cn';
  } catch (error) {
    console.error('读取语言设置失败:', error);
    return 'cn';
  }
};

// 保存语言设置到 localStorage
const saveToStorage = (language: Language): void => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(language));
  } catch (error) {
    console.error('保存语言设置失败:', error);
  }
};

// 翻译内容
interface TranslationDict {
  [key: string]: string;
}

// 所有支持语言的翻译
interface Translations {
  [lang: string]: TranslationDict;
}

// 定义翻译
const translations: Translations = {
  cn: {
    'app.title': '书签管理器',
    'app.name': '书签管理器',
    'sidebar.home': '首页',
    'sidebar.all': '所有书签',
    'sidebar.settings': '设置',
    'sidebar.about': '关于',
    'nav.add_category': '添加分类',
    'nav.language': '语言',
    'nav.dark_mode': '深色模式',
    'nav.categories': '分类',
    'nav.all_bookmarks': '全部书签',
    'category.new': '新分类',
    'category.name': '分类名称',
    'category.add': '添加',
    'category.cancel': '取消',
    'category.delete_confirm': '确定要删除此分类吗？',
    'category.delete_error': '删除分类失败',
    'bookmark.add_new': '添加书签',
    'bookmark.add_to': '添加书签到',
    'bookmark.add': '添加书签',
    'bookmark.title': '标题',
    'bookmark.url': '网址',
    'bookmark.category': '分类',
    'bookmark.submit': '提交',
    'bookmark.cancel': '取消',
    'bookmark.delete': '删除',
    'bookmark.delete_confirm': '确定要删除这个书签吗?',
    'bookmark.edit': '编辑',
    'bookmark.noCategory': '无分类',
    'bookmark.titlePlaceholder': '输入标题',
    'bookmark.urlPlaceholder': '输入网址',
    'confirm.yes': '是',
    'confirm.no': '否',
    'settings.importExport': '导入/导出',
    'settings.export_bookmarks': '导出书签',
    'settings.import_note': '支持从主流浏览器导入书签',
    'settings.import_bookmarks': '导入书签',
    'settings.theme_settings': '主题设置',
    'settings.wallpaper_settings': '壁纸设置',
    'settings.select_wallpaper': '选择壁纸',
    'settings.language': '语言设置',
    'settings.about': '关于应用',
    'settings.title': '设置',
    'import.title': '导入书签',
    'import.from_browser': '从浏览器导入',
    'import.from_file': '从文件导入',
    'import.select_file': '选择文件',
    'import.file_selected': '已选择文件',
    'import.note': '支持从 Chrome, Firefox, Safari 和 Edge 导出的 HTML 书签文件',
    'export.title': '导出书签',
    'export.all': '导出所有书签',
    'export.as_html': '导出为 HTML',
    'export.as_json': '导出为 JSON',
    'export.success': '导出成功',
    'export.error': '导出失败',
    'language.title': '语言',
    'language.cn': '中文',
    'language.en': '英文',
    'language.change': '切换语言',
    'about.version': '版本',
    'about.description': '一个简单的书签管理工具，帮助您整理和管理网络书签。',
    'about.developed_by': '开发者',
    'about.contact': '联系方式',
    'alert.success': '成功',
    'alert.error': '错误',
    'alert.warning': '警告',
    'common.loading': '加载中...',
    'common.no_data': '暂无数据',
    'common.search': '搜索',
    'common.save': '保存',
    'common.close': '关闭',
    'common.cancel': '取消',
    'common.add': '添加',
    'common.update': '更新',
    'common.create': '创建',
    'common.confirm': '确认',
    'app.edit': '编辑',
    'app.delete': '删除',
    'app.confirm': '确认',
    'app.cancel': '取消',
    'app.save': '保存',
    'bookmarks.addBookmark': '添加书签',
    'bookmarks.title': '标题',
    'bookmarks.url': '网址',
    'bookmarks.category': '分类',
    'bookmarks.noCategory': '无分类',
    'bookmarks.titlePlaceholder': '输入标题',
    'bookmarks.urlPlaceholder': '输入网址',
    'errors.titleRequired': '请输入标题',
    'errors.urlRequired': '请输入网址',
    'errors.invalidUrl': '请输入有效的网址',
    'errors.selectImageFile': '请选择图片文件',
    'error.required': '必填项',
    'error.valid_url': '请输入有效的网址',
    // 主题相关的翻译
    'theme.title': '主题模式',
    'theme.light_mode': '浅色模式',
    'theme.dark_mode': '深色模式',
    'theme.system': '跟随系统',
    'theme.systemTheme': '跟随系统主题',
    'theme.darkMode': '深色模式',
    'theme.wallpaper': '自定义壁纸',
    'theme.wallpaperBlur': '模糊效果',
    'theme.color_scheme': '配色方案',
    'theme.colorScheme': '配色方案',
    'theme.preview': '壁纸预览',
    'theme.positions.cover': '填充屏幕',
    'theme.positions.contain': '适应屏幕',
    'theme.positions.stretch': '拉伸显示',
    'theme.position.center': '居中显示',
    'theme.position.cover': '填充屏幕',
    'theme.position.contain': '适应屏幕',
    'theme.position.repeat': '平铺重复',
    'theme.color_scheme.default': '默认蓝色',
    'theme.color_scheme.red': '红色主题',
    'theme.color_scheme.green': '绿色主题',
    'theme.color_scheme.purple': '紫色主题',
    'theme.color_scheme.orange': '橙色主题',
    'theme.select_wallpaper': '选择壁纸',
    // CategoryForm 相关
    'categoryForm.name': '分类名称',
    'categoryForm.namePlaceholder': '输入分类名称',
    'categoryForm.icon': '图标',
    'categoryForm.iconPlaceholder': '输入图标 (例如: 📁)',
    'categoryForm.iconHelp': '可以使用emoji表情符号作为图标',
    'categoryForm.color': '颜色',
    'bookmark.title_placeholder': '请输入书签标题',
    'bookmark.url_placeholder': '请输入书签网址',
    'bookmark.select_category': '请选择分类',
    'settings.importSuccess': '导入成功',
    'settings.importError': '导入失败',
  },
  en: {
    'app.title': 'Bookmark Manager',
    'app.name': 'Bookmark Manager',
    'sidebar.home': 'Home',
    'sidebar.all': 'All Bookmarks',
    'sidebar.settings': 'Settings',
    'sidebar.about': 'About',
    'nav.add_category': 'Add Category',
    'nav.language': 'Language',
    'nav.dark_mode': 'Dark Mode',
    'nav.categories': 'Categories',
    'nav.all_bookmarks': 'All Bookmarks',
    'category.new': 'New Category',
    'category.name': 'Category Name',
    'category.add': 'Add',
    'category.cancel': 'Cancel',
    'category.delete_confirm': 'Are you sure you want to delete this category?',
    'category.delete_error': 'Failed to delete category',
    'bookmark.add_new': 'Add Bookmark',
    'bookmark.add_to': 'Add bookmark to',
    'bookmark.add': 'Add Bookmark',
    'bookmark.title': 'Title',
    'bookmark.url': 'URL',
    'bookmark.category': 'Category',
    'bookmark.submit': 'Submit',
    'bookmark.cancel': 'Cancel',
    'bookmark.delete': 'Delete',
    'bookmark.delete_confirm': 'Are you sure you want to delete this bookmark?',
    'bookmark.edit': 'Edit',
    'bookmark.noCategory': 'No Category',
    'bookmark.titlePlaceholder': 'Enter title',
    'bookmark.urlPlaceholder': 'Enter URL',
    'confirm.yes': 'Yes',
    'confirm.no': 'No',
    'settings.importExport': 'Import/Export',
    'settings.export_bookmarks': 'Export Bookmarks',
    'settings.import_note': 'Support importing bookmarks from major browsers',
    'settings.import_bookmarks': 'Import Bookmarks',
    'settings.theme_settings': 'Theme Settings',
    'settings.wallpaper_settings': 'Wallpaper Settings',
    'settings.select_wallpaper': 'Select Wallpaper',
    'settings.language': 'Language Settings',
    'settings.about': 'About',
    'settings.title': 'Settings',
    'import.title': 'Import Bookmarks',
    'import.from_browser': 'Import from Browser',
    'import.from_file': 'Import from File',
    'import.select_file': 'Select File',
    'import.file_selected': 'File Selected',
    'import.note': 'Supports HTML bookmark files exported from Chrome, Firefox, Safari, and Edge',
    'export.title': 'Export Bookmarks',
    'export.all': 'Export All Bookmarks',
    'export.as_html': 'Export as HTML',
    'export.as_json': 'Export as JSON',
    'export.success': 'Export Successful',
    'export.error': 'Export Failed',
    'language.title': 'Language',
    'language.cn': 'Chinese',
    'language.en': 'English',
    'language.change': 'Switch Language',
    'about.version': 'Version',
    'about.description': 'A simple bookmark management tool to help you organize and manage your web bookmarks.',
    'about.developed_by': 'Developed by',
    'about.contact': 'Contact',
    'alert.success': 'Success',
    'alert.error': 'Error',
    'alert.warning': 'Warning',
    'common.loading': 'Loading...',
    'common.no_data': 'No Data',
    'common.search': 'Search',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.add': 'Add',
    'common.update': 'Update',
    'common.create': 'Create',
    'common.confirm': 'Confirm',
    'app.edit': 'Edit',
    'app.delete': 'Delete',
    'app.confirm': 'Confirm',
    'app.cancel': 'Cancel',
    'app.save': 'Save',
    'bookmarks.addBookmark': 'Add Bookmark',
    'bookmarks.title': 'Title',
    'bookmarks.url': 'URL',
    'bookmarks.category': 'Category',
    'bookmarks.noCategory': 'No Category',
    'bookmarks.titlePlaceholder': 'Enter title',
    'bookmarks.urlPlaceholder': 'Enter URL',
    'errors.titleRequired': 'Title is required',
    'errors.urlRequired': 'URL is required',
    'errors.invalidUrl': 'Please enter a valid URL',
    'errors.selectImageFile': 'Please select an image file',
    'error.required': 'Required',
    'error.valid_url': 'Please enter a valid URL',
    // Theme related
    'theme.title': 'Theme Mode',
    'theme.light_mode': 'Light Mode',
    'theme.dark_mode': 'Dark Mode',
    'theme.system': 'System Theme',
    'theme.systemTheme': 'Use System Theme',
    'theme.darkMode': 'Dark Mode',
    'theme.wallpaper': 'Custom Wallpaper',
    'theme.wallpaperBlur': 'Blur Effect',
    'theme.color_scheme': 'Color Scheme',
    'theme.colorScheme': 'Color Scheme',
    'theme.preview': 'Wallpaper Preview',
    'theme.positions.cover': 'Cover Screen',
    'theme.positions.contain': 'Fit Screen',
    'theme.positions.stretch': 'Stretch',
    'theme.position.center': 'Center',
    'theme.position.cover': 'Cover',
    'theme.position.contain': 'Contain',
    'theme.position.repeat': 'Repeat',
    'theme.color_scheme.default': 'Default Blue',
    'theme.color_scheme.red': 'Red Theme',
    'theme.color_scheme.green': 'Green Theme',
    'theme.color_scheme.purple': 'Purple Theme',
    'theme.color_scheme.orange': 'Orange Theme',
    'theme.select_wallpaper': 'Select Wallpaper',
    // CategoryForm related
    'categoryForm.name': 'Category Name',
    'categoryForm.namePlaceholder': 'Enter category name',
    'categoryForm.icon': 'Icon',
    'categoryForm.iconPlaceholder': 'Enter icon (e.g. 📁)',
    'categoryForm.iconHelp': 'You can use emoji as icon',
    'categoryForm.color': 'Color',
    'bookmark.title_placeholder': 'Enter bookmark title',
    'bookmark.url_placeholder': 'Enter bookmark URL',
    'bookmark.select_category': 'Select a category',
    'settings.importSuccess': 'Import Successful',
    'settings.importError': 'Import Failed',
  }
};

// 定义语言存储
export const useLanguageStore = defineStore('language', () => {
  // 当前语言
  const currentLanguage = ref<Language>(loadFromStorage());
  
  // 翻译函数
  const t = (key: string): string => {
    const lang = currentLanguage.value;
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    // 如果找不到对应的翻译，返回键名
    console.warn(`未找到翻译：${key}`);
    return key;
  };
  
  // 设置语言
  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang;
    saveToStorage(lang);
    document.querySelector('html')?.setAttribute('lang', lang);
  };
  
  // 切换中英文
  const toggleLanguage = () => {
    const newLang: Language = currentLanguage.value === 'cn' ? 'en' : 'cn';
    setLanguage(newLang);
  };
  
  // 初始化时设置 HTML 语言属性
  document.querySelector('html')?.setAttribute('lang', currentLanguage.value);
  
  // 监听语言变化并保存到存储
  watch(currentLanguage, (newLang) => {
    saveToStorage(newLang);
  });
  
  return {
    currentLanguage,
    t,
    setLanguage,
    toggleLanguage
  };
}); 