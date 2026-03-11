import { NewsStatus } from '../../../shared/enums/news-status.enum';
import { NewsDomain } from '../entities/news.domain';

export interface INewsRepository {
  findAll(): Promise<NewsDomain[]>;
  findById(id: number): Promise<NewsDomain | null>;
  findByCategory(categoryId: number): Promise<NewsDomain[]>;
  findByStatus(status: NewsStatus): Promise<NewsDomain[]>;
  findByStatusAndAuthor(status: NewsStatus, authorId: number): Promise<NewsDomain[]>;
  findByCategoryAndStatus(categoryId: number, status: NewsStatus): Promise<NewsDomain[]>;
  save(news: Partial<NewsDomain>): Promise<NewsDomain>;
  update(id: number, data: Partial<NewsDomain>): Promise<NewsDomain>;
  delete(id: number): Promise<void>;
}

export const NEWS_REPOSITORY = Symbol('NEWS_REPOSITORY');
