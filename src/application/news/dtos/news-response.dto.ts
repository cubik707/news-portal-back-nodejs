import { News } from '../../../core/domain/news/entities/news.domain';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';
import { CategoryResponseDto } from '../../category/dtos/category-response.dto';
import { TagResponseDto } from '../../tag/dtos/tag-response.dto';
import { UserForNewsDto } from '../../user/dtos/user-for-news.dto';

export class NewsResponseDto {
  id!: string;
  title!: string;
  content!: string;
  image?: string;
  author!: UserForNewsDto;
  tags!: TagResponseDto[];
  status!: NewsStatus;
  publishedAt?: Date;
  category!: CategoryResponseDto;
  commentCount!: number;

  likeCount!: number;
  isLikedByCurrentUser!: boolean;

  static fromDomain(
    this: void,
    news: News,
    commentCount = 0,
    likeCount = 0,
    isLikedByCurrentUser = false,
  ): NewsResponseDto {
    const dto = new NewsResponseDto();
    dto.id = news.id;
    dto.title = news.title;
    dto.content = news.content;
    dto.image = news.image;
    dto.author = UserForNewsDto.fromDomain(news.author);
    dto.tags = news.tags.map((t) => TagResponseDto.fromDomain(t));
    dto.status = news.status;
    dto.publishedAt = news.publishedAt;
    dto.category = CategoryResponseDto.fromDomain(news.category);
    dto.commentCount = commentCount;
    dto.likeCount = likeCount;
    dto.isLikedByCurrentUser = isLikedByCurrentUser;
    return dto;
  }
}
