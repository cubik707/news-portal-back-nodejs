import { Comment } from '../entities/comment.domain';

export interface ICommentRepository {
  findAllByNewsId(newsId: string): Promise<Comment[]>;
  countByNewsId(newsId: string): Promise<number>;
  findById(id: string): Promise<Comment | null>;
  save(comment: Comment): Promise<Comment>;
  update(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<void>;
}

export const COMMENT_REPOSITORY = Symbol('COMMENT_REPOSITORY');
