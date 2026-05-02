import { NewsApproval } from '../entities/news-approval.entity';

export interface INewsApprovalRepository {
  findById(id: string): Promise<NewsApproval | null>;
  findByNewsId(newsId: string): Promise<NewsApproval[]>;
  findPendingForAdmin(adminId: string): Promise<NewsApproval[]>;
  findByEditorId(editorId: string): Promise<NewsApproval[]>;
  findActiveForNews(newsId: string): Promise<NewsApproval | null>;
  countUnseenForAdmin(adminId: string): Promise<number>;
  countUnseenForEditor(editorId: string): Promise<number>;
  insert(entity: NewsApproval): Promise<NewsApproval>;
  save(entity: NewsApproval): Promise<NewsApproval>;
}

export const NEWS_APPROVAL_REPOSITORY = Symbol('NEWS_APPROVAL_REPOSITORY');
