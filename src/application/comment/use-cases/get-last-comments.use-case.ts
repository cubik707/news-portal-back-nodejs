import { Inject, Injectable } from '@nestjs/common';
import { Comment } from '../../../core/domain/comment/entities/comment.domain';
import {
  type ICommentRepository,
  COMMENT_REPOSITORY,
} from '../../../core/domain/comment/repositories/comment.repository.interface';

@Injectable()
export class GetLastCommentsUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(limit: number): Promise<Comment[]> {
    return await this.commentRepository.findLast(limit);
  }
}
