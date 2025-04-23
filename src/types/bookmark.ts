export interface Bookmark {
  id: string;
  title: string;
  url: string;
  categoryId: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null; // 支持多级分类
  createdAt: number;
} 