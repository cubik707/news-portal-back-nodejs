import { UserRole } from '../../../shared/enums/user-role.enum';

export class UserDomain {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  isApproved: boolean;
  roles: UserRole[];
  createdAt: Date;

  // Profile fields (from UserInfo)
  lastName: string;
  firstName: string;
  surname?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }
}
