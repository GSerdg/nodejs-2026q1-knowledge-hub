export interface Article {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  userId?: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}
