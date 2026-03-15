import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../../core/shared/enums/user-role.enum';

export class UpdateRoleRequestDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
