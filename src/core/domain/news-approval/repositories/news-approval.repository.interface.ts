import { NewsApproval } from '../entities/news-approval.entity';

export interface INewsApprovalRepository {
  findById(id: string): Promise<NewsApproval | null>;
  findByNewsId(newsId: string): Promise<NewsApproval[]>;
  save(entity: NewsApproval): Promise<NewsApproval>;
}

export const NEWS_APPROVAL_REPOSITORY = Symbol('NEWS_APPROVAL_REPOSITORY');
