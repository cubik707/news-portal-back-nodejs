import { CategoryResponseDto } from '../../category/dtos/category-response.dto';

export class UserSubscriptionsDto {
  userId!: string;
  categories!: CategoryResponseDto[];
}
