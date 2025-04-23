import type { Bookmark, Category } from '../types/bookmark';

interface ExportData {
  bookmarks: Bookmark[];
  categories: Category[];
}

export function exportBookmarksToHtml(data: ExportData): string {
  const { bookmarks, categories } = data;
  
  // 创建分类ID到分类对象的映射
  const categoryMap = new Map<string, Category>();
  categories.forEach(category => categoryMap.set(category.id, category));
  
  // 按分类组织书签
  const bookmarksByCategory = new Map<string, Bookmark[]>();
  bookmarks.forEach(bookmark => {
    const categoryId = bookmark.categoryId;
    if (!bookmarksByCategory.has(categoryId)) {
      bookmarksByCategory.set(categoryId, []);
    }
    bookmarksByCategory.get(categoryId)?.push(bookmark);
  });
  
  // 生成HTML
  const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${generateBookmarkHtml(categories, bookmarksByCategory, categoryMap)}
</DL><p>`;

  return html;
}

function generateBookmarkHtml(
  categories: Category[],
  bookmarksByCategory: Map<string, Bookmark[]>,
  categoryMap: Map<string, Category>,
  parentId: string | null = null,
  indent = '    '
): string {
  let html = '';
  
  // 处理当前层级的分类
  categories
    .filter(category => category.parentId === parentId)
    .forEach(category => {
      // 添加分类标题
      html += `${indent}<DT><H3>${escapeHtml(category.name)}</H3>\n`;
      html += `${indent}<DL><p>\n`;
      
      // 添加该分类下的书签
      const categoryBookmarks = bookmarksByCategory.get(category.id) || [];
      categoryBookmarks.forEach(bookmark => {
        html += `${indent}    <DT><A HREF="${escapeHtml(bookmark.url)}">${escapeHtml(bookmark.title)}</A>\n`;
      });
      
      // 递归处理子分类
      html += generateBookmarkHtml(categories, bookmarksByCategory, categoryMap, category.id, indent + '    ');
      
      html += `${indent}</DL><p>\n`;
    });
  
  // 处理无分类的书签
  if (parentId === null) {
    const uncategorizedBookmarks = bookmarksByCategory.get('') || [];
    uncategorizedBookmarks.forEach(bookmark => {
      html += `${indent}<DT><A HREF="${escapeHtml(bookmark.url)}">${escapeHtml(bookmark.title)}</A>\n`;
    });
  }
  
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
} 