import { BusinessException } from '../../../shared/exceptions/business.exception';

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super('Invalid credentials', 401);
    this.name = 'InvalidCredentialsException';
  }
}
