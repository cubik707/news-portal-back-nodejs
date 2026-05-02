import { BusinessException } from '../../../shared/exceptions/business.exception';

export class AmendmentNotPendingException extends BusinessException {
  constructor() {
    super('Amendment is not in PENDING status', 409);
    this.name = 'AmendmentNotPendingException';
  }
}
