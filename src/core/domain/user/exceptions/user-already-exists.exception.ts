import { BusinessException } from '../../../shared/exceptions/business.exception';

export class UserAlreadyExistsException extends BusinessException {
  constructor(username: string) {
    super(`User with username '${username}' already exists`, 409);
    this.name = 'UserAlreadyExistsException';
  }
}
