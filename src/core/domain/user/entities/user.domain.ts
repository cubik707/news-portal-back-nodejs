import { UserRole } from '../../../shared/enums/user-role.enum';
import { Email } from '../../../shared/value-objects/email.vo';
import { PasswordHash } from '../../../shared/value-objects/password-hash.vo';

export interface UserProps {
  id: number;
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

export class UserDomain {
  private readonly _id: number | undefined;
  private _username: string;
  private _email: Email;
  private _passwordHash: PasswordHash;
  private _isApproved: boolean;
  private _roles: UserRole[];
  private readonly _createdAt: Date;
  private _lastName: string;
  private _firstName: string;
  private _surname?: string;
  private _position?: string;
  private _department?: string;
  private _avatarUrl?: string;

  private constructor(props: Omit<UserProps, 'id'> & { id?: number }) {
    this._id = props.id;
    this._username = props.username;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._isApproved = props.isApproved;
    this._roles = [...props.roles];
    this._createdAt = props.createdAt;
    this._lastName = props.lastName;
    this._firstName = props.firstName;
    this._surname = props.surname;
    this._position = props.position;
    this._department = props.department;
    this._avatarUrl = props.avatarUrl;
  }

  /** Factory for creating a brand-new (not yet persisted) user. */
  static create(props: CreateUserProps): UserDomain {
    return new UserDomain({
      ...props,
      isApproved: false,
      roles: [],
      createdAt: new Date(),
    });
  }

  /** Factory for reconstructing a user loaded from persistence. */
  static reconstitute(props: UserProps): UserDomain {
    return new UserDomain(props);
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  get id(): number | undefined {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): Email {
    return this._email;
  }

  get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  get isApproved(): boolean {
    return this._isApproved;
  }

  get roles(): UserRole[] {
    return [...this._roles];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get lastName(): string {
    return this._lastName;
  }

  get firstName(): string {
    return this._firstName;
  }

  get surname(): string | undefined {
    return this._surname;
  }

  get position(): string | undefined {
    return this._position;
  }

  get department(): string | undefined {
    return this._department;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  // ── Business methods ───────────────────────────────────────────────────────

  approve(): void {
    this._isApproved = true;
  }

  assignRole(role: UserRole): void {
    if (!this._roles.includes(role)) {
      this._roles.push(role);
    }
  }

  removeRole(role: UserRole): void {
    this._roles = this._roles.filter((r) => r !== role);
  }

  changeEmail(email: Email): void {
    this._email = email;
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
    if (data.username !== undefined) this._username = data.username;
    if (data.lastName !== undefined) this._lastName = data.lastName;
    if (data.firstName !== undefined) this._firstName = data.firstName;
    if (data.surname !== undefined) this._surname = data.surname;
    if (data.position !== undefined) this._position = data.position;
    if (data.department !== undefined) this._department = data.department;
    if (data.avatarUrl !== undefined) this._avatarUrl = data.avatarUrl;
  }

  hasRole(role: UserRole): boolean {
    return this._roles.includes(role);
  }
}
