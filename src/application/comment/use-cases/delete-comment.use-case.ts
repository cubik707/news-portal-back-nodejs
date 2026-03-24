import { Inject, Injectable } from '@nestjs/common';
import {
  type ICommentRepository,
  COMMENT_REPOSITORY,
} from '../../../core/domain/comment/repositories/comment.repository.interface';
import { CommentNotFoundException } from '../../../core/domain/comment/exceptions/comment-not-found.exception';
import { CommentAccessDeniedException } from '../../../core/domain/comment/exceptions/comment-access-denied.exception';

export interface DeleteCommentCommand {
  id: string;
  requestingUserId: string;
  isAdmin: boolean;
}

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentRepository.findById(command.id);
    if (!comment) throw new CommentNotFoundException(command.id);

    const isOwner = comment.author.id === command.requestingUserId;
    if (!isOwner && !command.isAdmin) {
      throw new CommentAccessDeniedException();
    }

    await this.commentRepository.delete(command.id);
  }
}
