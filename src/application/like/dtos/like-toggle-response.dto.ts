import { ApiProperty } from '@nestjs/swagger';

export class LikeToggleResponseDto {
  @ApiProperty({ description: 'Whether the current user now likes this article', example: true })
  isLiked!: boolean;

  @ApiProperty({ description: 'Updated total like count for this article', example: 42 })
  likeCount!: number;
}
