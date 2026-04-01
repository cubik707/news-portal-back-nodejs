import { Inject, Injectable } from '@nestjs/common';
import {
  type ICommentRepository,
  COMMENT_REPOSITORY,
  CommentWithNewsInfo,
} from '../../../core/domain/comment/repositories/comment.repository.interface';

@Injectable()
export class GetCommentsByAuthorUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(authorId: string): Promise<CommentWithNewsInfo[]> {
    return this.commentRepository.findAllByAuthorId(authorId);
  }
}
