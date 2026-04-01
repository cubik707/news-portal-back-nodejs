import { Comment } from '../entities/comment.domain';

export interface CommentAuthorInfo {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface CommentWithNewsInfo {
  id: string;
  content: string;
  author: CommentAuthorInfo;
  newsId: string;
  newsTitle: string;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
}

export interface ICommentRepository {
  findAllByNewsId(newsId: string): Promise<Comment[]>;
  findLast(limit: number): Promise<Comment[]>;
  countByNewsId(newsId: string): Promise<number>;
  findById(id: string): Promise<Comment | null>;
  findAllByAuthorId(authorId: string): Promise<CommentWithNewsInfo[]>;
  save(comment: Comment): Promise<Comment>;
  update(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<void>;
}

export const COMMENT_REPOSITORY = Symbol('COMMENT_REPOSITORY');
