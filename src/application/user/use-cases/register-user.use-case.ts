import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../../../core/domain/user/entities/user.domain';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { UserAlreadyExistsException } from '../../../core/domain/user/exceptions/user-already-exists.exception';
import { UserEmailAlreadyExistsException } from '../../../core/domain/user/exceptions/user-email-already-exists.exception';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import { EmailService } from '../../../infrastructure/email/email.service';

export interface RegisterUserCommand {
  username: string;
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  surname?: string;
  position?: string;
  department?: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const existingByUsername = await this.userRepository.findByUsername(command.username);
    if (existingByUsername) {
      throw new UserAlreadyExistsException(command.username);
    }

    const existingByEmail = await this.userRepository.findByEmail(command.email);
    if (existingByEmail) {
      throw new UserEmailAlreadyExistsException(command.email);
    }

    const passwordHash = await bcrypt.hash(command.password, 10);

    const user = User.create({
      username: command.username,
      email: new Email(command.email),
      passwordHash: PasswordHash.fromHash(passwordHash),
      lastName: command.lastName,
      firstName: command.firstName,
      surname: command.surname,
      position: command.position,
      department: command.department,
    });

    const saved = await this.userRepository.save(user);

    await this.emailService.sendHtmlMessage(
      command.email,
      'Registration Successful',
      `<p>Hello ${command.firstName}, your account has been created. Please wait for admin approval.</p>`,
    );

    return saved;
  }
}
