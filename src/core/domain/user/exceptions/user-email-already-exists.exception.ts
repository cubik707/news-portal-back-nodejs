import { BusinessException } from '../../../shared/exceptions/business.exception';

export class UserEmailAlreadyExistsException extends BusinessException {
  constructor(email: string) {
    super(`User with email '${email}' already exists`, 409);
    this.name = 'UserEmailAlreadyExistsException';
  }
}
