import { NewsStatus } from '../../../shared/enums/news-status.enum';
import { News } from '../entities/news.domain';

export interface NewsPublishedFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  tagIds?: string[];
  categoryId?: string;
}

export interface INewsRepository {
  findAll(): Promise<News[]>;
  findById(id: string): Promise<News | null>;
  findByIds(ids: string[]): Promise<News[]>;
  findByCategory(categoryId: string): Promise<News[]>;
  findByStatus(status: NewsStatus): Promise<News[]>;
  findByStatusAndAuthor(status: NewsStatus, authorId: string): Promise<News[]>;
  findByCategoryAndStatus(categoryId: string, status: NewsStatus): Promise<News[]>;
  findPublishedWithFilters(query: NewsPublishedFilter): Promise<News[]>;
  save(news: News): Promise<News>;
  update(id: string, news: News): Promise<News>;
  delete(id: string): Promise<void>;
}

export const NEWS_REPOSITORY = Symbol('NEWS_REPOSITORY');
