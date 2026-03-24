import { Inject, Injectable } from '@nestjs/common';
import { Comment } from '../../../core/domain/comment/entities/comment.domain';
import {
  type ICommentRepository,
  COMMENT_REPOSITORY,
} from '../../../core/domain/comment/repositories/comment.repository.interface';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';

export interface CreateCommentCommand {
  newsId: string;
  content: string;
  authorId: string;
}

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<Comment> {
    const news = await this.newsRepository.findById(command.newsId);
    if (!news) throw new NewsNotFoundException(command.newsId);

    const author = await this.userRepository.findById(command.authorId);

    const comment = Comment.create({
      content: command.content,
      author: author!,
      newsId: command.newsId,
    });

    return this.commentRepository.save(comment);
  }
}
