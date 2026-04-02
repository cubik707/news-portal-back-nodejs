import { Inject, Injectable } from '@nestjs/common';
import { Comment } from '../../../core/domain/comment/entities/comment.domain';
import {
  type ICommentRepository,
  COMMENT_REPOSITORY,
} from '../../../core/domain/comment/repositories/comment.repository.interface';
import { CommentNotFoundException } from '../../../core/domain/comment/exceptions/comment-not-found.exception';
import { CommentAccessDeniedException } from '../../../core/domain/comment/exceptions/comment-access-denied.exception';

export interface UpdateCommentCommand {
  id: string;
  content: string;
  requestingUserId: string;
}

@Injectable()
export class UpdateCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(command: UpdateCommentCommand): Promise<Comment> {
    const comment = await this.commentRepository.findById(command.id);
    if (!comment) throw new CommentNotFoundException(command.id);

    if (comment.author.id !== command.requestingUserId) {
      throw new CommentAccessDeniedException();
    }

    comment.updateContent(command.content);
    return this.commentRepository.update(comment);
  }
}
