import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GetCommentsByNewsUseCase } from '../../application/comment/use-cases/get-comments-by-news.use-case';
import { GetLastCommentsUseCase } from '../../application/comment/use-cases/get-last-comments.use-case';
import { CreateCommentUseCase } from '../../application/comment/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from '../../application/comment/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../../application/comment/use-cases/delete-comment.use-case';
import { CommentResponseDto } from '../../application/comment/dtos/comment-response.dto';
import { CommentCreateDto } from '../../application/comment/dtos/comment-create.dto';
import { CommentUpdateDto } from '../../application/comment/dtos/comment-update.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import type { JwtUserPayload } from '../auth/jwt.strategy';
import { UserRole } from '../../core/shared/enums/user-role.enum';

@Controller()
export class CommentsController {
  constructor(
    private readonly getCommentsByNews: GetCommentsByNewsUseCase,
    private readonly getLastComments: GetLastCommentsUseCase,
    private readonly createComment: CreateCommentUseCase,
    private readonly updateComment: UpdateCommentUseCase,
    private readonly deleteComment: DeleteCommentUseCase,
  ) {}

  @Get('comments/last')
  @UseGuards(ApprovedGuard)
  async findLast(): Promise<SuccessResponseDto<CommentResponseDto[]>> {
    const comments = await this.getLastComments.execute(3);
    return new SuccessResponseDto(
      comments.map((c) => CommentResponseDto.fromDomain(c)),
      'Last comments retrieved',
    );
  }

  @Get('news/:newsId/comments')
  @UseGuards(ApprovedGuard)
  async findByNews(
    @Param('newsId') newsId: string,
  ): Promise<SuccessResponseDto<CommentResponseDto[]>> {
    const comments = await this.getCommentsByNews.execute(newsId);
    return new SuccessResponseDto(
      comments.map((c) => CommentResponseDto.fromDomain(c)),
      'Comments retrieved',
    );
  }

  @Post('news/:newsId/comments')
  @UseGuards(ApprovedGuard)
  @HttpCode(201)
  async create(
    @Param('newsId') newsId: string,
    @Body() dto: CommentCreateDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<CommentResponseDto>> {
    const comment = await this.createComment.execute({
      newsId,
      content: dto.content,
      authorId: user.id,
    });
    return new SuccessResponseDto(CommentResponseDto.fromDomain(comment), 'Comment created', 201);
  }

  @Put('comments/:id')
  @UseGuards(ApprovedGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: CommentUpdateDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<CommentResponseDto>> {
    const comment = await this.updateComment.execute({
      id,
      content: dto.content,
      requestingUserId: user.id,
    });
    return new SuccessResponseDto(CommentResponseDto.fromDomain(comment), 'Comment updated');
  }

  @Delete('comments/:id')
  @UseGuards(ApprovedGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<null>> {
    const isAdmin = user.roles.includes(UserRole.ADMIN);
    await this.deleteComment.execute({ id, requestingUserId: user.id, isAdmin });
    return new SuccessResponseDto(null, 'Comment deleted');
  }
}
