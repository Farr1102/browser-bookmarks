import type { Bookmark, Category } from '../types/bookmark';

interface ParsedData {
  bookmarks: Bookmark[];
  categories: Category[];
}

// 从HTML字符串中提取书签和分类
export function parseBookmarksFromHtml(html: string): ParsedData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const bookmarks: Bookmark[] = [];
  const categories: Category[] = [];
  const categoryMap = new Map<string, string>(); // 存储文件夹名称到ID的映射
  
  // 确保有一个默认分类
  const defaultCategory: Category = {
    id: crypto.randomUUID(),
    name: '导入的书签',
    parentId: null,
    createdAt: Date.now()
  };
  categories.push(defaultCategory);
  
  // 递归处理书签文件夹和链接
  function processNode(node: Element, parentId: string | null = null) {
    const items = node.children;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.tagName === 'DT') {
        const linkOrFolder = item.firstElementChild;
        
        if (linkOrFolder?.tagName === 'A') {
          // 这是一个书签链接
          const bookmark: Bookmark = {
            id: crypto.randomUUID(),
            title: linkOrFolder.textContent || '未命名书签',
            url: linkOrFolder.getAttribute('href') || '',
            categoryId: parentId || defaultCategory.id,
            createdAt: Date.now()
          };
          bookmarks.push(bookmark);
        } else if (linkOrFolder?.tagName === 'H3') {
          // 这是一个文件夹
          const categoryName = linkOrFolder.textContent || '未命名文件夹';
          const categoryId = crypto.randomUUID();
          
          const category: Category = {
            id: categoryId,
            name: categoryName,
            parentId,
            createdAt: Date.now()
          };
          categories.push(category);
          categoryMap.set(categoryName, categoryId);
          
          // 处理子文件夹
          const subList = item.querySelector('DL');
          if (subList) {
            processNode(subList, categoryId);
          }
        }
      }
    }
  }
  
  // 查找并处理所有书签
  const bookmarkLists = doc.querySelectorAll('DL');
  bookmarkLists.forEach(list => processNode(list));
  
  return { bookmarks, categories };
}

// 判断是否是HTML格式的书签文件
export function isBookmarkHtmlFile(content: string): boolean {
  return content.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1>') ||
         content.includes('NETSCAPE-Bookmark-file-1') ||
         (content.includes('<DL>') && content.includes('<DT>'));
} 