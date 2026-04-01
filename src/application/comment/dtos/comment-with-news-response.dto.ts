import { CommentAuthorDto } from './comment-response.dto';
import { CommentWithNewsInfo } from '../../../core/domain/comment/repositories/comment.repository.interface';

export class NewsRefDto {
  id!: string;
  title!: string;
}

export class CommentWithNewsResponseDto {
  id!: string;
  content!: string;
  author!: CommentAuthorDto;
  newsId!: string;
  news!: NewsRefDto;
  createdAt!: Date;
  editedAt!: Date | null;

  static fromProjection(item: CommentWithNewsInfo): CommentWithNewsResponseDto {
    const dto = new CommentWithNewsResponseDto();
    dto.id = item.id;
    dto.content = item.content;
    dto.author = {
      id: item.author.id,
      username: item.author.username,
      firstName: item.author.firstName,
      lastName: item.author.lastName,
      avatarUrl: item.author.avatarUrl,
    };
    // newsId (flat) mirrors news.id (nested) intentionally:
    // newsId keeps parity with CommentResponseDto for cache key lookups;
    // news.id provides a self-contained reference on the nested object.
    dto.newsId = item.newsId;
    dto.news = { id: item.newsId, title: item.newsTitle };
    dto.createdAt = item.createdAt;
    dto.editedAt = item.editedAt ?? null;
    return dto;
  }
}
