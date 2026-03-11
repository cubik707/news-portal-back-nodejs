import { CategoryDomain } from '../../category/entities/category.domain';
import { TagDomain } from '../../tag/entities/tag.domain';
import { UserDomain } from '../../user/entities/user.domain';
import { NewsStatus } from '../../../shared/enums/news-status.enum';

export class NewsDomain {
  id: number;
  title: string;
  content: string;
  image?: string;
  author: UserDomain;
  category: CategoryDomain;
  status: NewsStatus;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: TagDomain[];
}
