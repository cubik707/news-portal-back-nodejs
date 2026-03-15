import { uuidv7 } from 'uuidv7';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Email } from '../../../shared/value-objects/email.vo';
import { PasswordHash } from '../../../shared/value-objects/password-hash.vo';
import { IPasswordHasher } from '../../../shared/ports/password-hasher.port';

export interface UserProps {
  id: string;
  username: string;
  email: Email;
  passwordHash: PasswordHash;
  isApproved: boolean;
  roles: UserRole[];
  createdAt: Date;
  lastName: string;
  firstName: string;
  surname?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
}

export interface CreateUserProps {
  username: string;
  email: Email;
  passwordHash: PasswordHash;
  lastName: string;
  firstName: string;
  surname?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  /** Factory for creating a brand-new (not yet persisted) user. */
  static create(props: CreateUserProps): User {
    return new User({
      ...props,
      id: uuidv7(),
      isApproved: false,
      roles: [],
      createdAt: new Date(),
    });
  }

  /** Factory for reconstructing a user loaded from persistence. */
  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  get id(): string {
    return this.props.id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): PasswordHash {
    return this.props.passwordHash;
  }

  get isApproved(): boolean {
    return this.props.isApproved;
  }

  get roles(): UserRole[] {
    return [...this.props.roles];
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get surname(): string | undefined {
    return this.props.surname;
  }

  get position(): string | undefined {
    return this.props.position;
  }

  get department(): string | undefined {
    return this.props.department;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  // ── Business methods ───────────────────────────────────────────────────────

  approve(): void {
    this.props.isApproved = true;
  }

  assignRole(role: UserRole): void {
    if (!this.props.roles.includes(role)) {
      this.props.roles.push(role);
    }
  }

  removeRole(role: UserRole): void {
    this.props.roles = this.props.roles.filter((r) => r !== role);
  }

  changeEmail(email: Email): void {
    this.props.email = email;
  }

  updateProfile(data: {
    username?: string;
    lastName?: string;
    firstName?: string;
    surname?: string;
    position?: string;
    department?: string;
    avatarUrl?: string;
  }): void {
    if (data.username !== undefined) this.props.username = data.username;
    if (data.lastName !== undefined) this.props.lastName = data.lastName;
    if (data.firstName !== undefined) this.props.firstName = data.firstName;
    if (data.surname !== undefined) this.props.surname = data.surname;
    if (data.position !== undefined) this.props.position = data.position;
    if (data.department !== undefined) this.props.department = data.department;
    if (data.avatarUrl !== undefined) this.props.avatarUrl = data.avatarUrl;
  }

  hasRole(role: UserRole): boolean {
    return this.props.roles.includes(role);
  }

  async validatePassword(plain: string, hasher: IPasswordHasher): Promise<boolean> {
    return hasher.compare(plain, this.props.passwordHash.getValue());
  }
}
