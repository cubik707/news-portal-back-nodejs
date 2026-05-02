import { Like } from '../entities/like.domain';

export interface ILikeRepository {
  save(like: Like): Promise<Like>;
  delete(newsId: string, userId: string): Promise<void>;
  findByNewsAndUser(newsId: string, userId: string): Promise<Like | null>;
  findByUser(userId: string): Promise<Like[]>;
  countByNewsId(newsId: string): Promise<number>;
  countsByNewsIds(newsIds: string[]): Promise<Record<string, number>>;
  findLikedNewsIds(userId: string, newsIds: string[]): Promise<string[]>;
}

export const LIKE_REPOSITORY = Symbol('LIKE_REPOSITORY');
