import { UserRole } from '../../../core/shared/enums/user-role.enum';

export class UserResponseDto {
  id!: string;
  username!: string;
  email!: string;
  lastName!: string;
  firstName!: string;
  surname?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  isApproved!: boolean;
  roles!: UserRole[];
}
