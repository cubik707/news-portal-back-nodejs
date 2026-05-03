import { IsOptional, IsString } from 'class-validator';

export class UserAvatarUpdateDto {
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
