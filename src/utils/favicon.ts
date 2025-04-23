// 获取网站的favicon
export function getFavicon(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch (e) {
    return '';
  }
}

// 从URL中提取域名
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// 从标题中获取首字母（用于fallback图标）
export function getInitial(text: string): string {
  return text && text.length > 0 ? text[0].toUpperCase() : '?';
} 