export const NEWS_VIEW_REPOSITORY = Symbol('INewsViewRepository');

export interface INewsViewRepository {
  upsert(newsId: string, userId: string): Promise<void>;
}
