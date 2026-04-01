import { Comment } from '../../../core/domain/comment/entities/comment.domain';

export class CommentAuthorDto {
  id!: string;
  username!: string;
  firstName!: string;
  lastName!: string;
  avatarUrl?: string;
}

export class CommentResponseDto {
  id!: string;
  content!: string;
  author!: CommentAuthorDto;
  newsId!: string;
  createdAt!: Date;
  editedAt!: Date | null;

  static fromDomain(this: void, comment: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = comment.id;
    dto.content = comment.content;
    dto.author = {
      id: comment.author.id,
      username: comment.author.username,
      firstName: comment.author.firstName,
      lastName: comment.author.lastName,
      avatarUrl: comment.author.avatarUrl,
    };
    dto.newsId = comment.newsId;
    dto.createdAt = comment.createdAt;
    dto.editedAt = comment.editedAt ?? null;
    return dto;
  }
}
