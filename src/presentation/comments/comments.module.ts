import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CommentsController } from './comments.controller';
import { GetCommentsByNewsUseCase } from '../../application/comment/use-cases/get-comments-by-news.use-case';
import { GetLastCommentsUseCase } from '../../application/comment/use-cases/get-last-comments.use-case';
import { CreateCommentUseCase } from '../../application/comment/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from '../../application/comment/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../../application/comment/use-cases/delete-comment.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [CommentsController],
  providers: [
    GetCommentsByNewsUseCase,
    GetLastCommentsUseCase,
    CreateCommentUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
  ],
})
export class CommentsModule {}
